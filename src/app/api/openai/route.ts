import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const systemInstruction = `You are a Personal Finance Advisor with expertise in:
- Budgeting and expense tracking
- Investment strategies and portfolio management
- Debt management and reduction
- Retirement planning
- Tax optimization
- Emergency fund planning

Provide practical, actionable financial advice tailored to individual circumstances.
Best suited for personal finance questions, budget reviews, and investment guidance.
Keep responses under 500 characters while maintaining clarity and value.
Do not provide specific investment recommendations or legal advice.`

export async function POST(req: Request) {
  try {
    // Parse and log the incoming request body
    const json = await req.json()
    const { messages } = json
    console.log('Incoming messages:', messages)

    // Validate the messages array
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format')
      return new Response('Messages array is required', { status: 400 })
    }

    const fullMessages = [
      { role: 'system', content: systemInstruction },
      ...messages
    ]
    console.log('Full messages with system instruction:', fullMessages)

    // Create the completion stream
    console.log('Creating OpenAI completion stream...')
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: fullMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 500
    })

    // Create a readable stream from the OpenAI response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullResponse = ''

        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            fullResponse += content
            console.log('Chunk received:', content)
            
            // Format as Server-Sent Event
            const data = JSON.stringify({ content, fullResponse })
            const message = `data: ${data}\n\n`
            controller.enqueue(encoder.encode(message))
          }
        }
        controller.close()
      }
    })

    // Return the stream with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error) {
    console.error('Error in chat completion:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}