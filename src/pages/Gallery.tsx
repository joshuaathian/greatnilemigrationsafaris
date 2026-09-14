import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../hooks/useData";
import { db } from "../services/supabase";
import { categories } from "../config/content";
import { PageHead, Photo, Status } from "../components/UI";
import type { Photo as Image } from "../types";
export function Gallery() {
  const { data, loading, error } = useData<Image>("gallery_images");
  const [category, setCategory] = useState("All");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const images = data.filter(
    (p) =>
      p.published &&
      p.status === "approved" &&
      (category === "All" || p.category === category),
  );
  useEffect(() => {
    if (!db) return;
    let active = true;
    Promise.all(
      data
        .filter((p) => p.published && p.status === "approved")
        .map(async (p) => {
          const { data } = await db!.storage
            .from("safari-gallery")
            .createSignedUrl(p.storage_path, 300);
          return [p.id, data?.signedUrl || ""];
        }),
    ).then((rows) => {
      if (active) setUrls(Object.fromEntries(rows));
    });
    return () => {
      active = false;
    };
  }, [data]);
  return (
    <>
      <PageHead label="Photography" title="Notes from the field." />
      <section className="section">
        <div className="filters">
          {["All", ...categories].map((c) => (
            <button
              aria-pressed={c === category}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <Status
          loading={loading}
          error={error}
          empty={!loading && !images.length}
        />
        <div className="gallery">
          {images.map((p, i) => (
            <figure key={p.id}>
              <button
                className="image-button"
                onClick={() => {
                  setIndex(i);
                  dialog.current?.showModal();
                }}
                aria-label={"Enlarge " + p.alt_text}
              >
                <Photo src={urls[p.id] || ""} alt={p.alt_text} />
              </button>
              <figcaption>
                {p.caption}
                {p.photographer_name && (
                  <small>Photograph: {p.photographer_name}</small>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
        <Link className="button" to="/submit-photo">
          Share Your Safari Photographs
        </Link>
      </section>
      <dialog
        ref={dialog}
        className="lightbox"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
          if (e.key === "ArrowLeft")
            setIndex((i) => (i - 1 + images.length) % images.length);
        }}
      >
        <button autoFocus onClick={() => dialog.current?.close()}>
          Close ×
        </button>
        {images[index] && (
          <>
            <Photo
              src={urls[images[index].id] || ""}
              alt={images[index].alt_text}
            />
            <p>{images[index].caption}</p>
            <button
              onClick={() =>
                setIndex((i) => (i - 1 + images.length) % images.length)
              }
            >
              ← Previous
            </button>
            <button onClick={() => setIndex((i) => (i + 1) % images.length)}>
              Next →
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
