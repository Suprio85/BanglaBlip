// Use edge runtime for better SSE support on Vercel
export const runtime = 'edge'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const backendUrl = ((formData.get('backendUrl') as string | null) ?? '').trim()
    const imageFile  = formData.get('image') as File | null
    const imageUrl   = ((formData.get('imageUrl') as string | null) ?? '').trim()

    if (!backendUrl) {
      return new Response(
        JSON.stringify({ error: 'No backend URL provided. Please enter your Colab ngrok URL.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!imageFile && !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'No image file or URL provided.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (imageFile && !imageFile.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Please upload an image.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Forward to the appropriate Colab endpoint
    let colabResponse: Response
    if (imageUrl) {
      colabResponse = await fetch(`${backendUrl}/caption/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      })
    } else {
      const colabForm = new FormData()
      colabForm.append('file', imageFile!)
      colabResponse = await fetch(`${backendUrl}/caption/upload`, {
        method: 'POST',
        body: colabForm,
      })
    }

    if (!colabResponse.ok) {
      const errorText = await colabResponse.text().catch(() => colabResponse.statusText)
      throw new Error(`Backend returned ${colabResponse.status}: ${errorText}`)
    }

    const { caption } = await colabResponse.json() as { caption: string }

    if (!caption) {
      throw new Error('No caption returned from backend')
    }

    const words = caption.split(' ').filter(Boolean)

    // Stream the caption back word by word via SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`))

        for (let i = 0; i < words.length; i++) {
          const isLastWord = i === words.length - 1
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'chunk',
                content: words[i] + (isLastWord ? '' : ' '),
              })}\n\n`
            )
          )
          await sleep(80)
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'end' })}\n\n`))
        controller.close()
      },
    })

    // Return SSE response with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        // CORS headers for cross-origin requests if needed
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate caption'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
