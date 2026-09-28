export const NEED_TYPES = ["presence", "data", "scaling", "other"] as const;

export type NeedType = (typeof NEED_TYPES)[number];

export const NEED_LABELS: Record<NeedType, string> = {
  presence: "Getting online",
  data: "Organizing data",
  scaling: "Scaling the business",
  other: "Something else",
};

export type Inquiry = {
  name: string;
  email: string;
  businessName: string;
  website: string;
  phone: string;
  city: string;
  needType: NeedType;
  description: string;
};

export type FieldErrors = Partial<Record<keyof Inquiry, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

function trim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "shop";
}

export function todayStamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function folderNameFor(businessName: string, date = new Date()): string {
  return `${slugify(businessName)}-${todayStamp(date)}`;
}

export function isNeedType(value: string): value is NeedType {
  return (NEED_TYPES as readonly string[]).includes(value);
}

export function parseInquiry(body: unknown): {
  inquiry?: Inquiry;
  errors?: FieldErrors;
  honeypot: boolean;
} {
  if (!body || typeof body !== "object") {
    return { errors: { description: "Please fill out the form." }, honeypot: false };
  }

  const raw = body as Record<string, unknown>;
  const honeypot = trim(raw.company_fax).length > 0;

  const needTypeRaw = trim(raw.needType);
  const inquiry: Inquiry = {
    name: trim(raw.name),
    email: trim(raw.email),
    businessName: trim(raw.businessName),
    website: trim(raw.website),
    phone: trim(raw.phone),
    city: trim(raw.city),
    needType: isNeedType(needTypeRaw) ? needTypeRaw : "other",
    description: trim(raw.description),
  };

  const errors: FieldErrors = {};

  if (inquiry.name.length < 2 || inquiry.name.length > 80) {
    errors.name = "Please share your name.";
  }
  if (!EMAIL_RE.test(inquiry.email) || inquiry.email.length > 120) {
    errors.email = "That email doesn't look right.";
  }
  if (inquiry.businessName.length < 2 || inquiry.businessName.length > 100) {
    errors.businessName = "Please add the name of the shop.";
  }
  if (inquiry.website && !URL_RE.test(inquiry.website)) {
    errors.website = "Use a full link, like https://example.com.";
  }
  if (inquiry.phone.length > 40) {
    errors.phone = "That phone number is too long.";
  }
  if (inquiry.city.length > 80) {
    errors.city = "That city name is too long.";
  }
  if (!isNeedType(needTypeRaw)) {
    errors.needType = "Pick the option that fits best.";
  }
  if (inquiry.description.length < 20) {
    errors.description = "A couple of sentences helps me start in the right place.";
  }
  if (inquiry.description.length > 4000) {
    errors.description = "That's a bit long — try the heart of the problem first.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, honeypot };
  }

  return { inquiry, honeypot };
}

function optionalLine(label: string, value: string): string {
  return value ? `- **${label}:** ${value}` : `- **${label}:** —`;
}

export function workstreamsFor(needType: NeedType): string[] {
  switch (needType) {
    case "presence":
      return [
        "See how the shop shows up today (search, maps, social, word of mouth).",
        "Stand up a simple public page people can actually find.",
        "Make hours, photos, and how to visit or order easy to scan.",
      ];
    case "data":
      return [
        "Inventory what they already track (paper, spreadsheets, a back-office tool).",
        "Put customers, stock, or sales somewhere they can search and trust.",
        "Leave behind a routine they can keep without a specialist on site.",
      ];
    case "scaling":
      return [
        "Name the bottleneck: people, orders, space, or the owner being in every loop.",
        "Sketch a process that holds when the shop gets busier.",
        "Only then add tools — website, booking, inventory — that match that process.",
      ];
    default:
      return [
        "Restate the problem in their words before proposing work.",
        "Separate 'must work this month' from 'nice later'.",
        "Ask the open questions below before building anything.",
      ];
  }
}

export function buildInquiryMarkdown(inquiry: Inquiry, folder: string): string {
  return `# Inquiry — ${inquiry.businessName}

Submitted: ${new Date().toISOString()}
Folder: \`clients/${folder}\`

## Contact

- **Name:** ${inquiry.name}
- **Email:** ${inquiry.email}
${optionalLine("Phone", inquiry.phone)}
${optionalLine("City", inquiry.city)}
${optionalLine("Website", inquiry.website)}

## Need

- **Business:** ${inquiry.businessName}
- **Type:** ${NEED_LABELS[inquiry.needType]} (\`${inquiry.needType}\`)

## Their words

${inquiry.description}
`;
}

export function buildContextMarkdown(inquiry: Inquiry, folder: string): string {
  const workstreams = workstreamsFor(inquiry.needType)
    .map((item) => `- ${item}`)
    .join("\n");

  return `# Agent context — ${inquiry.businessName}

Read this file first. Then read \`inquiry.md\`. Do not invent facts that are not in the inquiry.

## Business

- **Name:** ${inquiry.businessName}
- **Location:** ${inquiry.city || "not given"}
- **Website:** ${inquiry.website || "none given"}
- **Contact:** ${inquiry.name} · ${inquiry.email}${inquiry.phone ? ` · ${inquiry.phone}` : ""}

## Stated problem

They asked for help with **${NEED_LABELS[inquiry.needType].toLowerCase()}**.

${inquiry.description}

## Likely workstreams

${workstreams}

## Open questions

- What does a good week look like for this shop today?
- Who currently handles phones, inventory, or the register?
- Do they already pay for any tools (Square, a Facebook page, a bookkeeper)?
- What would they consider a win in the next 30 days?

## Working rules

- Prefer the smallest change that a shop owner can keep using.
- Do not assume they want an app, a full redesign, or a social strategy unless they said so.
- Put working notes in \`notes.md\`. Keep this file as the brief.
- Folder path: \`clients/${folder}\`
`;
}

export function buildNotesMarkdown(inquiry: Inquiry): string {
  return `# Notes — ${inquiry.businessName}

Working notes for the consultant. Agents: append dated entries; do not overwrite earlier notes.

## First pass

- [ ]
`;
}

export function buildClientFiles(inquiry: Inquiry, folder: string) {
  return {
    "inquiry.md": buildInquiryMarkdown(inquiry, folder),
    "CONTEXT.md": buildContextMarkdown(inquiry, folder),
    "notes.md": buildNotesMarkdown(inquiry),
  };
}
