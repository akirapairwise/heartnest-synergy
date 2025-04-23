
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { mood_logs, goal_updates, shared_moments } = await req.json();

    // Handle edge case: missing data
    if (!mood_logs && !goal_updates && !shared_moments) {
      return new Response(
        JSON.stringify({ error: "No data provided to generate summary." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Build the system prompt
    const prompt = `
You are a compassionate relationship wellness coach. Every week, you summarize a couple's emotional and relational journey based on mood logs, goal updates, and shared experiences. Be neutral, warm, and encouraging. Focus on emotional growth and healthy reflections. 
This week, the user recorded the following mood logs:
${mood_logs?.length ? mood_logs.map((m, i) => `${i+1}. ${m}`).join("\n") : "None recorded."}

They updated or interacted with their relationship goals as follows:
${goal_updates?.length ? goal_updates.map((g, i) => `${i+1}. ${g}`).join("\n") : "No goal interactions."}

Here are key shared events, moments, or conflicts:
${shared_moments?.length ? shared_moments.map((s, i) => `${i+1}. ${s}`).join("\n") : "None this week."}

Please provide:
1. A short emotional summary of the week.
2. Gentle relationship growth tips.
3. A final sentence of encouragement or appreciation.
Use a warm and concise style.
`;

    const messages = [
      { role: "system", content: "You are a compassionate relationship wellness coach." },
      { role: "user", content: prompt }
    ];

    // Call OpenAI Chat API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
        max_tokens: 400,
      }),
    });
    if (!response.ok) {
      const txt = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI error: ${response.status} - ${txt}` }),
        { status: 500, headers: corsHeaders }
      );
    }
    const json = await response.json();
    const summary = json.choices?.[0]?.message?.content?.trim() || "No summary generated.";

    // Return result
    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge func error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate summary. Please try again later." }),
      { status: 500, headers: corsHeaders }
    );
  }
});
