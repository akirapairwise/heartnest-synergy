
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

    const { initiator_statement, responder_statement, conflict_id, initiator_name, responder_name, initiator_id } = parsedData;

    // Add proper validation for required fields
    if (!initiator_statement || !responder_statement || !conflict_id) {
      console.error('Missing required parameters');
      throw new Error('Missing required parameters');
    }

    // Use provided names or default to initiator/responder if not available
    const initiatorName = initiator_name || "Initiator";
    const responderName = responder_name || "Responder";

    console.log('Processing conflict with ID:', conflict_id);

    // Format the improved prompt for OpenAI, using personalized names
    const prompt = `
You are a compassionate and emotionally intelligent relationship coach. Your role is to neutrally understand conflicts between two partners, summarize the issue fairly, suggest practical resolution steps, and generate empathy-based messages for each partner to help them reconnect. Use gentle, supportive language. Do not take sides.

${initiatorName}'s perspective:
${initiator_statement}

${responderName}'s perspective:
${responder_statement}

Please:
1. Summarize the conflict neutrally (2-3 sentences).
2. Suggest 2-3 practical and emotionally safe steps they can take to resolve the issue.
3. Write one empathy-based message from ${initiatorName} to ${responderName}.
4. Write one empathy-based message from ${responderName} to ${initiatorName}.

Return your complete answer in this exact JSON format:

{
  "summary": "Neutrally written overview of the conflict...",
  "resolution_tips": "- Tip 1\\n- Tip 2\\n- Tip 3",
  "empathy_prompts": {
    "partner_a": "Empathy message from ${initiatorName} to ${responderName}",
    "partner_b": "Empathy message from ${responderName} to ${initiatorName}"
  }
}

Ensure all fields are complete and thoroughly filled out. Do not abbreviate or cut off any content. The empathy messages should be detailed, thoughtful, and complete.`;

    console.log('Sending request to OpenAI');

    // Call OpenAI API with increased token limit
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a wise, emotionally intelligent relationship coach. Provide complete, untruncated responses.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
        max_tokens: 8000, // Significantly increased to ensure no truncation
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
    console.log('Response length:', aiResponse.length);

    // Parse the JSON response from OpenAI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
      // Validate that the required fields are present and not truncated
      if (!parsedResponse.summary || 
          !parsedResponse.resolution_tips || 
          !parsedResponse.empathy_prompts ||
          !parsedResponse.empathy_prompts.partner_a ||
          !parsedResponse.empathy_prompts.partner_b) {
        console.error('OpenAI response missing required fields or contains truncated content:', parsedResponse);
        throw new Error('OpenAI response missing required fields or contains truncated content');
      }
      
      // Additional validation to check for truncation in each field
      const summaryLength = parsedResponse.summary.length;
      const tipsLength = parsedResponse.resolution_tips.length;
      const promptALength = parsedResponse.empathy_prompts.partner_a.length;
      const promptBLength = parsedResponse.empathy_prompts.partner_b.length;
      
      console.log(`Field lengths - Summary: ${summaryLength}, Tips: ${tipsLength}, PromptA: ${promptALength}, PromptB: ${promptBLength}`);
      
      if (summaryLength < 10 || tipsLength < 10 || promptALength < 20 || promptBLength < 20) {
        throw new Error('Detected potentially truncated content in the OpenAI response');
      }
    } catch (e) {
      console.error('Error parsing OpenAI response:', e, 'Raw response:', aiResponse);
      throw new Error('Invalid format in OpenAI response');
    }

    // If initiator_id is provided, create a notification about the conflict resolution
    if (initiator_id) {
      try {
        // Set up Supabase client using env variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseKey) {
          const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
          
          // Create notification for the initiator that the conflict has been resolved
          await supabaseAdmin.from('notifications').insert({
            user_id: initiator_id,
            type: 'conflict_resolution',
            title: 'Conflict Resolution Available',
            message: `The AI has provided resolution guidance for your conflict about "${parsedData.topic || 'your recent discussion'}"`,
            related_id: conflict_id
          });
          
          console.log('Created notification for conflict resolution');
        }
      } catch (error) {
        console.error('Failed to create notification:', error);
        // Continue with the function even if notification creation fails
      }
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

// Import at the top of the file
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
