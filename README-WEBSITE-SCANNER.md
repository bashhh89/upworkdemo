# Website Intelligence Scanner

This tool provides comprehensive analysis of any company website, extracting valuable business intelligence including brand identity, product offerings, target markets, competitive positioning, and more.

## Setup Instructions

### 1. Environment Variables

Create or update your `.env.local` file in the project root with the following:

```
# OpenAI API Key - required for website scraper feature
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with a valid OpenAI API key that has access to GPT-4 models.

### 2. Installation

Make sure all dependencies are installed:

```bash
pnpm install
```

### 3. Start the Development Server

```bash
pnpm dev
```

### 4. Using the Website Scanner

1. Access the tool through the sidebar navigation by clicking on "Website Intelligence"
2. Enter any website URL (including https://) in the input field
3. Click "Analyze Website" to start the scanning process
4. View the comprehensive analysis results across various business intelligence categories
5. Use the tabs to explore extracted links and images
6. Download a full report or copy specific sections as needed

## Features

- **Deep Website Analysis**: Extract company information, products/services, target audience, and more
- **Competitive Intelligence**: Analyze marketing approach, value propositions, and positioning
- **Technical Insights**: Identify technologies used in the website
- **Visual Content Analysis**: View all images from the website
- **Link Extraction**: Discover all hyperlinks and their destinations
- **One-Click Reports**: Download complete analysis in text format

## How It Works

The tool combines traditional web scraping with advanced AI analysis:

1. The backend fetches the target website's HTML content
2. Basic metadata (title, meta description, links, images) is extracted through regex patterns
3. The full HTML is analyzed by GPT-4o to extract comprehensive business intelligence
4. All data is consolidated into a structured format for display and download
5. The interface presents the information in organized, visually appealing sections

## Troubleshooting

- **CORS Issues**: Some websites may block scraping attempts. Try using websites that allow public access.
- **API Key Errors**: Ensure your OpenAI API key is valid and has sufficient quota.
- **Large Websites**: Very large websites may timeout during analysis - try using specific landing pages instead.

## Privacy & Legal Considerations

This tool is designed for legitimate business research only. Always:

- Respect robots.txt directives and website terms of service
- Do not use for scraping private or access-restricted content
- Consider the legal implications in your jurisdiction when scraping websites 