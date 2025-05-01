exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Deliver AI API is running",
      endpoints: [
        "/api/pollinations",
        "/api/scraper",
        "/api/contextual-deal-writer",
        "/api/proposal/:id"
      ],
      status: "active"
    }),
    headers: {
      "Content-Type": "application/json"
    }
  };
}; 