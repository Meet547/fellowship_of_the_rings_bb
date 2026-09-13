/**
 * ---------------------------------------------------------------------------
 * CHAT ENGINE — demo assistant grounded in case #0142
 * ---------------------------------------------------------------------------
 * Stands in for the production pipeline (OpenAI/Whisper on the client, agent
 * backend behind the API). Replies are keyword-routed and always grounded in
 * the case evidence so the demo stays honest. Replace `getReply` with a real
 * API call later — the UI contract is { text, cites }.
 * ---------------------------------------------------------------------------
 */

export interface ChatReply {
  text: string;
  cites?: string[];
}

const has = (q: string, ...keys: string[]) => keys.some((k) => q.includes(k));

export function getReply(rawInput: string): ChatReply {
  const q = rawInput.toLowerCase();

  /* Sources searched -------------------------------------------------- */
  if (has(q, "source", "search", "database", "looked at", "checked")) {
    return {
      text: "So far the search agents have checked four kinds of sources: missing-person records across 12 databases, regional and national news, public records, and found-person reports. The Surat found-person report from Aug 14 is the strongest result — it came in two days after Rahul was last seen and matches the case on four evidence points.",
      cites: [
        "Missing-person records · 12 databases",
        "News sources · 14 articles",
        "Public records · 6",
        "Found-person reports · 2",
      ],
    };
  }

  /* The 91% match ----------------------------------------------------- */
  if (has(q, "91", "match", "surat", "score", "confidence", "why")) {
    return {
      text: "The Surat record scores 91 because all four evidence points line up: age (~17 vs 17), the timeframe (last seen Aug 12, report filed Aug 14 — consistent with a train journey), the location (Surat sits on the rail corridor out of Mumbai), and the clothing (grey hoodie in both records). It's still a potential match, not a confirmed identity — the next step is human verification.",
      cites: [
        "Found-person report · Surat · Aug 14",
        "Match comparison · 4/4 checks passed",
      ],
    };
  }

  /* Timeline ---------------------------------------------------------- */
  if (has(q, "timeline", "happened", "when", "last seen", "where was")) {
    return {
      text: "Here is the timeline so far. Aug 12, 17:40 — last confirmed sighting at Andheri Station. Aug 13, 09:20 — a potential sighting in Borivali, still unverified. Aug 14, 16:10 — a found-person report is filed in Surat. Aug 14, 18:32 — KHOJ connects the report to your case and raises a lead. The gap between Andheri and Surat is about a day by train, which fits.",
      cites: [
        "Case timeline · Aug 12 – Aug 14",
        "Patrol & news sources",
      ],
    };
  }

  /* All leads ---------------------------------------------------------- */
  if (has(q, "lead", "found", "result", "candidate")) {
    return {
      text: "There are three potential leads right now. The Surat found-person record is the strongest at 91. A shelter intake in Vadodara scores 64 — age and timing fit, but the clothing description couldn't be confirmed. A patrol sighting near Bharuch scores 52 — it's a second-hand observation and only partially described. Each lead links back to its sources so you can verify before acting.",
      cites: ["Lead ranking · 3 kept for review"],
    };
  }

  /* Contradictions / what doesn't fit ---------------------------------- */
  if (has(q, "contradict", "conflict", "wrong", "doesn't fit", "does not fit", "dispute")) {
    return {
      text: "Two things don't fully fit. On the Vadodara lead, the clothing could not be confirmed and the location is off the expected rail route. On the Bharuch patrol log, the description is second-hand — a \"grey jacket\", not a hoodie. KHOJ keeps these visible rather than hiding them, because a contradiction is often what saves an investigation from the wrong path.",
      cites: ["Lead 2 · clothing unconfirmed", "Lead 3 · second-hand sighting"],
    };
  }

  /* Next steps ---------------------------------------------------------- */
  if (has(q, "next", "do now", "should i", "what can i", "advice", "help me", "step")) {
    return {
      text: "Recommended next steps: first, verify the Surat lead in person or through the shelter — carry a recent photo and confirm the clothing detail. Second, inform the officer handling the missing-person report and share the found-person record number. Third, keep the Borivali sighting separate until it's corroborated. Move carefully: a potential match is a starting point, not a conclusion.",
      cites: ["Case #0142 · recommended actions"],
    };
  }

  /* Greeting ------------------------------------------------------------ */
  if (has(q, "hello", "hi", "hey", "namaste", "good morning", "good evening")) {
    return {
      text: "Hello. I'm KHOJ — I've read the full case file for Rahul Sharma (#0142), including the timeline, the three leads and the evidence behind them. Ask me anything: why a lead scored the way it did, what sources we searched, or what to do next.",
    };
  }

  /* Fallback ------------------------------------------------------------ */
  return {
    text: "I can only speak from the evidence in this case, so let me know what you'd like to look at: the timeline from Aug 12 to Aug 14, why the Surat record scores 91, what the search agents covered, or what to do next. If something in the file looks wrong, point it out — contradictions stay visible here on purpose.",
    cites: ["Case #0142 · 12 sources · 3 leads"],
  };
}

/* ------------------------------------------------------------------------- */
/* Suggested prompts + Whisper voice samples                                  */
/* ------------------------------------------------------------------------- */

export const SUGGESTED_PROMPTS = [
  "Why does the Surat match score 91?",
  "What sources did we search?",
  "Walk me through the timeline",
  "What should we do next?",
] as const;

/**
 * Cycled through when the user presses the mic — simulates a Whisper
 * transcription of three natural spoken questions.
 */
export const VOICE_SAMPLES = [
  "Where was Rahul last seen?",
  "Why is the Surat match 91 percent?",
  "What should we do next?",
] as const;

/** Fake Whisper latency (ms) before the transcript starts appearing. */
export const WHISPER_DELAY = 700;
