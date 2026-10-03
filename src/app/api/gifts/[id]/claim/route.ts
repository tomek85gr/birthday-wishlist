import { NextResponse } from "next/server";
import { claimGift } from "@/lib/birthdays";
import { emailSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const rawEmail = typeof body === "object" && body !== null && "email" in body && typeof body.email === "string"
    ? body.email.trim()
    : null;
  const email = rawEmail === null ? null : emailSchema.safeParse(rawEmail);
  const rawCoBuyerEmail = typeof body === "object" && body !== null && "coBuyerEmail" in body && typeof body.coBuyerEmail === "string"
    ? body.coBuyerEmail.trim()
    : "";
  const coBuyerEmail = rawCoBuyerEmail ? emailSchema.safeParse(rawCoBuyerEmail) : null;

  if (!email?.success || (rawCoBuyerEmail && !coBuyerEmail?.success) || (coBuyerEmail?.success && coBuyerEmail.data.toLowerCase() === email.data.toLowerCase())) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  try {
    const { id } = await params;
    const claimed = await claimGift(id, email.data, coBuyerEmail?.success ? coBuyerEmail.data : null);
    if (!claimed) return NextResponse.json({ status: "conflict" }, { status: 409 });
    return NextResponse.json({ status: "success" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
