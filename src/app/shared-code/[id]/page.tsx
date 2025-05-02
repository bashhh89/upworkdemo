'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Copy, ArrowLeft, Check, Share2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

interface CodeArtifact {
  id: string;
  code: string;
  language: string;
  title: string;
  description: string;
  createdAt: Date;
  preview?: string;
}

export default function SharedCodePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [artifact, setArtifact] = useState<CodeArtifact | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved artifacts from localStorage
    const loadArtifact = () => {
      try {
        const savedItems = localStorage.getItem('codeArtifacts');
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          }));
          
          const found = parsedItems.find((item: CodeArtifact) => item.id === id);
          
          if (found) {
            setArtifact(found);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading saved artifact:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadArtifact();
  }, [id]);

  const copyCode = () => {
    if (artifact) {
      navigator.clipboard.writeText(artifact.code);
      setCopied(true);
      toast({
        title: "Code copied!",
        description: "The code has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const copyShareLink = () => {
    if (artifact) {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast({
        title: "Share link copied!",
        description: "Share this link to give others access to this code snippet.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Generate appropriate preview content
  const getPreviewContent = () => {
    if (!artifact) return '';
    
    const { code, language } = artifact;
    
    // Similar to the preview logic in ChatSection.tsx
    const isHTML = (code: string): boolean => {
      return code.trim().startsWith('<') && 
            (code.includes('<html') || code.includes('<body') || 
              code.includes('<div') || code.includes('<head'));
    };
    
    // Check if code is CSS
    const isCSS = (code: string): boolean => {
      const cssPatterns = [
        /\s*\{[\s\S]*?\}\s*/,  // CSS blocks
        /\s*:\s*[\w\s\d#]+;/   // property: value;
      ];
      return cssPatterns.some(pattern => pattern.test(code));
    };
    
    // For HTML, we need to ensure it includes CSS and JS if possible
    if (language === 'html' || isHTML(code)) {
      // If code doesn't have <style> or <script> tags and seems to be just HTML structure
      if (!code.includes('<style>') && !code.includes('<script>')) {
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Default styles to make preview look nicer */
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
      line-height: 1.5;
      padding: 20px; 
      max-width: 1200px;
      margin: 0 auto;
      color: #333;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background: #2563eb;
    }
    input, select, textarea {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
  <script>
    // Default interactive functions
    function setupInteractivity() {
      // Add click listeners to buttons
      document.querySelectorAll('button').forEach(button => {
        if (!button.hasAttribute('data-action')) {
          button.setAttribute('data-action', 'demo');
          button.addEventListener('click', function() {
            alert('Button clicked!');
          });
        }
      });
    }
    
    // Run after DOM is loaded
    document.addEventListener('DOMContentLoaded', setupInteractivity);
  </script>
</head>
<body>
  ${code}
</body>
</html>`;
      }
      return code;
    } else if (language === 'css' || isCSS(code)) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${code}</style>
</head>
<body>
  <div class="preview-container" style="padding: 20px; font-family: system-ui, sans-serif;">
    <h1>CSS Preview</h1>
    <p>This is a paragraph to demonstrate text styling.</p>
    <button>This is a button</button>
    <div class="box" style="margin-top: 20px; padding: 20px; border: 1px solid #ccc;">This is a div with class "box"</div>
    <form style="margin-top: 20px;">
      <div style="margin-bottom: 10px;">
        <label for="name">Name:</label>
        <input type="text" id="name" placeholder="Enter your name">
      </div>
      <div style="margin-bottom: 10px;">
        <label for="email">Email:</label>
        <input type="email" id="email" placeholder="Enter your email">
      </div>
      <button type="button">Submit</button>
    </form>
  </div>
</body>
</html>`;
    } else if (language === 'javascript' || language === 'js') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      padding: 20px; 
      max-width: 800px;
      margin: 0 auto;
    }
    .output { 
      background: #f5f5f5; 
      padding: 15px; 
      border-radius: 6px; 
      margin-top: 20px;
      border: 1px solid #e0e0e0;
      min-height: 100px;
    }
    h1 { 
      margin-top: 0; 
      color: #333;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 8px;
    }
    .error {
      color: #e11d48;
      font-weight: bold;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #2563eb;
    }
    .controls {
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <h1>JavaScript Output</h1>
  <div class="output" id="output">Output will appear here</div>
  <div class="controls">
    <button onclick="runCode()">Run Code Again</button>
    <button onclick="clearOutput()">Clear Output</button>
  </div>
  
  <script>
    const output = document.getElementById('output');
    
    // Redirect console.log to our output div
    const originalLog = console.log;
    console.log = function(...args) {
      originalLog.apply(console, args);
      output.innerHTML += args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ') + '<br>';
    };
    
    // Error handling
    window.onerror = function(message, source, lineno, colno, error) {
      output.innerHTML += '<span class="error">Error: ' + message + '</span><br>';
      return true;
    };
    
    function clearOutput() {
      output.innerHTML = '';
    }
    
    function runCode() {
      clearOutput();
      try {
        // Run the code
        ${code}
      } catch (error) {
        output.innerHTML += '<span class="error">Error: ' + error.message + '</span>';
      }
    }
    
    // Initial run
    runCode();
  </script>
</body>
</html>`;
    } else if (language === 'jsx' || language === 'tsx' || language === 'react') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      padding: 20px; 
      max-width: 800px;
      margin: 0 auto;
    }
    #root {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      min-height: 200px;
      margin-top: 20px;
    }
    .error {
      color: #e11d48;
      font-weight: bold;
      padding: 10px;
      background: #fff1f2;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    h1 { 
      margin-top: 0; 
      color: #333;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 8px;
    }
  </style>
</head>
<body>
  <h1>React Preview</h1>
  <div id="error-display"></div>
  <div id="root"></div>

  <script type="text/babel">
    try {
      ${code}
      
      // Default render if no ReactDOM.render is in the code
      if (!${code.includes('ReactDOM.render') || code.includes('createRoot')}) {
        // Check if there's a component named App or a default export
        if (typeof App !== 'undefined') {
          ReactDOM.render(<App />, document.getElementById('root'));
        } else if (typeof Component !== 'undefined') {
          ReactDOM.render(<Component />, document.getElementById('root'));
        } else {
          document.getElementById('error-display').innerHTML = 
            '<div class="error">No React component found to render. Name your component "App" or "Component".</div>';
        }
      }
    } catch (error) {
      document.getElementById('error-display').innerHTML = 
        '<div class="error">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`;
    } else {
      return `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; padding: 20px;">
  <div>
    <h2>No preview available for ${language} code</h2>
    <p>Preview is only available for HTML, CSS, JavaScript, and React.</p>
    <pre style="background: #f5f5f5; padding: 15px; border-radius: 6px; overflow: auto;">${code}</pre>
  </div>
</body>
</html>`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <div className="text-center">
          <div className="mb-4">Loading shared code...</div>
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-bold mb-4">Code Snippet Not Found</h1>
          <p className="mb-6">
            The code snippet you're looking for doesn't exist or is no longer available.
            Shared code snippets are stored in your browser's local storage and aren't available across different devices.
          </p>
          <Link href="/" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#333] p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-white hover:text-blue-400 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to App
          </Link>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={copyShareLink}
              className="bg-[#111] hover:bg-[#222] text-white border border-[#333] rounded px-3 py-1.5 text-sm flex items-center"
            >
              {linkCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-2" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 mr-2" />
                  <span>Share</span>
                </>
              )}
            </button>
            
            <button 
              onClick={copyCode}
              className="bg-[#111] hover:bg-[#222] text-white border border-[#333] rounded px-3 py-1.5 text-sm flex items-center"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-2" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>
      
      {artifact && (
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">{artifact.title}</h1>
            <p className="text-gray-400">{artifact.description}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full mr-3">
                {artifact.language}
              </span>
              <span>Created: {new Date(artifact.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-[#333] rounded-md overflow-hidden">
              <div className="border-b border-[#333] px-4 py-2 bg-[#0a0a0a] flex justify-between items-center">
                <span className="text-white font-medium">Code</span>
                <button 
                  onClick={copyCode}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 overflow-auto text-white text-sm font-mono h-[400px]">
                <code>{artifact.code}</code>
              </pre>
            </div>
            
            <div className="bg-white border border-[#333] rounded-md overflow-hidden h-[400px]">
              <div className="border-b border-[#333] px-4 py-2 bg-[#0a0a0a] flex justify-between items-center">
                <span className="text-white font-medium">Preview</span>
              </div>
              <iframe
                srcDoc={getPreviewContent()}
                className="w-full h-full border-none"
                sandbox="allow-scripts"
                title="Code Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 