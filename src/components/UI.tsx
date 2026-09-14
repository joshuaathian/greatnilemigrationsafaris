import { useState } from "react";
import { Link } from "react-router-dom";
import type { Safari } from "../types";
export function Photo({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed || !src ? (
    <div className="image-fallback" role="img" aria-label={alt}>
      Photograph awaiting company upload
    </div>
  ) : (
    <img
      className="photo"
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
export function PageHead({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-head">
      <p className="eyebrow">{label}</p>
      <h1>{title}</h1>
      {children}
    </header>
  );
}
export function Status({
  loading,
  error,
  empty,
}: {
  loading?: boolean;
  error?: string;
  empty?: boolean;
}) {
  return loading ? (
    <p role="status">Loading…</p>
  ) : error ? (
    <p role="alert" className="notice">
      {error}
    </p>
  ) : empty ? (
    <p className="notice">
      Nothing published here yet. Please check back for updates.
    </p>
  ) : null;
}
export function SafariCard({ s }: { s: Safari }) {
  return (
    <article className="safari-card">
      <Link to={"/safaris/" + s.slug}>
        <Photo src={s.cover_image_url} alt={s.title} />
      </Link>
      <div>
        <p className="eyebrow">
          {s.duration_days
            ? `${s.duration_days} days`
            : "Duration to be confirmed"}
        </p>
        <h2>{s.title}</h2>
        <p>{s.short_description}</p>
        <p>{s.destinations.join(" · ")}</p>
        <p>
          {s.show_price && s.price_from != null
            ? `${s.currency} ${s.price_from}`
            : "Request a Quote"}
        </p>
        <Link className="button" to={"/safaris/" + s.slug}>
          View Itinerary
        </Link>{" "}
        <Link to={"/book?safari=" + s.id}>Book This Safari →</Link>
      </div>
    </article>
  );
}
