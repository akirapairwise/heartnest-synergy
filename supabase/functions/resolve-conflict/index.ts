
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
    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Parse the request body
    const { initiator_statement, responder_statement, conflict_id } = await req.json();

    if (!initiator_statement || !responder_statement || !conflict_id) {
      throw new Error('Missing required parameters');
    }

    console.log(`Processing conflict resolution for conflict ID: ${conflict_id}`);

    // Format the prompt for OpenAI
    const prompt = `
As a relationship coach and conflict mediator, analyze the following statements from two partners in a conflict:

PARTNER 1's PERSPECTIVE:
${initiator_statement}

PARTNER 2's PERSPECTIVE:
${responder_statement}

Based on these perspectives, provide:
1. A brief, neutral summary of the core issue (2-3 sentences)
2. A thoughtful reflection about underlying dynamics or patterns (2-3 sentences)
3. A practical 3-step action plan to help resolve this conflict

Format your response using JSON with these keys: "summary", "reflection", and "plan".
`;

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
          { role: 'system', content: 'You are a skilled relationship coach and mediator.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI response received, parsing...');
    
    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response if it's not already in JSON format
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      parsedResponse = JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing AI response as JSON:', error);
      console.log('Raw AI response:', aiResponse);
      
      // If JSON parsing fails, try to extract sections manually
      const summary = aiResponse.match(/summary[:\s]+(.*?)(?=reflection|plan|$)/is)?.[1]?.trim() || 
                    "The AI couldn't generate a properly formatted response.";
                    
      const reflection = aiResponse.match(/reflection[:\s]+(.*?)(?=plan|$)/is)?.[1]?.trim() || 
                       "Please review both perspectives and consider underlying patterns.";
                       
      const plan = aiResponse.match(/plan[:\s]+(.*?)(?=$)/is)?.[1]?.trim() || 
                 "1. Have a calm discussion\n2. Listen actively to each other\n3. Work together on a solution";
      
      parsedResponse = { summary, reflection, plan };
    }

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
