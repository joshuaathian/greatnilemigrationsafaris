import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home, Story, Safaris, SafariDetail, NotFound } from "./pages/Public";
import { Gallery } from "./pages/Gallery";
import { Book, Contact } from "./forms/Enquiries";
import { Upload } from "./forms/Upload";
import { Legal } from "./pages/Legal";
import { Login, Guard, AdminOverview, AdminRecords } from "./pages/Admin";
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="migration" element={<Story kind="migration" />} />
          <Route path="about" element={<Story kind="about" />} />
          <Route path="safaris" element={<Safaris />} />
          <Route path="safaris/:slug" element={<SafariDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="book" element={<Book />} />
          <Route path="contact" element={<Contact />} />
          <Route path="submit-photo" element={<Upload />} />
          {[
            "privacy",
            "booking-terms",
            "cancellation-policy",
            "photo-submission-terms",
          ].map((p) => (
            <Route key={p} path={p} element={<Legal />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={<Guard />}>
          <Route index element={<AdminOverview />} />
          {["submissions", "gallery", "itineraries", "settings"].map((p) => (
            <Route key={p} path={p} element={<AdminRecords />} />
          ))}
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
);
