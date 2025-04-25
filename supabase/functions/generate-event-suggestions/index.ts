
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, location, mood, interests, dietaryPreferences, budget, timing, specialDates } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://itmegnklwvtitwknyvkm.supabase.co';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log(`Generating event suggestions for user ${userId} in ${location}`);
    
    // Construct the prompt for OpenAI
    const systemPrompt = `You are "Pairwise Planner," an AI-powered event assistant for couples. 
    Based on the following inputs, generate 4-6 personalized, nearby date or relationship-building activity suggestions.
    
    Format each suggestion in a JSON object with these fields:
    - title (string): A catchy, descriptive name for the activity
    - description (2-3 sentences): Brief overview of what the activity entails
    - cost ("low"/"medium"/"high"): Approximate cost range
    - duration (string): Estimated time needed, e.g. "2 hours"
    - distance (string): Approximate distance, e.g. "3 km away" (if location provided)
    - benefit (string): One sentence on why this will strengthen their relationship
    - event_link (string, optional): URL for more info (only include if it's a specific event)
    
    Output ONLY a valid JSON array of suggestion objects. Include realistic, varied suggestions based on the provided context.`;

    const userPrompt = `Generate personalized event suggestions based on these details:
    Location: ${location || 'Unknown'}
    Mood/Goals: ${mood || 'Spending quality time together'}
    Interests: ${interests || 'Not specified'}
    Dietary Preferences: ${dietaryPreferences || 'No specific preferences'}
    Budget Range: ${budget || 'Medium'}
    Timing: ${timing || 'Weekend, afternoon'}
    Special Dates: ${specialDates || 'None mentioned'}`;
    
    // Generate the suggestions using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const suggestionsText = data.choices[0].message.content.trim();
    
    console.log('Successfully generated suggestions');
    
    // Parse the response as JSON (it should be a JSON array)
    let suggestions;
    try {
      suggestions = JSON.parse(suggestionsText);
    } catch (error) {
      console.error('Error parsing OpenAI response as JSON:', error);
      throw new Error('Failed to parse event suggestions');
    }
    
    // Save to Supabase if we have a service role key
    if (serviceRoleKey && userId) {
      try {
        const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/event_suggestions`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            suggestions: suggestions,
            context: { location, mood, interests, timing }
          })
        });

        if (!supabaseResponse.ok) {
          console.error('Error saving suggestions to database:', await supabaseResponse.text());
        }
      } catch (error) {
        // Log but don't fail if saving to database fails
        console.error('Error saving to database:', error);
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      suggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-event-suggestions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
