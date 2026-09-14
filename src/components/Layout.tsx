import { createContext, useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { SEO } from "./SEO";
import { Menu, X, MessageCircle } from "lucide-react";
import { useData } from "../hooks/useData";
import { defaults } from "../config/content";
import type { Settings } from "../types";
const Context = createContext(defaults);
export const useSettings = () => useContext(Context);
const links = [
  ["Home", "/"],
  ["The Migration", "/migration"],
  ["About Us", "/about"],
  ["Safaris", "/safaris"],
  ["Gallery", "/gallery"],
  ["Contact", "/contact"],
];
const logoSrc = "images/great-nile-logo.png";
export function Layout() {
  const { data } = useData<Settings>("website_settings");
  const settings = { ...defaults, ...data[0] };
  const [open, setOpen] = useState(false);
  const path = useLocation().pathname;
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [path, settings.company_name]);
  return (
    <Context.Provider value={settings}>
      <SEO />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" to="/">
          <img className="brand-logo" src={logoSrc} alt="" />
          <span className="brand-copy">
            THE GREAT NILE<small>MIGRATION SAFARIS</small>
          </span>
        </Link>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "open" : ""} aria-label="Main navigation">
          {links.map(([name, url]) => (
            <NavLink key={url} to={url} end>
              {name}
            </NavLink>
          ))}
          <Link className="button" to="/book">
            Book a Safari
          </Link>
        </nav>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer>
        <div>
          <Link className="brand" to="/">
            <img className="brand-logo" src={logoSrc} alt="" />
            <span className="brand-copy">
              THE GREAT NILE<small>MIGRATION SAFARIS</small>
            </span>
          </Link>
          <p>{settings.short_description}</p>
          {settings.phone_number&&<p>{settings.phone_number}</p>}
          {settings.email_address&&<a href={'mailto:'+settings.email_address}>{settings.email_address}</a>}
          {Object.entries({Facebook:settings.facebook_url,Instagram:settings.instagram_url,YouTube:settings.youtube_url,TikTok:settings.tiktok_url}).filter(([,url])=>/^https:\/\//.test(url)).map(([name,url])=><a key={name} href={url} target="_blank" rel="noreferrer">{name} ↗</a>)}
        </div>
        <div>
          {links.slice(1).map(([name, url]) => (
            <Link key={url} to={url}>
              {name}
            </Link>
          ))}
        </div>
        <div>
          {[
            ["Privacy Policy", "/privacy"],
            ["Booking Terms", "/booking-terms"],
            ["Cancellation Policy", "/cancellation-policy"],
            ["Photo Submission Terms", "/photo-submission-terms"],
          ].map(([name, url]) => (
            <Link key={url} to={url}>
              {name}
            </Link>
          ))}
        </div>
        <p>
          © {new Date().getFullYear()} {settings.company_name}
        </p>
      </footer>
      <Link
        className="floating"
        to="/book"
        aria-label="WhatsApp booking enquiry"
      >
        <MessageCircle />
      </Link>
    </Context.Provider>
  );
}
