const fetch = require('node-fetch');

// This exports a handler function compatible with Netlify Functions
// It acts as a proxy to your Next.js API routes
exports.handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/api', '');
  const apiPath = path || '/';
  
  // Get the API endpoint being accessed
  console.log(`API request for: ${apiPath}`);
  
  try {
    // Handle different API endpoints
    if (apiPath.includes('/pollinations')) {
      // Handle Pollinations API requests
      const requestBody = JSON.parse(event.body || '{}');
      
      // Forward to the appropriate Pollinations API
      let endpoint = "https://api.pollinations.ai/v1/chat/completions";
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestBody,
          // Add any needed authentication here
        }),
      });
      
      const data = await response.json();
      
      return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    } 
    else if (apiPath.includes('/scraper')) {
      // Handle website scraping requests
      const requestBody = JSON.parse(event.body || '{}');
      const { url } = requestBody;
      
      // Simple website scraping function
      const scrapeResult = {
        title: "Website Analysis",
        content: `Website analysis for ${url} is available in the full version`,
        url: url,
      };
      
      return {
        statusCode: 200,
        body: JSON.stringify(scrapeResult),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    else if (apiPath.includes('/contextual-deal-writer')) {
      // Handle deal writer requests
      const requestBody = JSON.parse(event.body || '{}');
      
      // Simplified response with placeholder data
      const dealResponse = {
        id: "proposal-" + Date.now(),
        title: "Business Proposal",
        content: "This is a sample proposal. The full version includes personalized content based on your inputs.",
        timestamp: new Date().toISOString()
      };
      
      return {
        statusCode: 200,
        body: JSON.stringify(dealResponse),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    else if (apiPath.includes('/proposal')) {
      // Handle proposal retrieval
      const proposalId = apiPath.split('/').pop();
      
      // Placeholder proposal data
      const proposal = {
        id: proposalId,
        title: "Sample Proposal",
        content: "# Sample Proposal\n\nThis is a sample business proposal. In the full version, this would contain your personalized proposal content.",
        created: new Date().toISOString()
      };
      
      return {
        statusCode: 200,
        body: JSON.stringify(proposal),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    // Default response for any other API routes
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "API endpoint is running. Please use a specific endpoint for functionality." 
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error("API error:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}; 