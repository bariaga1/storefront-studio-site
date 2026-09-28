import { Resend } from "resend";
import { NEED_LABELS, type Inquiry } from "./inquiry";
import type { PersistResult } from "./clients";

export async function notifyConsultant(
  inquiry: Inquiry,
  persist: PersistResult,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONSULTANT_EMAIL;
  if (!apiKey || !to) {
    console.warn("Email skipped: set RESEND_API_KEY and CONSULTANT_EMAIL.");
    return false;
  }

  const from =
    process.env.RESEND_FROM || "Storefront Studio <onboarding@resend.dev>";
  const persistBits = [
    persist.local ? "saved locally" : null,
    persist.github ? "committed to GitHub" : null,
  ]
    .filter(Boolean)
    .join(", ");

  const text = [
    `New inquiry from ${inquiry.businessName}.`,
    "",
    `Folder: clients/${persist.folder}`,
    persistBits ? `Saved: ${persistBits}` : "Saved: not yet — check env vars.",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone || "—"}`,
    `City: ${inquiry.city || "—"}`,
    `Website: ${inquiry.website || "—"}`,
    `Need: ${NEED_LABELS[inquiry.needType]}`,
    "",
    inquiry.description,
    "",
    "Open CONTEXT.md in that folder before you start.",
  ].join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: inquiry.email,
    subject: `New inquiry: ${inquiry.businessName}`,
    text,
  });

  if (error) {
    console.error("Resend error:", error);
    return false;
  }

  return true;
}
