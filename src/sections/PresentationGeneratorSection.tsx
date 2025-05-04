import React, { useState, useEffect, useMemo } from "react";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { TypeAnimation } from 'react-type-animation';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Play, Save } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// Import new components
import { PresentationSlideEditor } from "@/components/presentation/editor/PresentationSlideEditor";
import { PresentationThumbnail } from "@/components/presentation/editor/PresentationThumbnail";
import { PresentationViewer } from '@/components/presentation/viewer/PresentationViewer';

interface SlideData {
  title: string;
  textContent: string;
  imageUrl: string | null;
  layoutType?: string;
  items?: string[];
}

interface SlideOutline {
  title: string;
  points: string[];
}

const STORAGE_KEY = 'aiActionLaunchpad_savedPresentations';

const PresentationGeneratorSection: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [numSlides, setNumSlides] = useState("10");
  const [language, setLanguage] = useState("English (US)");
  const [pageStyle, setPageStyle] = useState("Default");
  const [selectedTextModel, setSelectedTextModel] = useState("openai");

  const [outline, setOutline] = useState<SlideOutline[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentationData, setPresentationData] = useState<SlideData[] | null>(null);
  const [savedPresentationsList, setSavedPresentationsList] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>('theme-default');
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedPresentationsList(JSON.parse(saved));
      }
    } catch {
      setSavedPresentationsList([]);
    }
  }, []);

  const handleLoadPresentation = (id: string) => {
    const pres = savedPresentationsList.find((p) => p.id === id);
    if (pres) {
      setPresentationData(pres.presentationData);
      setCurrentSlideIndex(0);
      setOutline(null);
    }
  };

  const handleDeletePresentation = (id: string) => {
    const filtered = savedPresentationsList.filter((p) => p.id !== id);
    setSavedPresentationsList(filtered);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  };

  const handleSavePresentation = () => {
    if (!presentationData || presentationData.length === 0) return;

    try {
      const currentSavedString = localStorage.getItem(STORAGE_KEY);
      const currentSaved = currentSavedString ? JSON.parse(currentSavedString) : [];

      // Ensure currentSaved is an array
      const presentations = Array.isArray(currentSaved) ? currentSaved : [];

      const newSave = {
        id: uuidv4(),
        // Use original 'topic' state for the title, fallback if needed
        title: topic || presentationData[0]?.title || `Presentation ${Date.now()}`,
        savedAt: Date.now(),
        // Save the full presentationData array with layoutType, items, etc.
        presentationData: presentationData,
      };

      presentations.push(newSave);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));

      // Update the UI list state directly
      setSavedPresentationsList(presentations);

      // Simple alert for notification
      alert('Presentation Saved!');
    } catch (error) {
      console.error("Failed to save presentation:", error);
      alert('Error saving presentation. Check console.');
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setOutline(null);
    setPresentationData(null);
    setCurrentSlideIndex(0);
    try {
      const response = await fetch("/api/presentations/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numSlides, language, pageStyle, model: selectedTextModel }),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setOutline(data);
        } else {
          setError("Unexpected response format from server.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate outline.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePresentation = async () => {
    if (!outline) return;
    setIsLoading(true);
    setError(null);
    setPresentationData(null);
    setCurrentSlideIndex(0);
    try {
      const response = await fetch("/api/presentations/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline, pageStyle, model: selectedTextModel, topic }),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setPresentationData(data as SlideData[]);
        } else {
          setError("Unexpected response format from server.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate presentation.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
        <span className="text-foreground">{outline ? "Generating slides and images..." : "Generating outline..."}</span>
      </div>
    );
  }

  if (outline && !presentationData) {
    // Prepare the sequence for the typing animation
    const animationSequence = outline.reduce((acc, section) => {
      // Optionally type the section title
      acc.push(`${section.title}:`);
      acc.push(500); // Pause after title
      section.points.forEach(point => {
        acc.push(`- ${point}`);
        acc.push(300); // Pause between points
      });
      acc.push('\n'); // Extra pause/newline between sections
      return acc;
    }, [] as Array<string | number>);

    return (
      <div className="py-6 px-6 max-w-screen-lg mx-auto space-y-8 flex flex-col items-center justify-center min-h-screen">
        {error && (
          <div className="bg-destructive text-destructive-foreground border border-destructive rounded p-4 mb-4">
            {error}
          </div>
        )}
        <h1 className="text-2xl font-semibold text-foreground mb-4">Generated Outline</h1>
        <div className="space-y-4 bg-card p-6 rounded-lg shadow w-full">
          <h3 className="text-xl font-semibold mb-3 text-foreground">Generated Outline:</h3>
          <TypeAnimation
            sequence={animationSequence}
            wrapper="div"
            speed={70}
            className="text-sm whitespace-pre-wrap font-mono text-foreground"
            cursor={true}
          />
          <div className="mt-6 text-center">
            <Button onClick={handleGeneratePresentation} disabled={isLoading}>
              {isLoading ? 'Generating Slides...' : 'Looks Good, Generate Slides'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (presentationData && !isLoading && !error) {
    if (isPresenting) {
      return (
        <PresentationViewer
          slides={presentationData}
          initialSlideIndex={currentSlideIndex}
          onExit={() => setIsPresenting(false)}
          themeClass={selectedTheme}
        />
      );
    }
    
    return (
      <div className="py-6 px-6 max-w-screen-lg mx-auto space-y-8 min-h-screen">
        <div className="mb-4 pb-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Select Theme:</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTheme === 'theme-default' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTheme('theme-default')}
              >
                Default Dark
              </Button>
              <Button
                variant={selectedTheme === 'theme-light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTheme('theme-light')}
              >
                Light
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSavePresentation}
              disabled={!presentationData || presentationData.length === 0}
              variant="outline"
              size="sm"
            >
              Save <Save className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => setIsPresenting(true)}
              disabled={!presentationData || presentationData.length === 0}
              size="sm"
            >
              Present <Play className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={cn("flex flex-row gap-4 h-[calc(100vh-300px)] p-4", selectedTheme)}>
          <div className="w-48 flex-shrink-0 flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Slides</h3>
            <ScrollArea className="flex-grow h-0 pr-3">
              {presentationData.map((slide, index) => (
                <PresentationThumbnail
                  key={index}
                  slideData={slide}
                  index={index}
                  isSelected={index === currentSlideIndex}
                  onClick={() => setCurrentSlideIndex(index)}
                />
              ))}
            </ScrollArea>
          </div>
          <div className="flex-grow h-full min-w-0">
            <PresentationSlideEditor
              key={currentSlideIndex}
              slideData={presentationData[currentSlideIndex]}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="py-6 px-6 max-w-screen-lg mx-auto space-y-8 w-full">
      {error && (
        <div className="bg-red-900 text-red-300 border border-red-700 rounded p-4 mb-4">
          {error}
        </div>
      )}
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        Create stunning presentations in seconds with AI
      </h1>
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-muted-foreground">
          What would you like to present about?
        </Label>
        <Textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Describe your topic or paste your content here. Our AI will structure it into a compelling presentation."
          rows={5}
          className="bg-input text-foreground border border-input focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label htmlFor="numSlides" className="text-muted-foreground">
            Number of slides
          </Label>
          <Select value={numSlides} onValueChange={setNumSlides}>
            <SelectTrigger className="bg-input text-foreground border-input focus-visible:ring-ring" disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-input text-foreground border-input">
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="15">15</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="language" className="text-muted-foreground">
            Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-input text-foreground border-input focus-visible:ring-ring" disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-input text-foreground border-input">
              <SelectItem value="English (US)">English (US)</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pageStyle" className="text-muted-foreground">
            Page style
          </Label>
          <Select value={pageStyle} onValueChange={setPageStyle}>
            <SelectTrigger className="bg-input text-foreground border-input focus-visible:ring-ring" disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-input text-foreground border-input">
              <SelectItem value="Default">Default</SelectItem>
              <SelectItem value="Minimalist">Minimalist</SelectItem>
              <SelectItem value="Professional">Professional</SelectItem>
              <SelectItem value="Creative">Creative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="textModel" className="text-muted-foreground">
            Text Model
          </Label>
          <Select value={selectedTextModel} onValueChange={setSelectedTextModel}>
            <SelectTrigger className="bg-input text-foreground border-input focus-visible:ring-ring" disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-input text-foreground border-input">
              <SelectItem value="openai">openai (Default)</SelectItem>
              <SelectItem value="openai-large">openai-large</SelectItem>
              <SelectItem value="mistral">mistral</SelectItem>
              <SelectItem value="llama">llama</SelectItem>
              <SelectItem value="searchgpt">searchgpt</SelectItem>
              <SelectItem value="qwen-coder">qwen-coder</SelectItem>
              <SelectItem value="phi">phi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button
          className="bg-primary hover:bg-primary/90 text-foreground font-semibold px-6 py-2 rounded shadow"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          Generate Outline
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-muted-foreground mb-2">Saved Presentations</h2>
        {savedPresentationsList.length === 0 ? (
          <div className="text-muted-foreground">No saved presentations.</div>
        ) : (
          <div className="space-y-2">
            {savedPresentationsList.map((pres) => (
              <div key={pres.id} className="flex items-center justify-between bg-input border border-border rounded p-3">
                    <div>
                      <div className="text-foreground font-medium">{pres.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(pres.savedAt).toLocaleString()}</div>
                    </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-secondary hover:bg-primary text-foreground px-3 py-1 rounded" onClick={() => handleLoadPresentation(pres.id)}>
                    Load
                  </Button>
                  <Button size="sm" variant="destructive" className="px-3 py-1 rounded" onClick={() => handleDeletePresentation(pres.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default PresentationGeneratorSection; 