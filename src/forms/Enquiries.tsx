import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { db, unavailable } from "../services/supabase";
import { useSettings } from "../components/Layout";
import { PageHead } from "../components/UI";
import { useData } from "../hooks/useData";
import type { Safari } from "../types";
export function Field({
  name,
  label,
  type = "text",
  required = true,
  min,
  max,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  min?: string | number;
  max?: number;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        maxLength={type === "number" ? undefined : 200}
      />
    </label>
  );
}
export function Contact() {
  const s = useSettings();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (!db) {
      setMessage(unavailable);
      return;
    }
    const form = e.currentTarget;
    setBusy(true);
    try {
      const { error } = await db
        .from("contact_enquiries")
        .insert(Object.fromEntries(new FormData(form)));
      if (error) throw error;
      form.reset();
      setMessage("Thank you. Your enquiry has been received.");
    } catch {
      setMessage("Your message could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHead label="Contact" title="Let’s plan the journey." />
      <section className="section split">
        <aside>
          {[s.phone_number, s.email_address, s.office_address, s.business_hours]
            .filter(Boolean)
            .map((x) => (
              <p key={x}>{x}</p>
            ))}
          {!s.email_address && (
            <p>Company contact details are awaiting confirmation.</p>
          )}
          <div className="notice">Office map awaiting a verified location.</div>
        </aside>
        <form onSubmit={submit}>
          <Field name="full_name" label="Full name" />
          <Field name="email" label="Email" type="email" />
          <Field name="phone" label="Phone number" required={false} />
          <Field name="subject" label="Subject" />
          <label>
            Message
            <textarea name="message" required maxLength={10000} />
          </label>
          <button disabled={busy || !db}>
            {busy ? "Sending…" : "Send enquiry"}
          </button>
          {!db && (
            <p className="notice">
              Enquiries are not available until the service is connected.
            </p>
          )}
          <p role="status">{message}</p>
        </form>
      </section>
    </>
  );
}
export function Book() {
  const s = useSettings();
  const { data } = useData<Safari>("itineraries");
  const [params] = useSearchParams();
  const [flex, setFlex] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [url, setUrl] = useState("");
  const ready = /^[1-9]\d{6,14}$/.test(s.whatsapp_number);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !ready) return;
    setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const row = {
      ...f,
      flexible_dates: flex,
      adults: Number(f.adults),
      children: Number(f.children),
      preferred_date: flex ? null : f.preferred_date,
      itinerary_id: f.itinerary_id || null,
    };
    delete (row as Record<string, unknown>).terms;
    const text = `Hello Great Nile Migration Safaris,\n\nMy name is ${f.full_name} from ${f.country}.\n\nI am interested in:\nSafari: ${data.find((i) => i.id === f.itinerary_id)?.title || "Tailor-made enquiry"}\nPreferred date: ${flex ? "Flexible" : f.preferred_date}\nAdults: ${f.adults}\nChildren: ${f.children}\nAccommodation preference: ${f.accommodation_preference}\n\nSpecial requirements: ${f.special_requirements}\nAdditional message: ${f.message}\n\nMy contact details:\nEmail: ${f.email}\nPhone: ${f.phone}\n\nPlease confirm availability and provide the full quotation.`;
    let saved = false;
    try {
      if (db) {
        const { error } = await db.from("booking_enquiries").insert(row);
        saved = !error;
      }
    } catch {}
    const link = `https://wa.me/${s.whatsapp_number}?text=${encodeURIComponent(text)}`;
    setUrl(link);
    setMessage(
      saved
        ? "Your enquiry has been saved. Continue to WhatsApp to send it to the team."
        : "The enquiry could not be saved here. You can still continue to WhatsApp.",
    );
    setBusy(false);
  }
  return (
    <>
      <PageHead label="Booking enquiry" title="Your journey begins here." />
      <div className="prose">
        <p className="notice">
          Sending an enquiry does not confirm a reservation. The safari team
          will confirm availability, pricing, payment requirements and final
          booking terms.
        </p>
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field name="full_name" label="Full name" />
            <Field name="email" label="Email" type="email" />
            <Field name="phone" label="Phone number" type="tel" />
            <Field name="country" label="Country" />
          </div>
          <label>
            Selected safari
            <select
              name="itinerary_id"
              defaultValue={params.get("safari") || ""}
            >
              <option value="">Tailor-made enquiry</option>
              {data
                .filter((x) => x.status === "published")
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={flex}
              onChange={(e) => setFlex(e.target.checked)}
            />
            My dates are flexible
          </label>
          {!flex && (
            <Field
              name="preferred_date"
              label="Preferred arrival date"
              type="date"
              min={new Date().toLocaleDateString("en-CA")}
            />
          )}
          <div className="form-grid">
            <Field
              name="adults"
              label="Adults"
              type="number"
              min={1}
              max={100}
            />
            <Field
              name="children"
              label="Children"
              type="number"
              min={0}
              max={100}
            />
          </div>
          <Field
            name="accommodation_preference"
            label="Accommodation preference"
            required={false}
          />
          <label>
            Special requirements
            <textarea name="special_requirements" maxLength={2000} />
          </label>
          <label>
            Additional message
            <textarea name="message" maxLength={5000} />
          </label>
          <label className="check">
            <input type="checkbox" name="terms" required />
            <span>
              I agree to the <Link to="/booking-terms">Booking Terms</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>.
            </span>
          </label>
          <button disabled={!ready || busy || !!url}>
            {busy ? "Preparing…" : "Prepare WhatsApp enquiry"}
          </button>
          {!ready && (
            <p className="notice">
              Online booking enquiries are temporarily unavailable. Please use
              the <Link to="/contact">contact page</Link>.
            </p>
          )}
          <p role="status">{message}</p>
          {url && (
            <a className="button" target="_blank" rel="noreferrer" href={url}>
              Continue to WhatsApp ↗
            </a>
          )}
        </form>
      </div>
    </>
  );
}
