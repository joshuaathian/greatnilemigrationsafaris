import { useState } from "react";
import { db } from "../services/supabase";
import { categories } from "../config/content";
import { Field } from "./Enquiries";
export function CompanyUpload({ onSaved }: { onSaved: () => void }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !db) return;
    setBusy(true);
    const form = e.currentTarget,
      f = new FormData(form),
      file = f.get("photo") as File;
    let path = "";
    try {
      if (
        !file ||
        file.size > 10485760 ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
        throw Error();
      path = `company/${crypto.randomUUID()}.${file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp"}`;
      const { error: upload } = await db.storage
        .from("safari-gallery")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upload) throw upload;
      const { error } = await db
        .from("gallery_images")
        .insert({
          storage_path: path,
          title: f.get("title"),
          caption: f.get("caption"),
          alt_text: f.get("alt_text"),
          photographer_name: f.get("photographer_name"),
          category: f.get("category"),
          source_type: "company",
          status: "approved",
          published: false,
        });
      if (error) throw error;
      form.reset();
      setMessage("Photograph saved, ready for review and publication.");
      onSaved();
    } catch {
      if (path) await db.storage.from("safari-gallery").remove([path]);
      setMessage(
        "The photograph could not be saved. Check its format and size.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details>
      <summary>Upload company photograph</summary>
      <form onSubmit={submit}>
        <label>
          Photograph · maximum 10 MB
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </label>
        <Field name="title" label="Title" />
        <Field name="alt_text" label="Accessible description" />
        <Field name="caption" label="Caption" />
        <Field
          name="photographer_name"
          label="Photographer credit"
          required={false}
        />
        <label>
          Category
          <select name="category">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button disabled={busy}>
          {busy ? "Uploading…" : "Save unpublished photograph"}
        </button>
        <p role="status">{message}</p>
      </form>
    </details>
  );
}
