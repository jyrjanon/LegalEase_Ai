import { useState, useEffect, useRef } from 'react';
import showdown from 'showdown';
const mdConverter = new showdown.Converter();
// --- ICONS (Corrected and Complete) ---
const SunIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /><circle cx="12" cy="12" r="5" /></svg>);
const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-gray-400 dark:text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
const LoadingSpinner = () => (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>);
const ShieldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const ZapIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>);
const DatabaseZapIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6c0-1.66 4-3 8-3s8 1.34 8 3"/><path d="M4 6v6c0 1.66 4 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 4 3 8 3s8-1.34 8-3v-6"/><path d="m18 14-4 4h6l-4 4"/></svg>);
const MicIcon = ({ isListening }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-6 w-6 ${isListening ? 'text-red-500' : ''}`}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://legalease-ai-backend.onrender.com';

// --- CHILD COMPONENTS ---
const InputSection = ({
    documentText, setDocumentText, language, setLanguage,
    isLoading, error, setError, uploadedImageFile, setUploadedImageFile, uploadedImageSrc,
    setUploadedImageSrc, handleAnalysis, setAnalysisText
}) => {
    const analyzeFileInputRef = useRef(null);

    const handleTextareaChange = (e) => {
      if (uploadedImageFile || uploadedImageSrc) {
        setUploadedImageFile(null);
        setUploadedImageSrc(null);
        setAnalysisText("");
      }
      setDocumentText(e.target.value);
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalysisText("");
        setDocumentText('');

        if (file.type.startsWith('image/')) {
            setUploadedImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => setUploadedImageSrc(event.target.result);
            reader.readAsDataURL(file);
        } else {
            setUploadedImageFile(null);
            setUploadedImageSrc(null);
            readFile(file, (text) => {
                setDocumentText(text);
            });
        }
    };

    const readFile = (file, callback) => {
        const reader = new FileReader();
        if (file.type === 'application/pdf') {
            reader.onload = (e) => {
                if(!window.pdfjsLib){
                  setError("PDF library is not available. Please refresh the page.");
                  return;
                }
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    window.pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                        const pagePromises = Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then(page => page.getTextContent().then(content => content.items.map(item => item.str).join(' '))));
                        Promise.all(pagePromises).then(pagesText => { callback(pagesText.join('\n\n')); });
                    }).catch(() => setError("Could not read the PDF file. It might be corrupted or protected."));
                } catch (error) {
                     setError("An unexpected error occurred while processing the PDF.");
                }
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'text/plain') {
            reader.onload = (e) => callback(e.target.result);
            reader.readAsText(file);
        } else if (!file.type.startsWith('image/')) {
             setError('Unsupported file type. Please use .txt, .pdf, or an image file.');
        }
    };

    const DropZone = ({ onFileChange, accept, inputRef, label, fileName }) => {
        const [isHighlighted, setIsHighlighted] = useState(false);
        const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
        const highlight = (e) => { preventDefaults(e); setIsHighlighted(true); };
        const unhighlight = (e) => { preventDefaults(e); setIsHighlighted(false); };
        const handleDrop = (e) => {
            unhighlight(e);
            const file = e.dataTransfer.files[0];
            if (file) onFileChange({ target: { files: [file] } });
        };
        return (
            <div className="w-full">
                <p className="font-semibold text-xl mb-2 text-gray-800 dark:text-gray-200">{label}</p>
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${isHighlighted ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600'}`}
                    onDrop={handleDrop} onDragOver={highlight} onDragEnter={highlight} onDragLeave={unhighlight} onClick={() => inputRef.current.click()}
                >
                    <UploadIcon />
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{fileName || "Drag & drop, or click to browse"}</p>
                    <input type="file" ref={inputRef} onChange={onFileChange} accept={accept} className="hidden" />
                </div>
            </div>
        );
    };

    return (
     <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
        <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">Provide Your Document</h2>
        <div className="min-h-[250px]">
            <DropZone onFileChange={handleFileChange} accept=".txt,.pdf,image/*" inputRef={analyzeFileInputRef} label="Upload Document or Image" fileName={uploadedImageFile?.name} />
             {uploadedImageSrc && (
                <div className="mt-4"><img src={uploadedImageSrc} alt="Preview" className="max-w-full max-h-48 mx-auto rounded-lg"/></div>
             )}
            <div className="my-4 text-center text-gray-400 dark:text-gray-500 text-lg">OR</div>
            <textarea
                value={documentText}
                onChange={handleTextareaChange}
                placeholder="Paste your legal document text here..."
                className="w-full flex-grow p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors min-h-[150px] text-lg"
            />
        </div>
        <div className="mt-6">
            <label htmlFor="language-select" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Analysis Language</label>
            <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-lg">
                <option>English</option> <option>Hindi</option> <option>Gujarati</option> <option>Kannada</option> <option>Marathi</option> <option>Tamil</option> <option>Telugu</option>
            </select>
        </div>
        <button onClick={handleAnalysis} disabled={isLoading || (!documentText && !uploadedImageFile)} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-all flex items-center justify-center text-xl"> {isLoading ? <><LoadingSpinner/>Analyzing...</> : 'Analyze Document'} </button>
        {error && <p className="text-red-500 text-lg mt-4 text-center">{error}</p>}
    </div>
  );
};

function removeOverlap(prev, chunk) {
  const maxLen = Math.min(prev.length, chunk.length, 1000);
  for (let i = maxLen; i > 0; i--) {
    if (prev.endsWith(chunk.substring(0, i))) {
      return chunk.substring(i);
    }
  }
  return chunk;
}

const AnalysisOutput = ({ analysisText, isLoading }) => {
    const [summary, setSummary] = useState('');
    const [clauses, setClauses] = useState('');
    const [advice, setAdvice] = useState('');

    useEffect(() => {
        if (analysisText) {
            // FIX 1: Update the regex to look for the new "My Advice To You" heading
            const summaryMatch = analysisText.match(/### Summary([\s\S]*?)### Key Clauses Explained/);
            const clausesMatch = analysisText.match(/### Key Clauses Explained([\s\S]*?)### My Advice To You/);
            const adviceMatch = analysisText.match(/### My Advice To You([\s\S]*)/);
            
            if (adviceMatch && clausesMatch && summaryMatch) {
                setSummary(summaryMatch[1].trim());
                setClauses(clausesMatch[1].trim());
                setAdvice(adviceMatch[1].trim());
            } else if (clausesMatch && summaryMatch) {
                setSummary(summaryMatch[1].trim());
                setClauses(clausesMatch[1].trim());
                setAdvice('');
            } else if (summaryMatch) {
                setSummary(summaryMatch[1].trim());
                setClauses('');
                setAdvice('');
            } else {
                // Fallback for incomplete streams
                setSummary(analysisText.replace(/### \w+[\s\S]*/, '').trim());
            }
        } else {
            setSummary('');
            setClauses('');
            setAdvice('');
        }
    }, [analysisText]);
    
    const MarkdownRenderer = ({ title, content, colorClass }) => {
        const [htmlOutput, setHtmlOutput] = useState('');

        useEffect(() => {
            if (content) {
                let processedContent = content;
                if (title === "Key Clauses Explained") {
                    const lines = content.split('\n').filter(line => line.trim().startsWith('*'));
                    const redClauses = lines.filter(line => line.includes('🔴'));
                    const yellowClauses = lines.filter(line => line.includes('🟡'));
                    const greenClauses = lines.filter(line => line.includes('🟢'));
                    processedContent = [...redClauses, ...yellowClauses, ...greenClauses].join('\n');
                }
                const converter = new showdown.Converter();
                converter.setOption('emoji', true);
                let html = converter.makeHtml(processedContent);
                html = html.replace(/🔴/g, '<span class="inline-block w-3 h-3 mr-2 bg-red-500 rounded-full flex-shrink-0"></span>');
                html = html.replace(/🟡/g, '<span class="inline-block w-3 h-3 mr-2 bg-yellow-400 rounded-full flex-shrink-0"></span>');
                html = html.replace(/🟢/g, '<span class="inline-block w-3 h-3 mr-2 bg-green-500 rounded-full flex-shrink-0"></span>');
                setHtmlOutput(html);
            }
        }, [content, title]);

        if (!content && isLoading) return null; // Hide empty boxes while loading
        if (!content) return null;

        return (
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700`}>
                <h3 className={`text-2xl font-semibold mb-4 text-gray-900 dark:text-white border-l-4 ${colorClass} pl-3`}>{title}</h3>
                <div 
                    className="prose prose-lg dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-4 prose-li:leading-relaxed prose-li:flex prose-li:items-start"
                    dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <h2 className="text-3xl font-semibold text-center text-gray-900 dark:text-white">Analysis Results</h2>
            {isLoading && !analysisText && (<div className="text-center p-10"><p className="text-xl text-gray-500 dark:text-gray-400">The AI is analyzing your document...</p></div>)}
            {!isLoading && !analysisText && (<div className="text-center bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 min-h-[200px] flex items-center justify-center"><p className="text-xl text-gray-400 dark:text-gray-500">Your analysis will appear here.</p></div>)}
            <MarkdownRenderer title="Summary" content={summary} colorClass="border-blue-500" />
            <MarkdownRenderer title="Key Clauses Explained" content={clauses} colorClass="border-yellow-500" />
            {/* FIX 1: Update the title prop to match the new heading */}
            <MarkdownRenderer title="My Advice To You" content={advice} colorClass="border-green-500" />
        </div>
    );
};

const ChatWindow = ({ originalDocument, language, analysisText }) => {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (analysisText && history.length === 0) {
      setHistory([{ role: 'model', parts: [{ text: "Your analysis is complete. Feel free to ask any questions about the document." }] }]);
    }
  }, [analysisText, history.length]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, isAiTyping]);

  // Replace the existing handleAskQuestion function in App.jsx with this corrected version

// Replace the existing handleAskQuestion function in App.jsx with this corrected version

// Replace the existing handleAskQuestion function in App.jsx with this corrected version

const handleAskQuestion = async (textFromMic) => {
    const userQuestion = textFromMic || question;
    if (!userQuestion.trim()) return;

    const userMessage = { role: 'user', parts: [{ text: userQuestion }] };
    const historyForAPI = [...history]; // Capture history *before* adding the new user message

    // Update UI immediately with the user's question and prepare for AI response
    setHistory(prev => [...prev, userMessage, { role: 'model', parts: [{ text: '' }] }]);
    setQuestion('');
    setIsAiTyping(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat-with-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: originalDocument,
          history: historyForAPI,
          question: userQuestion,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Chat response from server was not OK.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setHistory(prev => {
          const updatedHistory = [...prev];
          const lastMessage = updatedHistory[updatedHistory.length - 1];

          if (lastMessage && lastMessage.role === 'model') {
            // 1. Get the text we already have for the current AI response
            const prevText = lastMessage.parts[0].text || "";

            // 2. Remove any overlap between the previous text and the new chunk
            const newChunkWithoutOverlap = removeOverlap(prevText, chunk);
            
            // 3. Combine them to get the full potential text
            let combinedText = prevText + newChunkWithoutOverlap;
            
            // 4. **FIX APPLIED HERE**: Use a regular expression to find and remove any fully repeated sentences.
            // This regex looks for a sentence (ending in . or ! or ?) followed by whitespace, and then the exact same sentence, and removes the duplicate.
            combinedText = combinedText.replace(/(\b[A-Z][^.!?]*[.!?])\s*\1+/gi, "$1");

            // 5. Update the message text
            lastMessage.parts[0].text = combinedText;
          }
          
          return updatedHistory;
        });
      }
    } catch (err) {
      // **IMPROVED ERROR HANDLING**: If something goes wrong, update the last message to show an error.
      console.error("An error occurred during chat:", err);
      setHistory(prev => {
        const updatedHistory = [...prev];
        const lastMessage = updatedHistory[updatedHistory.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
            lastMessage.parts[0].text = "Sorry, I encountered an error. Please try again.";
        }
        return updatedHistory;
      });
    } finally {
      setIsAiTyping(false);
    }
};

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support voice recognition.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleAskQuestion(transcript);
    };
    recognitionRef.current.start();
  };

  if (!analysisText) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Ask a Follow-up Question</h3>
      
      <div ref={chatContainerRef} className="h-96 overflow-y-auto space-y-4 pr-4">
        {history.map((msg, index) => (
  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
      // render AI model messages as HTML from Markdown; keep user messages as plain text
      dangerouslySetInnerHTML={
        msg.role === 'model'
          ? { __html: mdConverter.makeHtml(msg.parts.map(part => part.text).join('')) }
          : undefined
      }
    >
      {msg.role === 'user' ? msg.parts.map(part => part.text).join('') : null}
    </div>
  </div>
))}

        {isAiTyping && <div className="text-gray-500 dark:text-gray-400 animate-pulse">LegalEase AI is typing...</div>}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isAiTyping && handleAskQuestion()}
          placeholder="Type or click the mic to ask..."
          className="flex-grow p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-lg"
          disabled={isAiTyping}
        />
        <button
            onClick={handleMicClick}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
            <MicIcon isListening={isListening} />
        </button>
        <button
          onClick={() => handleAskQuestion()}
          disabled={isAiTyping || !question.trim()}
          className="bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 transition-all flex items-center justify-center"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

const AppFooter = () => (
    <footer className="bg-gray-800 dark:bg-black text-white mt-12">
        <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-2xl font-bold">LegalEase AI</h2>
                    <p className="mt-2 text-gray-400">Demystifying legal documents for everyone.</p>
                </div>
                <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold text-gray-200">Your Privacy, Our Priority</h3>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-400">
                        <div className="flex items-start gap-3"><DatabaseZapIcon className="w-7 h-7 flex-shrink-0 text-blue-400"/><div><h4 className="font-semibold text-white">Stateless by Design</h4><p>We do not store your documents. Every analysis is processed in memory and discarded immediately.</p></div></div>
                        <div className="flex items-start gap-3"><LockIcon className="w-7 h-7 flex-shrink-0 text-blue-400"/><div><h4 className="font-semibold text-white">Secure Connection</h4><p>All communication between your browser and our servers is encrypted using industry-standard HTTPS.</p></div></div>
                        <div className="flex items-start gap-3"><ZapIcon className="w-7 h-7 flex-shrink-0 text-blue-400"/><div><h4 className="font-semibold text-white">In-Browser Processing</h4><p>Text from PDFs and images is extracted locally in your browser before analysis, enhancing privacy.</p></div></div>
                         <div className="flex items-start gap-3"><ShieldIcon className="w-7 h-7 flex-shrink-0 text-blue-400"/><div><h4 className="font-semibold text-white">Google Cloud Security</h4><p>We leverage Google's enterprise-grade security for all AI processing, ensuring your data is protected.</p></div></div>
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-500"><p>&copy; {new Date().getFullYear()} LegalEase AI. All rights reserved.</p></div>
        </div>
    </footer>
);


// --- MAIN APP COMPONENT ---
export default function App() {
  const [documentText, setDocumentText] = useState('');
  const [language, setLanguage] = useState('English');
  const [analysisText, setAnalysisText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  
  const toggleTheme = () => {
    setIsDarkMode(prev => {
        const newIsDark = !prev;
        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        return newIsDark;
    });
  };
  
  const resetState = () => {
    setAnalysisText('');
    setError('');
  };

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
    } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
    }
  }, []);

  const handleAnalysis = async () => {
    if (!documentText && !uploadedImageFile) {
        setError('Please upload a file or paste text to analyze.');
        return;
    }
    setIsLoading(true);
    resetState();
    let textToAnalyze = documentText;
    if (uploadedImageFile) {
        try {
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(uploadedImageFile);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
            });
            const ocrResponse = await fetch(`${BACKEND_URL}/extract-text-from-image`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ image_data: base64Data }),
            });
            if (!ocrResponse.ok) {
                 const err = await ocrResponse.json();
                 throw new Error(err.detail || 'Image processing failed');
            }
            const ocrData = await ocrResponse.json();
            textToAnalyze = ocrData.text;
            setDocumentText(textToAnalyze);
        } catch (err) {
            setError(`Image processing failed: ${err.message}`);
            setIsLoading(false);
            return;
        }
    }
    if (!textToAnalyze) {
        setError('Could not extract text to analyze.');
        setIsLoading(false);
        return;
    }
    try {
      setAnalysisText(""); // Clear previous analysis before streaming new one
      const response = await fetch(`${BACKEND_URL}/analyze-text-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: textToAnalyze, language }),
      });
      if (!response.ok) {
        const errData = await response.text();
        throw new Error(errData || `HTTP error! status: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setAnalysisText(prev => prev + chunk);
      }
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col">
       <header className="bg-gray-800 dark:bg-black text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto p-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-4xl font-bold">LegalEase AI</h1>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-yellow-300">
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
        </div>
      </header>
      <main className="p-4 sm:p-6 md:p-8 flex-grow">
        <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-5xl">
                <InputSection
                    documentText={documentText} setDocumentText={setDocumentText}
                    language={language} setLanguage={setLanguage}
                    isLoading={isLoading} error={error} setError={setError}
                    uploadedImageFile={uploadedImageFile} setUploadedImageFile={setUploadedImageFile}
                    uploadedImageSrc={uploadedImageSrc} setUploadedImageSrc={setUploadedImageSrc}
                    handleAnalysis={handleAnalysis}
                    setAnalysisText={setAnalysisText}
                />
            </div>
            <div className="w-full">
                <AnalysisOutput analysisText={analysisText} isLoading={isLoading} />
                <ChatWindow 
                    originalDocument={documentText} 
                    language={language}
                    analysisText={analysisText} 
                />
            </div>
        </div>
      </main>
      <AppFooter/>
    </div>
  );
}