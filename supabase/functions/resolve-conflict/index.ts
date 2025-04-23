
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS requests for CORS
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
}

serve(async (req) => {
  // Handle CORS preflight request
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('Edge function called with method:', req.method);

    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Parse the request body
    const requestData = await req.text();
    let parsedData;
    try {
      parsedData = JSON.parse(requestData);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      throw new Error('Invalid JSON in request body');
    }

    const { initiator_statement, responder_statement, conflict_id } = parsedData;

    if (!initiator_statement || !responder_statement || !conflict_id) {
      console.error('Missing required parameters');
      throw new Error('Missing required parameters');
    }

    // Format the improved prompt for OpenAI, following user instructions
    const prompt = `
You are a wise and emotionally intelligent relationship coach. Your goal is to neutrally summarize both sides of a conflict between two partners and offer calm, healing suggestions. Use soft, non-blaming language. Encourage empathy and connection. 

Partner A's perspective:
${initiator_statement}

Partner B's perspective:
${responder_statement}

Instructions:
1. Summarize the conflict using a neutral, warm tone. Begin the section with "🧩 Summary:" (use emoji).
2. Write 2-3 practical, numbered resolution tips for both partners to try, title the section "🛠️ Resolution Tips:" (use emoji).
3. Write one empathy phrase each partner could say to reconnect, in a section called "💬 Empathy Prompts:" (use emoji). 
- For empathy prompts, prefix each line with either "Partner A:" or "Partner B:"
- Keep the language soft, non-blaming, and encouraging.

Example output:
🧩 Summary:
One partner feels neglected because they are usually the one initiating activities. The other partner is dealing with work stress and didn’t notice the imbalance.

🛠️ Resolution Tips:
1. Schedule a weekly check-in to talk about emotional needs.
2. Alternate who plans the weekly date or activity.
3. Create a shared calendar to visualize together time.

💬 Empathy Prompts:
Partner A: “I didn’t realize how much that affected you. I want us to feel balanced.”
Partner B: “Thank you for telling me. I’ll try to be more mindful of our connection.”

Now, analyze the perspectives above and generate output in that format, using friendly and compassionate wording. Output everything as readable text.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a wise, emotionally intelligent relationship coach.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData, 'Status:', response.status);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error('No response from OpenAI.');
    }

    // Send generated text as ai_resolution_plan and leave ai_summary/ai_reflection blank
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          summary: "", // deprecated
          reflection: "", // deprecated
          plan: aiResponse // main formatted output, ready to render as markdown or plain text
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in resolve-conflict function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
