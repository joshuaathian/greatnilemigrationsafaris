import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Field } from "./Enquiries";
import { categories } from "../config/content";
import { db, unavailable } from "../services/supabase";
import { PageHead } from "../components/UI";
import {useData} from '../hooks/useData';
import type {Safari} from '../types';
export function Upload() {
  const {data:safaris}=useData<Safari>('itineraries');
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || busy) return;
    if (!db) {
      setMessage(unavailable);
      return;
    }
    const form = e.currentTarget;
    setBusy(true);
    try {
      const body = new FormData(form);
      const { error } = await db.functions.invoke("submit-photo", { body });
      if (error) throw error;
      form.reset();
      setFile(null);
      setSuccess(true);
    } catch {
      setMessage("Your photograph could not be submitted. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHead
        label="Guest photography"
        title="Share a moment from your journey."
      />
      <div className="prose">
        {success ? (
          <p role="status" className="notice">
            Thank you for sharing your photograph. It has been submitted for
            review. If approved, it may appear in the Great Nile Migration
            Safaris gallery.
          </p>
        ) : (
          <form onSubmit={submit}>
            <label>Safari attended (optional)<select name="itinerary_id"><option value="">Not specified</option>{safaris.filter(s=>s.status==='published').map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
            <Field name="guest_name" label="Full name" />
            <Field name="guest_email" label="Email" type="email" />
            <Field
              name="safari_date"
              label="Safari date"
              type="date"
              required={false}
            />
            <label>
              Photograph · JPG, PNG or WebP · maximum 10 MB
              <input
                type="file"
                name="photo"
                required
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(null);
                  setMessage("");
                  if (!f) return;
                  if (
                    !["image/jpeg", "image/png", "image/webp"].includes(
                      f.type,
                    ) ||
                    f.size > 10485760 ||
                    f.size === 0
                  ) {
                    e.target.value = "";
                    setMessage(
                      "Choose a JPG, PNG or WebP photograph between 1 byte and 10 MB.",
                    );
                    return;
                  }
                  setFile(f);
                }}
              />
            </label>
            {preview && (
              <img
                className="upload-preview"
                src={preview}
                alt="Selected photograph preview"
              />
            )}
            <label>
              Caption
              <textarea name="caption" required maxLength={2000} />
            </label>
            <label>
              Category
              <select name="category">
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <Field
              name="photographer_credit"
              label="Photographer credit"
              required={false}
            />
            <label className="check">
              <input name="display_credit" type="checkbox" />
              Display my photographer credit
            </label>
            <label className="check">
              <input name="consent_to_publish" type="checkbox" required />I give
              permission to review and potentially display this photograph.
            </label>
            <label className="check">
              <input name="accepted_terms" type="checkbox" required />
              <span>
                I agree to the{" "}
                <Link to="/photo-submission-terms">Photo Submission Terms</Link>
                .
              </span>
            </label>
            <button disabled={busy || !file || !db}>
              {busy ? "Uploading…" : "Submit for review"}
            </button>
            {!db && (
              <p className="notice">
                Photo submissions are not available until storage is connected.
              </p>
            )}
            <p role="alert">{message}</p>
          </form>
        )}
      </div>
    </>
  );
}
