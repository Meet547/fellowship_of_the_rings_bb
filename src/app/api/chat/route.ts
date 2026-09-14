import { NextResponse } from "next/server";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { getReply } from "@/lib/chat-engine";

const CASE_CONTEXT = `
Case #0142: Rahul Sharma, age 17, last confirmed sighting at Andheri Station
on Aug 12 at 17:40, wearing a grey hoodie. Potential leads: Surat shelter
intake score 91 (age, date, location route, and clothing align); Vadodara
shelter intake score 64 (clothing unconfirmed); Bharuch patrol sighting score
52 (second-hand description). These are potential leads, not confirmed identity.
`;

async function answerWithBedrock(message: string) {
  const region = process.env.AWS_REGION;
  const modelId = process.env.KHOJ_BEDROCK_MODEL_ID;
  if (!region || !modelId) return null;

  const client = new BedrockRuntimeClient({ region });
  const response = await client.send(
    new ConverseCommand({
      modelId,
      system: [
        {
          text: `You are KHOJ, an evidence-first investigation assistant. Answer only from the case context below. Never claim a potential match is confirmed. Keep the answer concise and mention uncertainty when relevant.\n${CASE_CONTEXT}`,
        },
      ],
      messages: [{ role: "user", content: [{ text: message }] }],
      inferenceConfig: { maxTokens: 320, temperature: 0.1 },
    }),
  );

  const text = response.output?.message?.content
    ?.map((block) => ("text" in block ? block.text : ""))
    .join("")
    .trim();

  return text ? { text, cites: ["Case #0142 · evidence context"] } : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: unknown; runId?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({ error: "Ask a question about the case." }, { status: 400 });
    }

    try {
      const bedrockReply = await answerWithBedrock(message);
      if (bedrockReply) {
        return NextResponse.json({ ...bedrockReply, mode: "aws" });
      }
    } catch (error) {
      console.error("Bedrock answer failed; using local fallback", error);
    }

    return NextResponse.json({
      ...getReply(message),
      runId: typeof body.runId === "string" ? body.runId : undefined,
      mode: "local",
    });
  } catch (error) {
    console.error("Failed to answer case question", error);
    return NextResponse.json({ error: "Unable to answer that question." }, { status: 500 });
  }
}