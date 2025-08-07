import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'glm-4.5-flash', thinking = { type: 'enabled' }, apiConfig } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Use the provided API config or default to Z.ai
    const config = apiConfig || {
      url: 'https://api.z.ai/api/paas/v4/chat/completions',
      key: '33deb7d432c54adf99309adec7cbbd57.Oe83JiBGzFjP2OoP',
      headers: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };

    // Add system message for tool context
    const systemMessage = {
      role: 'system',
      content: `You are an intelligent AI assistant with access to powerful tools including:
- Website Intelligence Scanner: Analyze websites for business insights
- Executive Persona Creator: Generate detailed executive profiles  
- Image Generator: Create custom images and graphics
- Voice Synthesis: Generate professional voiceovers
- AI Readiness Assessment: Evaluate AI implementation readiness

When creating code, wrap it in proper markdown code blocks. For HTML/CSS/JS that should be interactive, use the artifact format.

Be helpful, concise, and professional. When users ask about analyzing websites, creating personas, or other tasks that match your tools, guide them to use the appropriate tool by suggesting they type "/" to access the tool menu.`
    };

    const formattedMessages = [systemMessage, ...messages.map((msg: any) => ({ 
      role: msg.role, 
      content: msg.content 
    }))];

    console.log("Sending request with model:", model);
    console.log("Thinking enabled:", thinking?.type === "enabled");

    const aiResponse = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        thinking: thinking,
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error("AI API Error:", {
        status: aiResponse.status,
        statusText: aiResponse.statusText,
        data: errorData,
      });
      return NextResponse.json(
        { error: `AI API failed: ${aiResponse.statusText}`, details: errorData },
        { status: aiResponse.status }
      );
    }

    const data = await aiResponse.json();
    
    // Extract reasoning and content
    let extractedReasoning = null;
    let processedContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";

    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      const message = data.choices[0].message;

      // Extract reasoning from various possible fields
      if (message.reasoning) {
        extractedReasoning = message.reasoning;
      } else if (message.reasoning_content) {
        extractedReasoning = message.reasoning_content;
      } else if (message.content) {
        // Extract from $...$ tags
        const reasoningMatch = message.content.match(/\$([\s\S]*?)\$/);
        if (reasoningMatch && reasoningMatch[1]) {
          extractedReasoning = reasoningMatch[1].trim();
          processedContent = message.content.replace(/\$([\s\S]*?)\$/, '').trim();
        }
      }

      // Return formatted response
      return NextResponse.json({
        choices: [{
          message: {
            content: processedContent,
            reasoning: extractedReasoning,
            role: 'assistant'
          }
        }]
      });
    }

    return NextResponse.json({ error: 'Invalid response format from AI API' }, { status: 500 });

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

