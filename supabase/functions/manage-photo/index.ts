import { createClient } from "npm:@supabase/supabase-js@2";
const headers = {
  "Access-Control-Allow-Origin":
    Deno.env.get("SITE_ORIGIN") || "http://localhost:5173",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST")
    return new Response(null, { status: 405, headers });
  const url = Deno.env.get("SUPABASE_URL")!,
    key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const client = createClient(url, key);
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!token) return new Response("Unauthorized", { status: 401, headers });
    const {
      data: { user },
      error,
    } = await client.auth.getUser(token);
    if (error || !user)
      return new Response("Unauthorized", { status: 401, headers });
    const { data: profile } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin")
      return new Response("Forbidden", { status: 403, headers });
    const { table, id, operation, alt_text, rejection_note } = await req.json();
    if (!["photo_submissions", "gallery_images"].includes(table))
      throw Error("Invalid table");
    const { data: row, error: readError } = await client
      .from(table)
      .select("*")
      .eq("id", id)
      .single();
    if (readError || !row) throw Error("Photograph not found");
    const run = async (p: any) => {
      const r = await p;
      if (r.error) throw r.error;
      return r;
    };
    if (operation === "approve" && table === "photo_submissions") {
      if (!row.accepted_terms || !row.consent_to_publish)
        throw Error("Consent required");
      if (!alt_text?.trim())
        throw Error("Accessible image description required");
      const path = `guest/${row.id}.${row.storage_path.split(".").pop()}`;
      const { data: file } = await run(
        client.storage.from("guest-submissions").download(row.storage_path),
      );
      await run(
        client.storage
          .from("safari-gallery")
          .upload(path, file, { contentType: row.mime_type, upsert: true }),
      );
      await run(
        client
          .from("gallery_images")
          .upsert(
            {
              submission_id: row.id,
              storage_path: path,
              alt_text,
              caption: row.caption,
              category: row.category,
              photographer_name: row.display_credit
                ? row.photographer_credit
                : "",
              source_type: "guest",
              status: "approved",
              published: false,
            },
            { onConflict: "submission_id" },
          ),
      );
      await run(
        client
          .from("photo_submissions")
          .update({
            status: "approved",
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", id),
      );
    } else if (operation === "reject" && table === "photo_submissions") {
      if (row.status === "approved")
        throw Error("Unpublish the approved gallery image first");
      await run(
        client
          .from(table)
          .update({
            status: "rejected",
            rejection_note,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", id),
      );
    } else if (
      ["publish", "unpublish"].includes(operation) &&
      table === "gallery_images"
    ) {
      if (
        operation === "publish" &&
        (row.status !== "approved" || !row.alt_text?.trim())
      )
        throw Error("Approval and image description required");
      await run(
        client
          .from(table)
          .update({ published: operation === "publish" })
          .eq("id", id),
      );
    } else if (operation === "delete") {
      if (table === "photo_submissions") {
        const { data: gallery } = await run(
          client.from("gallery_images").select("*").eq("submission_id", id),
        );
        for (const g of gallery) {
          await run(
            client
              .from("gallery_images")
              .update({ published: false })
              .eq("id", g.id),
          );
          await run(
            client.storage.from("safari-gallery").remove([g.storage_path]),
          );
          await run(client.from("gallery_images").delete().eq("id", g.id));
        }
      } else
        await run(client.from(table).update({ published: false }).eq("id", id));
      await run(
        client.storage
          .from(
            table === "photo_submissions"
              ? "guest-submissions"
              : "safari-gallery",
          )
          .remove([row.storage_path]),
      );
      await run(client.from(table).delete().eq("id", id));
    } else throw Error("Unsupported operation");
    return Response.json({ ok: true }, { headers });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Operation failed" },
      { status: 400, headers },
    );
  }
});
