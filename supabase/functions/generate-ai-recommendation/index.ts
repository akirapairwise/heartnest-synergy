
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
    const { userId, context, category } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://itmegnklwvtitwknyvkm.supabase.co';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    if (!serviceRoleKey) {
      throw new Error('Supabase service role key is not configured');
    }

    // Define the system prompt based on category
    let systemPrompt = 'You are an AI relationship coach. Generate a personalized, actionable recommendation for improving a romantic relationship.';
    
    if (category === 'books') {
      systemPrompt = 'You are an AI relationship coach specializing in book recommendations. Suggest a specific book that would help this relationship grow, including the author name and a brief explanation of why it would be beneficial.';
    } else if (category === 'activities') {
      systemPrompt = 'You are an AI relationship coach specializing in activities. Suggest a specific activity that this couple could do together to strengthen their bond, with practical steps to implement it.';
    } else if (category === 'date_ideas') {
      systemPrompt = 'You are an AI relationship coach specializing in date ideas. Suggest a creative date idea tailored to this couple\'s relationship context, with specific details on how to plan it.';
    }
    
    systemPrompt += ' Focus on practical, constructive advice that can help partners grow closer, communicate better, and understand each other. Always provide specific, implementable suggestions.';

    console.log(`Generating AI recommendation with category: ${category}`);
    
    // Generate the recommendation using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: `Generate a relationship recommendation based on this context: ${context}` 
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const recommendation = data.choices[0].message.content.trim();
    
    console.log('Successfully generated recommendation. Saving to database...');

    // Insert recommendation into Supabase using SERVICE_ROLE key to bypass RLS
    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/ai_recommendations`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        category: category || 'ai_generated',
        suggestion: recommendation,
        context: context
      })
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      console.error('Supabase response status:', supabaseResponse.status);
      console.error('Supabase error response:', errorText);
      throw new Error(`Supabase insert error: ${errorText}`);
    }

    console.log('Successfully saved recommendation to database');
    
    return new Response(JSON.stringify({ 
      success: true,
      category: category || 'ai_generated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-ai-recommendation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
