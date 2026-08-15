import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGroq(messages: GroqMessage[], maxTokens = 500, temperature = 0.7): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Set it in Supabase edge function secrets.");
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq API returned empty response");
  }
  return content.trim();
}

const COMPANION_SYSTEM =
  "You are TWIST, the AI companion inside the NUDGEE campus safety app for college students. " +
  "Your personality: warm, witty, relatable, Gen-Z friendly but never cringe. You're like a wise friend who always has their back. " +
  "You help students with: peer pressure (drugs, alcohol, hazing), academic stress, social anxiety, mental wellness, and campus life. " +
  "Keep responses SHORT (2-4 sentences max unless explicitly asked for more). Be conversational, use casual language, and drop the occasional emoji. " +
  "When students face pressure situations, suggest practical ESCAPE LINES — actual phrases they can say to get out of uncomfortable situations. " +
  "Format escape lines in quotes, e.g. \"Nah, I'm good — driving later.\" " +
  "If someone mentions self-harm, suicide, or serious danger: immediately urge them to contact campus counseling or call emergency services. " +
  "Never diagnose, never prescribe medication. You're a peer supporter, not a therapist. " +
  "Always be non-judgmental. Meet students where they are. Encourage small positive steps.";

// ── Mode: CHAT (conversation with history) ──
function chatMessages(history: GroqMessage[]): GroqMessage[] {
  return [{ role: "system", content: COMPANION_SYSTEM }, ...history];
}

// ── Mode: COMPANION (legacy single-message) ──
function companionMessages(userMessage: string): GroqMessage[] {
  return [
    { role: "system", content: COMPANION_SYSTEM },
    { role: "user", content: userMessage },
  ];
}

// ── Mode: SHIELD ──
function shieldMessages(userMessage: string): GroqMessage[] {
  return [
    {
      role: "system",
      content:
        'You are a safety assessment AI for the NUDGEE campus app. Analyze the student message for risk indicators. ' +
        'Respond with ONLY a JSON object: {"risk_level":"low|moderate|high","indicators":["..."],"suggestion":"..."}\n' +
        "risk_level: low = general stress/curiosity, moderate = active peer pressure or distress, high = potential harm or dangerous situation.\n" +
        "indicators: 1-3 short phrases identifying specific risk factors.\n" +
        "suggestion: one actionable next step for the student.",
    },
    { role: "user", content: userMessage },
  ];
}

// ── Mode: REPORT_NORMALIZER ──
function reportNormalizerMessages(reportText: string): GroqMessage[] {
  return [
    {
      role: "system",
      content:
        'You are a report normalization AI for anonymous campus pressure reports. ' +
        'Clean up the text, remove identifying details (names, specific room numbers), and categorize it. ' +
        'Respond with ONLY a JSON object: {"category":"substance|academic|social|bullying|hazing|other","cleaned_text":"...","severity":"low|moderate|high"}\n' +
        "cleaned_text should preserve the student's voice while removing any personally identifiable information.",
    },
    { role: "user", content: reportText },
  ];
}

// ── Mode: INSIGHTS ──
function insightsMessages(dataSummary: string): GroqMessage[] {
  return [
    {
      role: "system",
      content:
        "You are an analytics AI for the NUDGEE campus safety admin dashboard. " +
        "Analyze the provided aggregate data (wellness check-ins, pressure reports, categories) and generate 3-4 actionable insights. " +
        "Respond in plain text with bullet points (•). Focus on trends, areas of concern, and recommended actions. " +
        "Keep it concise and data-driven. Do not reference specific students.",
    },
    { role: "user", content: `Here is the campus data summary:\n\n${dataSummary}` },
  ];
}

// ── Mode: WELLNESS_TIP ──
function wellnessTipMessages(mood: string, note: string): GroqMessage[] {
  return [
    {
      role: "system",
      content:
        "You are TWIST, the AI companion in the NUDGEE campus wellness app. " +
        "A student just completed a wellness check-in. Give them ONE short, personalized tip (2-3 sentences) based on their mood and note. " +
        "Be warm, encouraging, and specific. If they're happy, celebrate it. If they're low, offer gentle support. If neutral, suggest a small boost. " +
        "No medical advice. Keep it real and Gen-Z friendly.",
    },
    { role: "user", content: `Mood: ${mood}${note ? `\nNote: ${note}` : ""}` },
  ];
}

// ── Mode: DAILY_INSIGHT ──
function dailyInsightMessages(stats: string): GroqMessage[] {
  return [
    {
      role: "system",
      content:
        "You are TWIST, the AI companion in the NUDGEE campus safety app. " +
        "Generate ONE short, motivational insight (2-3 sentences) for a student based on their activity stats. " +
        "Be encouraging and specific to their numbers. Use casual Gen-Z language. " +
        "If they have zero activity, give a gentle nudge to get started. " +
        "No bullet points, no medical advice — just a friendly observation + nudge.",
    },
    { role: "user", content: `My activity stats:\n${stats}` },
  ];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode, message, dataSummary, history, mood, note, stats } = body;

    let messages: GroqMessage[];
    let maxTokens = 500;
    let temperature = 0.7;

    switch (mode) {
      case "chat": {
        if (!history || !Array.isArray(history) || history.length === 0) {
          throw new Error("history array is required for chat mode");
        }
        messages = chatMessages(history);
        maxTokens = 300;
        temperature = 0.8;
        break;
      }
      case "companion":
        if (!message) throw new Error("message is required for companion mode");
        messages = companionMessages(message);
        maxTokens = 300;
        break;
      case "shield":
        if (!message) throw new Error("message is required for shield mode");
        messages = shieldMessages(message);
        maxTokens = 200;
        temperature = 0.3;
        break;
      case "report_normalizer":
        if (!message) throw new Error("message (report text) is required for report_normalizer mode");
        messages = reportNormalizerMessages(message);
        maxTokens = 250;
        temperature = 0.3;
        break;
      case "insights":
        if (!dataSummary) throw new Error("dataSummary is required for insights mode");
        messages = insightsMessages(dataSummary);
        maxTokens = 500;
        break;
      case "wellness_tip":
        if (!mood) throw new Error("mood is required for wellness_tip mode");
        messages = wellnessTipMessages(mood, note || "");
        maxTokens = 200;
        temperature = 0.8;
        break;
      case "daily_insight":
        if (!stats) throw new Error("stats is required for daily_insight mode");
        messages = dailyInsightMessages(stats);
        maxTokens = 200;
        temperature = 0.8;
        break;
      default:
        throw new Error(
          `Unknown mode: ${mode}. Valid modes: chat, companion, shield, report_normalizer, insights, wellness_tip, daily_insight`,
        );
    }

    const result = await callGroq(messages, maxTokens, temperature);

    if (mode === "shield" || mode === "report_normalizer") {
      try {
        const parsed = JSON.parse(result);
        return new Response(JSON.stringify({ ok: true, mode, data: parsed }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ ok: true, mode, data: result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, mode, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
