import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { codeSnippet } = await req.json();

    if (!codeSnippet || typeof codeSnippet !== 'string') {
      return NextResponse.json({ error: 'Invalid request body. "codeSnippet" (string) is required.' }, { status: 400 });
    }

    // Construct a prompt for the AI model
    const promptContent = `Analyze the following code snippet and generate a concise title (5-10 words) and a brief description (1-2 sentences) for it.

Return the response as a JSON object with 'title' and 'description' keys.

Code Snippet:
\`\`\`
${codeSnippet}
\`\`\`
`;

    // Call the internal chat API (or Pollinations directly if preferred)
    // We'll use the chat API as it likely handles model selection and other setup
    const aiResponse = await fetch(`${req.nextUrl.origin}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates titles and descriptions for code snippets in JSON format.' },
          { role: 'user', content: promptContent }
        ],
        model: 'openai', // Or a code-specific model if available, like 'qwen-coder'
        json_format: true // Assuming the chat API supports a flag for JSON output
      }),
      // Increased timeout for potentially longer AI responses
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Error calling internal chat API:', aiResponse.status, errorText);
      return NextResponse.json({ error: `Error from AI service: ${aiResponse.status}` }, { status: 500 });
    }

    const aiData = await aiResponse.json();

    // Extract content from the AI response
    // This might need adjustment based on the actual structure returned by /api/chat
    const rawContent = aiData?.choices?.[0]?.message?.content;

    if (!rawContent) {
       console.error('AI response content is empty or malformed:', aiData);
       return NextResponse.json({ error: 'AI service returned empty or malformed content.' }, { status: 500 });
    }

    let title = "Generated Title";
    let description = "Generated description.";

    try {
        // Attempt to parse the raw content as JSON
        const parsedContent = JSON.parse(rawContent);
        title = parsedContent.title || title;
        description = parsedContent.description || description;
    } catch (parseError) {
        console.warn("Failed to parse AI response as JSON, attempting regex extraction:", parseError);
        // Fallback: use regex to extract title and description if JSON parsing fails
        const titleMatch = rawContent.match(/"title":\s*"(.*?)"/);
        const descriptionMatch = rawContent.match(/"description":\s*"(.*?)"/);
        
        if (titleMatch?.[1]) title = titleMatch[1];
        if (descriptionMatch?.[1]) description = descriptionMatch[1];

        // Basic cleanup in case of regex extraction
        title = title.replace(/\\"/g, '"'); // Unescape escaped quotes
        description = description.replace(/\\"/g, '"'); // Unescape escaped quotes
    }


    return NextResponse.json({ title, description });

  } catch (error) {
    console.error('Error in suggest-snippet-details API route:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}