
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

    console.log('Processing conflict with ID:', conflict_id);

    // Format the improved prompt for OpenAI, following user instructions
    const prompt = `
You are a wise and emotionally intelligent relationship coach. Your goal is to neutrally summarize both sides of a conflict between two partners and offer calm, healing suggestions. Use soft, non-blaming language. Encourage empathy and connection. 

Partner A's perspective:
${initiator_statement}

Partner B's perspective:
${responder_statement}

Instructions:
1. First, provide a neutral summary of the conflict (2-3 sentences).
2. Then, provide 2-3 practical, actionable tips for resolving the conflict.
3. Finally, suggest one empathy-based statement that each partner could say to reconnect.

Return the result in the following JSON format:

{
  "summary": "Brief neutral summary of the conflict...",
  "resolution_tips": "A list of 2–3 actionable tips for resolving the conflict.",
  "empathy_prompts": "Two empathy-based statements, one from each partner to reconnect."
}`;

    console.log('Sending request to OpenAI');

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
        response_format: { type: "json_object" }
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

    console.log('Successfully received response from OpenAI');

    // Parse the JSON response from OpenAI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
      // Validate that the required fields are present
      if (!parsedResponse.summary || !parsedResponse.resolution_tips || !parsedResponse.empathy_prompts) {
        throw new Error('OpenAI response missing required fields');
      }
    } catch (e) {
      console.error('Error parsing OpenAI response:', e, 'Raw response:', aiResponse);
      throw new Error('Invalid format in OpenAI response');
    }

    // Return the parsed AI-generated content
    return new Response(
      JSON.stringify({
        success: true,
        data: parsedResponse
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
