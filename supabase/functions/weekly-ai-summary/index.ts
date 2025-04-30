
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
    const { mood_logs, goal_updates, shared_moments, relationship_context = {} } = await req.json();

    // Handle edge case: missing data
    if (!mood_logs?.length && !goal_updates?.length && !shared_moments?.length) {
      return new Response(
        JSON.stringify({ error: "Insufficient data to generate a meaningful summary." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Build the system prompt with more detailed instructions
    const prompt = `
You are a compassionate relationship wellness coach helping a couple track their emotional journey. You're analyzing this week's data to create a personalized summary.

Relationship Context:
- Relationship Status: ${relationship_context.status || 'Not specified'}
- Relationship Goals: ${relationship_context.goals || 'Not specified'}
- Areas to Improve: ${relationship_context.areas_to_improve || 'Not specified'}
- Shared Goals: ${relationship_context.shared_goals || 'Not specified'}

This week's mood logs:
${mood_logs?.length ? mood_logs.map((m, i) => `${i+1}. ${m}`).join("\n") : "None recorded this week."}

Activities related to relationship goals:
${goal_updates?.length ? goal_updates.map((g, i) => `${i+1}. ${g}`).join("\n") : "No goal activities recorded."}

Key shared experiences, check-ins, or conflicts:
${shared_moments?.length ? shared_moments.map((s, i) => `${i+1}. ${s}`).join("\n") : "None recorded this week."}

Please provide a structured summary with these three clear sections:

1. Weekly Emotional Journey: Analyze mood patterns and emotional trends you observe. If there are no moods logged, acknowledge this and base your insights on other available data.

2. Relationship Growth Insights: Identify areas of progress or opportunities for growth based on goals, conflicts resolved, and check-in data. Make connections between activities and emotional states when possible.

3. Suggested Focus for Next Week: Provide 1-2 specific, actionable suggestions that could improve the relationship based on the data. These should be gentle, positive recommendations, not criticisms.

Use a warm, encouraging tone throughout. Be specific rather than generic. If there's minimal data, acknowledge this while still providing thoughtful insights based on what's available.
`;

    const messages = [
      { role: "system", content: "You are a compassionate relationship wellness coach who provides structured, specific advice based on data patterns." },
      { role: "user", content: prompt }
    ];

    // Call OpenAI Chat API with improved parameters
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a good balance of cost/quality
        messages,
        temperature: 0.5, // Slightly increased for more creativity while maintaining consistency
        max_tokens: 800, // Increased for more detailed summaries
        top_p: 0.95,
        frequency_penalty: 0.5, // Reduced repetition
        presence_penalty: 0.3, // Encourages addressing all parts of the prompt
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Failed to generate AI summary (${response.status})` }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    const json = await response.json();
    const summary = json.choices?.[0]?.message?.content?.trim() || "No summary could be generated.";

    // Return result
    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate relationship summary. Please try again later." }),
      { status: 500, headers: corsHeaders }
    );
  }
});
