import type { Settings } from "../types";
export const defaults: Settings = {
  company_name: "The Great Nile Migration Safaris",
  short_description: "Considered journeys into South Sudan’s wilderness.",
  whatsapp_number: "",
  phone_number: "",
  email_address: "",
  office_address: "",
  business_hours: "",
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
  tiktok_url: "",
  seo_title: "The Great Nile Migration Safaris",
  seo_description: "Safari journeys through South Sudan.",
};
export const categories = [
  "Wildlife",
  "Landscapes",
  "Safari Experiences",
  "Culture and Communities",
  "Guest Photography",
];
export const stories = {
  migration: {
    title: "A landscape in motion.",
    intro: "The Great Nile Migration",
    sections: [
      [
        "The movement",
        "An extraordinary wildlife movement through South Sudan’s grasslands, wetlands and floodplains. Routes and timing are shaped by natural conditions.",
      ],
      [
        "Where it happens",
        "Confirmed location information and a custom migration map will be added with the safari team’s field guidance.",
      ],
      [
        "Wildlife & seasons",
        "Species guidance, seasonal viewing opportunities and recommended travel periods are awaiting verified field information.",
      ],
      [
        "Responsible viewing",
        "Keep a respectful distance, follow guide instructions and avoid disturbing animals or their routes.",
      ],
      [
        "Important travel note",
        "Wildlife movement and sightings are natural and cannot be guaranteed. Confirm current access, logistics and travel guidance before making arrangements.",
      ],
    ],
  },
  about: {
    title: "Rooted in South Sudan.",
    intro: "Our story",
    sections: [
      ["Company story", "The founders’ story is awaiting company information."],
      [
        "Mission",
        "To create thoughtful safari journeys that respect wildlife, land and the people who know it.",
      ],
      [
        "Vision",
        "To share South Sudan’s wilderness through careful, locally informed travel.",
      ],
      [
        "Conservation & communities",
        "Respectful wildlife viewing, care for natural environments and local participation guide our approach. Formal policies are awaiting company review.",
      ],
      [
        "Why travel with us",
        "Our planned approach centres on local knowledge, considered logistics and unhurried exploration. Company qualifications and operating details will be added when confirmed.",
      ],
      [
        "Safari team & guides",
        "Names, portraits and biographies will be added when supplied by the company.",
      ],
    ],
  },
};
