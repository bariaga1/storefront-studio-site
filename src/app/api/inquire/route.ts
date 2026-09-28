import { NextResponse } from "next/server";
import { persistClientFolder } from "@/lib/clients";
import { notifyConsultant } from "@/lib/email";
import { buildClientFiles, parseInquiry } from "@/lib/inquiry";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request))) {
    return NextResponse.json(
      { error: "That's a lot of notes in a short time. Try again in a bit." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "That request didn't look right." },
      { status: 400 },
    );
  }

  const parsed = parseInquiry(body);
  if (parsed.honeypot) {
    return NextResponse.json({ ok: true });
  }
  if (!parsed.inquiry) {
    return NextResponse.json(
      { error: "Please check the form.", errors: parsed.errors },
      { status: 400 },
    );
  }

  const inquiry = parsed.inquiry;
  const persist = await persistClientFolder(inquiry.businessName, (folder) =>
    buildClientFiles(inquiry, folder),
  );

  if (!persist.local && !persist.github) {
    return NextResponse.json(
      {
        error:
          "I couldn't save this inquiry. Check local disk or GitHub settings.",
      },
      { status: 500 },
    );
  }

  const emailed = await notifyConsultant(inquiry, persist).catch((error) => {
    console.error("Email notify failed:", error);
    return false;
  });

  return NextResponse.json({
    ok: true,
    folder: persist.folder,
    persisted: {
      local: persist.local,
      github: persist.github,
      email: emailed,
    },
  });
}
