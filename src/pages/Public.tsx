import { Link, useParams } from "react-router-dom";
import { PageHead, SafariCard, Status } from "../components/UI";
import { useData } from "../hooks/useData";
import { stories } from "../config/content";
import type { Safari } from "../types";
import {GalleryPreview} from '../components/GalleryPreview';
export function Home() {
  const { data, loading, error } = useData<Safari>(
    "itineraries",
    "*,itinerary_days(*)",
  );
  return (
    <>
      <section className="hero">
        <p className="eyebrow">South Sudan / A different kind of journey</p>
        <h1>Witness the World’s Greatest Untold Wildlife Migration</h1>
        <p>
          Journey into South Sudan’s vast wilderness and experience one of
          Africa’s most extraordinary movements of wildlife.
        </p>
        <div className="actions">
          <Link className="button" to="/safaris">
            Explore Our Safaris
          </Link>
          <Link className="button outline" to="/migration">
            Discover the Migration
          </Link>
        </div>
        <Link className="quiet-link" to="/book">
          Enquire on WhatsApp ↗
        </Link>
      </section>
      <section className="section intro">
        <p className="eyebrow">01 / The Great Nile Migration</p>
        <h2>
          Let the wilderness
          <br />
          set the rhythm.
        </h2>
        <p>
          Remote grasslands. Seasonal wetlands. Open floodplains. South Sudan
          offers a remarkable setting for travellers who approach it with
          curiosity and respect.
        </p>
        <Link to="/migration">Discover the migration →</Link>
      </section>
      <section className="section dark">
        <p className="eyebrow">A sense of place</p>
        <h2>Far from the familiar.</h2>
        <div className="experience">
          {[
            "Vast wildlife movement",
            "Remote wilderness",
            "South Sudanese landscapes and communities",
            "Knowledgeable local guidance",
          ].map((s, i) => (
            <p key={s}>
              <small>0{i + 1}</small>
              {s}
            </p>
          ))}
        </div>
      </section>
      <section className="section">
        <p className="eyebrow">The journeys</p>
        <h2>Safaris with room to discover.</h2>
        <Status
          loading={loading}
          error={error}
          empty={!loading && !data.length}
        />
        <div className="safari-grid">
          {data
            .filter((s) => s.status === "published")
            .slice(0, 2)
            .map((s) => (
              <SafariCard s={s} key={s.id} />
            ))}
        </div>
        <Link to="/safaris">Explore all safaris →</Link>
      </section>
      <section className="section dark">
        <p className="eyebrow">The field journal</p>
        <h2>Look a little closer.</h2>
        <p>Explore approved photographs from our company and guests.</p>
        <GalleryPreview/>
        <Link className="button" to="/gallery">
          View the Gallery
        </Link>
      </section>
      <section className="section intro">
        <p className="eyebrow">Responsible travel</p>
        <h2>
          Respect is part
          <br />
          of the journey.
        </h2>
        <p>
          We value respectful wildlife viewing, care for natural environments,
          local knowledge and participation, and respect for communities and
          cultural practices.
        </p>
      </section>
      <section className="closing">
        <h2>Your Journey Into the Wild Begins Here</h2>
        <Link className="button" to="/book">
          Book a Safari
        </Link>{" "}
        <Link to="/contact">Contact Us →</Link>
      </section>
    </>
  );
}
export function Story({ kind }: { kind: "migration" | "about" }) {
  const s = stories[kind];
  return (
    <>
      <PageHead label={s.intro} title={s.title} />
      <div className="prose">
        {s.sections.map(([title, text]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        {kind === "migration" && (
          <div className="notice">
            Future custom migration map — location data awaiting verification.
          </div>
        )}
      </div>
    </>
  );
}
export function Safaris() {
  const { data, loading, error } = useData<Safari>(
    "itineraries",
    "*,itinerary_days(*)",
  );
  return (
    <>
      <PageHead label="Our safaris" title="Space to discover." />
      <section className="section">
        <Status
          loading={loading}
          error={error}
          empty={!loading && !data.length}
        />
        <div className="safari-grid">
          {data
            .filter((s) => s.status === "published")
            .map((s) => (
              <SafariCard s={s} key={s.id} />
            ))}
        </div>
      </section>
    </>
  );
}
export function SafariDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useData<Safari>(
    "itineraries",
    "*,itinerary_days(*)",
  );
  const s = data.find((s) => s.slug === slug && s.status === "published");
  if (loading || error)
    return (
      <div className="section">
        <Status loading={loading} error={error} />
      </div>
    );
  if (!s)
    return (
      <>
        <PageHead label="Safari" title="This itinerary isn’t available yet." />
        <div className="section">
          <Link to="/safaris">View published safaris →</Link>
        </div>
      </>
    );
  return (
    <>
      <PageHead
        label={s.duration_days ? `${s.duration_days} days` : "Safari"}
        title={s.title}
      >
        <p>{s.short_description}</p>
      </PageHead>
      <div className="prose">
        <p>{s.overview}</p>
        <h2>Day by day</h2>
        {[...(s.itinerary_days || [])]
          .sort((a, b) => a.day_number - b.day_number)
          .map((d) => (
            <details key={d.day_number}>
              <summary>
                Day {d.day_number} · {d.title}
              </summary>
              <p>{d.description}</p>
            </details>
          ))}
        {[
          ["Destinations", s.destinations],
          ["Highlights", s.highlights],
          ["Included", s.included_items],
          ["Excluded", s.excluded_items],
          ["Packing recommendations", s.packing_list],
        ].map(([t, v]) => (
          <section key={t as string}>
            <h2>{t}</h2>
            <ul>
              {(v as string[]).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        ))}
        {[
          ["Accommodation", s.accommodation],
          ["Meals", s.meals],
          ["Transport", s.transport],
          ["Group size", s.group_size],
          ["Important travel information", s.important_information],
        ].map(([t, v]) => (
          <section key={t}>
            <h2>{t}</h2>
            <p>{v || "To be confirmed with the safari team."}</p>
          </section>
        ))}
        <p>PDF itinerary: available after final itinerary confirmation.</p>
        <Link className="button" to={"/book?safari=" + s.id}>
          Book This Safari
        </Link>
      </div>
    </>
  );
}
export function NotFound() {
  return (
    <>
      <PageHead label="404" title="A little off the trail." />
      <div className="section">
        <p>We couldn’t find that page.</p>
        <Link className="button" to="/">
          Return Home
        </Link>
      </div>
    </>
  );
}
