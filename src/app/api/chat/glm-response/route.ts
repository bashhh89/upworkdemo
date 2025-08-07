import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, model, thinking } = await request.json(); // Destructure 'thinking' from request

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Replace with your actual API key and endpoint logic
    // The user provided a specific endpoint and key for z.ai
    const ZAI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions'; // Updated based on user feedback
    const ZAI_API_KEY = '33deb7d432c54adf99309adec7cbbd57.Oe83JiBGzFjP2OoP'; // Consider using environment variables for sensitive data

    const formattedMessages = messages.map((msg: any) => ({ role: msg.role, content: msg.content }));

    const thinkingEnabled = thinking?.type === "enabled"; // Determine if thinking is enabled
    console.log("Sending request to Z.ai API with model:", model || "glm-4.5-flash");
    console.log("Thinking enabled:", thinkingEnabled);
    console.log("Z.ai API URL:", ZAI_API_URL);
    // Be careful logging full messages or API keys in production
    // console.log("Formatted messages for Z.ai:", JSON.stringify(formattedMessages, null, 2));

    const aiResponse = await fetch(ZAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      body: JSON.stringify({
        model: model || "glm-4.5-flash",
        messages: formattedMessages,
        thinking: thinkingEnabled ? { type: "enabled" } : { type: "disabled" } // Use the received parameter
      }),
    });

    console.log("Z.ai API response status:", aiResponse.status, aiResponse.statusText);

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error("Z.ai API Error Details:", {
        status: aiResponse.status,
        statusText: aiResponse.statusText,
        data: errorData,
      });
      return NextResponse.json(
        { error: `Failed to fetch from Z.ai API: ${aiResponse.statusText}`, details: errorData },
        { status: aiResponse.status }
      );
    }

    const data = await aiResponse.json();
    console.log("=== Z.ai API Full Response ===");
    console.log(JSON.stringify(data, null, 2));
    console.log("=== End Z.ai API Full Response ===");
    
    let extractedReasoning = null;
    let processedContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";

    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      const message = data.choices[0].message;
      console.log("Message content:", message.content);
      console.log("Message reasoning (direct):", message.reasoning);
      console.log("Message object keys:", Object.keys(message));

      // Attempt 1: Direct 'reasoning' field
      if (message.reasoning) {
        extractedReasoning = message.reasoning;
      }
      // Attempt 2: Check for 'reasoning_content' field (as seen in the logs)
      else if (message.reasoning_content) {
        extractedReasoning = message.reasoning_content;
      }
      // Attempt 3: Extract from content using $...$ tags (COT style)
      // Using [\s\S] instead of . with 's' flag for ES2017 compatibility
      else if (message.content) {
        const reasoningMatch = message.content.match(/\$([\s\S]*?)\$/);
        if (reasoningMatch && reasoningMatch[1]) {
          extractedReasoning = reasoningMatch[1].trim();
          // Remove the $...$ part from the main content
          processedContent = message.content.replace(/\$([\s\S]*?)\$/, '').trim();
        }
      }
      // Attempt 4: Check additional_kwargs (as a fallback, though less likely for this API)
      else if (message.additional_kwargs && message.additional_kwargs.reasoning) {
        extractedReasoning = message.additional_kwargs.reasoning;
      }

      if (extractedReasoning) {
        console.log("Extracted Reasoning:", extractedReasoning);
      } else {
        console.log("No reasoning extracted using current methods.");
      }

      // Modify the response to include processed content and extracted reasoning
      const modifiedResponse = {
        ...data,
        choices: [{
          ...data.choices[0],
          message: {
            ...data.choices[0].message,
            content: processedContent,
            reasoning: extractedReasoning // Add extracted reasoning to the message
          }
        }]
      };
      return NextResponse.json(modifiedResponse);

    } else {
      console.error("Unexpected Z.ai API response format:", data);
      return NextResponse.json({ error: 'Invalid response format from Z.ai API', receivedData: data }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in /api/chat/glm-response:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
