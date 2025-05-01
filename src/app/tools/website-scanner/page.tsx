import { WebsiteScraperSection } from "@/app/sections/WebsiteScraperSection";

export const metadata = {
  title: 'Website Intelligence Scanner - Deliver AI Platform',
  description: 'Analyze any website to extract comprehensive business intelligence and competitive insights',
}

export default function WebsiteScanner() {
  return (
    <main className="min-h-screen bg-[#0c0c0c] text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Website <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">Intelligence</span> Scanner
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Extract comprehensive business insights from any company website in seconds
          </p>
        </div>
        
        <WebsiteScraperSection />
      </div>
    </main>
  );
} 