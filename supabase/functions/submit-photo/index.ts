import { createClient } from "npm:@supabase/supabase-js@2";
const headers = {
  "Access-Control-Allow-Origin":
    Deno.env.get("SITE_ORIGIN") || "http://localhost:5173",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers });
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  let path = "";
  try {
    const length = Number(request.headers.get("content-length"));
    if (length > 11000000) throw Error("Upload too large");
    const form = await request.formData();
    const file = form.get("photo");
    if (!(file instanceof File) || file.size < 1 || file.size > 10485760)
      throw Error("Invalid photograph size");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every(
      (v, i) => bytes[i] === v,
    );
    const webp =
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    const mime = jpeg
      ? "image/jpeg"
      : png
        ? "image/png"
        : webp
          ? "image/webp"
          : "";
    if (!mime || file.type !== mime) throw Error("Choose a JPG, PNG or WebP");
    const name = String(form.get("guest_name") || "").trim(),
      email = String(form.get("guest_email") || "").trim(),
      caption = String(form.get("caption") || "").trim();
    if (
      !name ||
      name.length > 200 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      email.length > 254 ||
      caption.length > 2000 ||
      !caption
    )
      throw Error("Check your submission details");
    if (
      form.get("accepted_terms") !== "on" ||
      form.get("consent_to_publish") !== "on"
    )
      throw Error("Consent is required");
    path = `${crypto.randomUUID()}.${jpeg ? "jpg" : png ? "png" : "webp"}`;
    const { error: upload } = await client.storage
      .from("guest-submissions")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (upload) throw upload;
    const { error: insert } = await client
      .from("photo_submissions")
      .insert({
        guest_name: name,
        guest_email: email,
        safari_date: form.get("safari_date") || null,
        storage_path: path,
        original_filename: file.name.slice(0, 255),
        file_size: file.size,
        mime_type: mime,
        caption,
        category: String(form.get("category")),
        photographer_credit: String(
          form.get("photographer_credit") || "",
        ).slice(0, 200),
        display_credit: form.get("display_credit") === "on",
        consent_to_publish: true,
        accepted_terms: true,
        status: "pending",
      });
    if (insert) throw insert;
    return Response.json({ submitted: true }, { headers });
  } catch (error) {
    if (path) await client.storage.from("guest-submissions").remove([path]);
    return Response.json(
      { error: error instanceof Error ? error.message : "Submission failed" },
      { status: 400, headers },
    );
  }
});
