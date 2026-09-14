import { NextResponse } from "next/server";
import { startInvestigation } from "@/lib/aws-workflow";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { description?: unknown; userId?: unknown };
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (description.length < 30) {
      return NextResponse.json(
        { error: "Add a little more detail about who, where and when." },
        { status: 400 },
      );
    }

    const run = await startInvestigation({
      description,
      userId: typeof body.userId === "string" ? body.userId : undefined,
    });

    return NextResponse.json(run, { status: 202 });
  } catch (error) {
    console.error("Failed to start investigation", error);
    return NextResponse.json({ error: "Unable to start the investigation." }, { status: 500 });
  }
}