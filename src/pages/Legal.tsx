import { useLocation } from "react-router-dom";
import { PageHead } from "../components/UI";
const content: Record<string, { title: string; sections: string[][] }> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      [
        "Information we receive",
        "Enquiries may include your name, email, telephone number and travel preferences. Photo submissions also include the image, caption and consent choices.",
      ],
      [
        "Use and access",
        "Information is intended for handling enquiries and reviewing photographs. Guest contact information must not be displayed in the public gallery.",
      ],
      [
        "Retention and your choices",
        "Company retention periods, service providers, applicable rights and the contact for privacy requests must be confirmed before publication.",
      ],
    ],
  },
  "booking-terms": {
    title: "Booking Terms and Conditions",
    sections: [
      [
        "Enquiries and reservations",
        "An enquiry does not confirm a reservation. Availability, the full quotation and final terms must be agreed with the safari team.",
      ],
      [
        "Payments and responsibilities",
        "Payment schedules, insurance requirements, travel documentation, operator responsibilities and governing terms require company and legal review.",
      ],
    ],
  },
  "cancellation-policy": {
    title: "Cancellation Policy",
    sections: [
      [
        "Cancellations and changes",
        "Cancellation deadlines, fees, refunds and changes must be confirmed in the final written booking agreement. No fixed fees or refund promises are represented in this draft.",
      ],
    ],
  },
  "photo-submission-terms": {
    title: "Photo Submission Terms",
    sections: [
      [
        "Permission to submit",
        "You must own the photograph or have permission to submit it, including any necessary permission from identifiable people.",
      ],
      [
        "Review and use",
        "Submission does not guarantee publication. The company may review, resize or decline the photograph. Permission to display does not transfer ownership of your copyright.",
      ],
      [
        "Privacy and removal",
        "Your contact information will not be displayed publicly. Contact the company if you would like to request removal of a published photograph.",
      ],
      [
        "Agreement",
        "You must agree to these terms and give permission to review and potentially display your photograph before submitting.",
      ],
    ],
  },
};
export function Legal() {
  const key = useLocation().pathname.slice(1);
  const p = content[key];
  return (
    <>
      <PageHead label="Legal" title={p.title} />
      <div className="prose">
        <p className="notice">
          Draft — requires legal and company review before publication.
        </p>
        {p.sections.map(([t, s]) => (
          <section key={t}>
            <h2>{t}</h2>
            <p>{s}</p>
          </section>
        ))}
      </div>
    </>
  );
}
