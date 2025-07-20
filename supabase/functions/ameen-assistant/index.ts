
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_supabase_edge

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  message: string;
  conversationId?: string;
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { message, conversationId, userId } = await req.json() as RequestBody

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    let currentConversationId = conversationId

    // If no conversation ID is provided, create a new conversation
    if (!currentConversationId) {
      const { data: newConversation, error: conversationError } = await supabaseClient
        .from('conversations')
        .insert({ user_id: userId, title: 'New Conversation' })
        .select('id')
        .single()

      if (conversationError) {
        throw conversationError
      }

      currentConversationId = newConversation.id
    }

    // Store the user message
    const { error: userMessageError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        content: message,
        role: 'user'
      })

    if (userMessageError) {
      throw userMessageError
    }

    // Generate Ameen's response
    // In a real implementation, this would call an AI service
    // For now, we'll simulate a response
    const assistantResponse = generateAmeenResponse(message)

    // Store the assistant message
    const { error: assistantMessageError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        content: assistantResponse,
        role: 'assistant'
      })

    if (assistantMessageError) {
      throw assistantMessageError
    }

    // Return the response
    return new Response(
      JSON.stringify({
        response: assistantResponse,
        conversationId: currentConversationId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function generateAmeenResponse(message: string): string {
  // This is a simple response generator
  // In a real implementation, this would call an AI model API
  
  const greetings = ['hello', 'hi', 'hey', 'greetings']
  const lowerMessage = message.toLowerCase()
  
  if (greetings.some(greeting => lowerMessage.includes(greeting))) {
    return "Hello! I'm Ameen, your business assistant. How can I help you today?"
  }
  
  if (lowerMessage.includes('sales') || lowerMessage.includes('order')) {
    return "I can help you manage your sales and orders. Would you like me to show you the latest sales report or help you process a new order?"
  }
  
  if (lowerMessage.includes('marketing') || lowerMessage.includes('campaign')) {
    return "I can assist with your marketing efforts. Would you like to review current campaigns or create a new marketing strategy?"
  }
  
  if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
    return "I can generate various business reports for you. What specific data would you like to analyze?"
  }
  
  if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
    return "I can help you manage customer relationships. Would you like to review customer data or handle a specific customer inquiry?"
  }
  
  // Default response
  return "I'm here to help with your business needs. You can ask me about sales, marketing, reports, customer management, or any other business operation you'd like assistance with."
}