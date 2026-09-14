import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { db } from "../services/supabase";
import { useData } from "../hooks/useData";
import { Field } from "../forms/Enquiries";
import { Status } from "../components/UI";
import { CompanyUpload } from "../forms/CompanyUpload";
export function Login() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const { error } = await db.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("password")),
    });
    setBusy(false);
    if (error) setMessage("Sign-in failed. Check your email and password.");
    else setDone(true);
  }
  if (done) return <Navigate to="/admin" replace />;
  return (
    <div className="admin-login">
      <Link to="/">← Return to website</Link>
      <h1>Administrator sign in</h1>
      <form onSubmit={submit}>
        <Field name="email" label="Email" type="email" />
        <Field name="password" label="Password" type="password" />
        <button disabled={!db || busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p role="alert">{message}</p>
        {!db && (
          <p className="notice">
            Administration is unavailable until Supabase is configured. No
            account or password has been created.
          </p>
        )}
      </form>
    </div>
  );
}
export function Guard() {
  const [state, setState] = useState("loading");
  useEffect(() => {
    if (!db) {
      setState("login");
      return;
    }
    let active = true;
    async function check() {
      const {
        data: { user },
      } = await db!.auth.getUser();
      if (!user) {
        if (active) setState("login");
        return;
      }
      const { data, error } = await db!
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (active)
        setState(!error && data?.role === "admin" ? "admin" : "denied");
    }
    void check();
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange(() => {
      setTimeout(() => void check(), 0);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  if (state === "loading")
    return (
      <p className="section" role="status">
        Checking your session…
      </p>
    );
  if (state === "login") return <Navigate to="/admin/login" replace />;
  if (state === "denied")
    return (
      <div className="section">
        <h1>Unauthorized</h1>
        <p>Your account does not have administrator access.</p>
        <Link to="/">Return Home</Link>
      </div>
    );
  return (
    <div className="admin-shell">
      <aside>
        <Link to="/">← Website</Link>
        <h2>Safari office</h2>
        {["", "submissions", "gallery", "itineraries", "settings"].map((p) => (
          <Link key={p} to={"/admin" + (p ? "/" + p : "")}>
            {p || "Overview"}
          </Link>
        ))}
        <button onClick={() => void db?.auth.signOut()}>Sign out</button>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
type Row = Record<string, any>;
const tables: Record<string, string> = {
  submissions: "photo_submissions",
  gallery: "gallery_images",
  itineraries: "itineraries",
  settings: "website_settings",
};
export function AdminOverview() {
  const a = useData<Row>("photo_submissions"),
    b = useData<Row>("gallery_images"),
    c = useData<Row>("itineraries"),
    d = useData<Row>("booking_enquiries"),
    e = useData<Row>("contact_enquiries");
  return (
    <>
      <h1>Safari office</h1>
      <p>
        Review submissions, manage journeys and keep company information
        current.
      </p>
      <dl className="counts">
        <div>
          <dt>Pending photographs</dt>
          <dd>{a.data.filter((x) => x.status === "pending").length}</dd>
        </div>
        <div>
          <dt>Published photographs</dt>
          <dd>{b.data.filter((x) => x.published).length}</dd>
        </div>
        <div>
          <dt>Published itineraries</dt>
          <dd>{c.data.filter((x) => x.status === "published").length}</dd>
        </div>
      </dl>
      {[
        ["Booking enquiries", d],
        ["Contact enquiries", e],
      ].map(([name, result]) => (
        <section key={name as string}>
          <h2>{name as string}</h2>
          <Status
            loading={(result as typeof d).loading}
            error={(result as typeof d).error}
            empty={!(result as typeof d).data.length}
          />
          {(result as typeof d).data
            .slice(-10)
            .reverse()
            .map((r) => (
              <article className="admin-row" key={r.id}>
                <b>{r.full_name}</b>
                <p>
                  {r.email} · {r.subject || r.country}
                </p>
                <p>{r.message}</p>
              </article>
            ))}
        </section>
      ))}
    </>
  );
}
export function AdminRecords() {
  const name = useLocation().pathname.split("/").pop()!;
  return <Records key={name} name={name} />;
}
function Records({ name }: { name: string }) {
  const table = tables[name];
  const { data, loading, error, reload } = useData<Row>(table);
  const [edit, setEdit] = useState<Row | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState("");
  async function action(row: Row, operation: string) {
    if (!db || busy) return;
    if (
      operation === "delete" &&
      !window.confirm(
        "Permanently delete this photograph and its stored file? This cannot be undone.",
      )
    )
      return;
    setBusy(true);
    try {
      const { error } = await db.functions.invoke("manage-photo", {
        body: {
          id: row.id,
          table,
          operation,
          alt_text: row.alt_text || row.caption,
          rejection_note:
            operation === "reject"
              ? window.prompt("Internal rejection note (optional)") || ""
              : undefined,
        },
      });
      if (error) throw error;
      setMessage("Photograph updated.");
      reload();
    } catch {
      setMessage("The change could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!db || !edit) return;
    setBusy(true);
    try {
      const values = { ...edit };
      delete values.created_at;
      delete values.updated_at;
      const { error } = await db.from(table).upsert(values);
      if (error) throw error;
      setEdit(null);
      setMessage("Changes saved.");
      reload();
    } catch {
      setMessage(
        "Changes could not be saved. Check the field values and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const editable = edit
    ? Object.keys(edit).filter(
        (k) =>
          ![
            "id",
            "created_at",
            "updated_at",
            "storage_path",
            "public_url",
            "reviewed_by",
            "reviewed_at",
            "submission_id",
            "singleton",
          ].includes(k),
      )
    : [];
  return (
    <>
      <h1>{name[0].toUpperCase() + name.slice(1)}</h1>
      {name === "gallery" && <CompanyUpload onSaved={reload} />}
      <Status loading={loading} error={error} empty={!data.length} />
      <p role="status">{message}</p>
      {name === "itineraries" && (
        <button
          onClick={() =>
            setEdit({
              title: "Draft itinerary",
              slug: "new-" + Date.now(),
              short_description: "",
              overview: "",
              destinations: [],
              highlights: [],
              included_items: [],
              excluded_items: [],
              packing_list: [],
              duration_days: null,
              duration_nights: null,
              starting_location: "",
              accommodation: "",
              meals: "",
              transport: "",
              group_size: "",
              important_information: "",
              price_from: null,
              currency: "USD",
              show_price: false,
              cover_image_url: "",
              status: "draft",
              featured: false,
              display_order: 0,
            })
          }
        >
          Create itinerary
        </button>
      )}
      {data.map((row) => (
        <article className="admin-row" key={row.id}>
          <b>
            {row.title || row.guest_name || row.company_name || row.caption}
          </b>
          <p>
            {row.status || ""}
            {row.published ? " · Published" : ""}
          </p>
          <button onClick={() => setEdit(row)}>Edit</button>
          {name === "submissions" && (
            <>
              <button
                disabled={busy}
                onClick={async () => {
                  const { data } = await db!.storage
                    .from("guest-submissions")
                    .createSignedUrl(row.storage_path, 60);
                  setPreview(data?.signedUrl || "");
                }}
              >
                Preview
              </button>
              <button
                disabled={busy}
                onClick={() => void action(row, "approve")}
              >
                Approve
              </button>
              <button
                disabled={busy}
                onClick={() => void action(row, "reject")}
              >
                Reject
              </button>
            </>
          )}
          {name === "gallery" && (
            <button
              disabled={busy}
              onClick={() =>
                void action(row, row.published ? "unpublish" : "publish")
              }
            >
              {row.published ? "Unpublish" : "Publish"}
            </button>
          )}
          {["gallery", "submissions"].includes(name) && (
            <button disabled={busy} onClick={() => void action(row, "delete")}>
              Delete permanently
            </button>
          )}
        </article>
      ))}
      {preview && (
        <div>
          <button onClick={() => setPreview("")}>Close preview</button>
          <img
            className="upload-preview"
            src={preview}
            alt="Private submission preview"
          />
        </div>
      )}
      {edit && (
        <form className="editor" onSubmit={save}>
          <h2>Edit record</h2>
          {editable.map((k) => (
            <label key={k}>
              {k.replaceAll("_", " ")}
              {typeof edit[k] === "boolean" ? (
                <input
                  type="checkbox"
                  checked={edit[k]}
                  onChange={(e) => setEdit({ ...edit, [k]: e.target.checked })}
                />
              ) : Array.isArray(edit[k]) ? (
                <textarea
                  value={edit[k].join("\n")}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      [k]: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              ) : (
                <textarea
                  value={edit[k] ?? ""}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      [k]: [
                        "price_from",
                        "duration_days",
                        "duration_nights",
                        "display_order",
                      ].includes(k)
                        ? e.target.value === ""
                          ? null
                          : Number(e.target.value)
                        : e.target.value,
                    })
                  }
                />
              )}
            </label>
          ))}
          <button disabled={busy}>Save changes</button>
          <button type="button" onClick={() => setEdit(null)}>
            Cancel
          </button>
          {name === "itineraries" && edit.id && <Days itinerary={edit.id} />}
        </form>
      )}
    </>
  );
}
function Days({ itinerary }: { itinerary: string }) {
  const { data, reload } = useData<Row>("itinerary_days");
  const [message, setMessage] = useState("");
  async function add() {
    const rows = data.filter((x) => x.itinerary_id === itinerary);
    const { error } = await db!
      .from("itinerary_days")
      .insert({
        itinerary_id: itinerary,
        day_number: Math.max(0, ...rows.map((x) => x.day_number)) + 1,
        title: "Day details to be added",
        description: "",
      });
    setMessage(error ? "Could not add day." : "Day added.");
    reload();
  }
  return (
    <section>
      <h2>Itinerary days</h2>
      {data
        .filter((x) => x.itinerary_id === itinerary)
        .sort((a, b) => a.day_number - b.day_number)
        .map((row) => (
          <div key={row.id}>
            <button
              type="button"
              onClick={async () => {
                const { error } = await db!.rpc("move_itinerary_day", {
                  day_id: row.id,
                  direction: -1,
                });
                setMessage(error ? "Could not move day." : "Day moved.");
                reload();
              }}
            >
              Move day up
            </button>
            <button
              type="button"
              onClick={async () => {
                const { error } = await db!.rpc("move_itinerary_day", {
                  day_id: row.id,
                  direction: 1,
                });
                setMessage(error ? "Could not move day." : "Day moved.");
                reload();
              }}
            >
              Move day down
            </button>
            <label>
              Day {row.day_number} title
              <input
                defaultValue={row.title}
                onBlur={async (e) => {
                  const { error } = await db!
                    .from("itinerary_days")
                    .update({ title: e.target.value })
                    .eq("id", row.id);
                  setMessage(error ? "Could not save day." : "Day saved.");
                }}
              />
            </label>
            <label>
              Description
              <textarea
                defaultValue={row.description}
                onBlur={async (e) => {
                  const { error } = await db!
                    .from("itinerary_days")
                    .update({ description: e.target.value })
                    .eq("id", row.id);
                  setMessage(
                    error
                      ? "Could not save description."
                      : "Description saved.",
                  );
                }}
              />
            </label>
          </div>
        ))}
      <button type="button" onClick={() => void add()}>
        Add itinerary day
      </button>
      <p role="status">{message}</p>
    </section>
  );
}
