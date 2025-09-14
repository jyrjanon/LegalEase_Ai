import { useState, useEffect, useRef } from 'react';

// --- ICONS (as SVG components) ---
const SunIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /><circle cx="12" cy="12" r="5" /></svg>);
const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-gray-400 dark:text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
const LinkIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>);
const ShieldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const HandshakeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m5 15 2 2a1 1 0 0 0 3-3l-6-6a1 1 0 0 0-3 3Z"/><path d="M9 12a1 1 0 0 0-3 3l-2-2"/><path d="m14 7 3-3a1 1 0 0 1 3 3l-2 2"/><path d="M19 11a1 1 0 0 1-3-3l-2 2"/></svg>);
const ThumbsUpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a2 2 0 0 1 3 1.88Z"/></svg>);
const LoadingSpinner = () => (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>);
const ChatIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"/></svg>);
const CompareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22a10 10 0 0 0 10-10V3"/><path d="M12 2a10 10 0 0 0-10 10v9"/></svg>);
const PlusCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>);
const MinusCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>);
const RefreshCwIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>);
const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>);
const PauseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const ZapIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>);
const DatabaseZapIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6c0-1.66 4-3 8-3s8 1.34 8 3"/><path d="M4 6v6c0 1.66 4 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 4 3 8 3s8-1.34 8-3v-6"/><path d="m18 14-4 4h6l-4 4"/></svg>);
const MicIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>);

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://legalease-ai-backend.onrender.com';

// --- DASHBOARD COMPONENTS ---
const RiskGauge = ({ score = 0 }) => {
    const getScoreColor = (s) => {
        if (s < 30) return '#34d399'; if (s < 70) return '#fbbf24'; return '#f87171';
    };
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    return (
        <div className="relative flex items-center justify-center h-48 w-48">
            <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" strokeWidth="10" stroke="#e5e7eb" className="dark:stroke-gray-700" fill="transparent"/>
                <circle cx="50" cy="50" r="45" strokeWidth="10" stroke={getScoreColor(score)} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.8s ease-out' }}/>
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-6xl font-bold text-gray-800 dark:text-white">{score}</span>
                <span className="text-xl text-gray-500 dark:text-gray-400">Risk Score</span>
            </div>
        </div>
    );
};

const InfoCard = ({ title, icon, items = [], type }) => {
    const tagMap = {
        obligations: { icon: '🟡', color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' },
        risks: { icon: '🔴', color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' },
        benefits: { icon: '🟢', color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' },
    };
    const currentTag = tagMap[type] || { icon: '⚪️', color: 'bg-gray-100 dark:bg-gray-700' };
    return (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="text-blue-500 dark:text-blue-400">{icon}</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <ul className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
                {items && items.length > 0 ? (
                    items.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className={`flex-shrink-0 mt-1.5 w-6 h-6 text-sm flex items-center justify-center rounded-full ${currentTag.color}`}>{currentTag.icon}</span>
                            <span>{item}</span>
                        </li>
                    ))
                ) : ( <li className="text-gray-400 dark:text-gray-500">No items found.</li> )}
            </ul>
        </div>
    );
};

// --- AUDIO PLAYER COMPONENT ---
const AudioPlayer = ({ src, isLoading }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlayPause = async () => {
        if (!audioRef.current) return;
        try {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                await audioRef.current.play();
            }
        } catch (error) {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
        }
    };
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handlePause);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handlePause);
        };
    }, []);

    return (
        <div className="w-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-md p-4 rounded-xl shadow-md flex items-center gap-4 border border-gray-200 dark:border-gray-700">
            <audio ref={audioRef} src={src} className="hidden" />
            <button 
                onClick={togglePlayPause} 
                disabled={isLoading || !src}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white disabled:bg-gray-400 transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    isPlaying ? <PauseIcon /> : <PlayIcon />
                )}
            </button>
            <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800 dark:text-white">Audio Summary</p>
                <div className="h-8 flex items-center gap-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <span 
                            key={i} 
                            className={`w-1 rounded-full bg-blue-400 transition-all duration-300 ${isPlaying ? 'h-full' : 'h-1'}`}
                            style={{ animation: isPlaying ? `wave 1.2s ease-in-out ${i * 0.05}s infinite alternate` : 'none' }}
                        ></span>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- COMPARISON COMPONENTS ---
const ComparisonCard = ({ title, items = [], type }) => {
    const iconMap = {
        added: <PlusCircleIcon className="text-green-500"/>,
        removed: <MinusCircleIcon className="text-red-500"/>,
        modified: <RefreshCwIcon className="text-yellow-500"/>,
    };

    return (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center gap-3 mb-4">
                {iconMap[type]}
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
                {items && items.length > 0 ? (
                    items.map((item, index) => (
                        <div key={index} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50">
                            {type === 'modified' && (
                                <>
                                    <p className="font-semibold text-red-600 dark:text-red-400">Original:</p>
                                    <p className="mb-2 italic">"{item.original_clause}"</p>
                                    <p className="font-semibold text-green-600 dark:text-green-400">Revised:</p>
                                    <p className="mb-2 italic">"{item.revised_clause}"</p>
                                </>
                            )}
                            {type !== 'modified' && (
                                 <p className="mb-2 italic">"{item.clause}"</p>
                            )}
                            <p className="font-semibold text-blue-600 dark:text-blue-400">Implication:</p>
                            <p>{item.implication}</p>
                        </div>
                    ))
                ) : ( <p className="text-gray-400 dark:text-gray-500">No items found.</p> )}
            </div>
        </div>
    );
};

// --- SUGGESTIONS COMPONENT ---
const Suggestions = ({ documentText, onSuggestionClick, language }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (documentText) {
            const fetchSuggestions = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(`${BACKEND_URL}/generate-suggestions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ document: documentText, language }),
                    });
                    if (!response.ok) throw new Error("Failed to fetch suggestions.");
                    const data = await response.json();
                    setSuggestions(data.suggestions || []);
                } catch (error) {
                    console.error("Suggestion fetch error:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSuggestions();
        }
    }, [documentText, language]);

    if (!documentText || isLoading || suggestions.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-8 animate-fade-in">
             <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <SparklesIcon /> AI Suggestions
            </h3>
            <div className="flex flex-wrap gap-3">
                {suggestions.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => onSuggestionClick(q)}
                        className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 font-medium py-2 px-4 rounded-full transition-colors text-lg"
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- CHATBOT COMPONENT ---
const Chatbot = ({ documentText, language, initialMessage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatBodyRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);
    
    const languageCodeMap = {
        "English": "en-US", "Hindi": "hi-IN", "Gujarati": "gu-IN",
        "Kannada": "kn-IN", "Marathi": "mr-IN", "Tamil": "ta-IN", "Telugu": "te-IN",
    };

    useEffect(() => {
        if (initialMessage && !isOpen) {
            setIsOpen(true);
            setMessages([{ role: 'user', content: initialMessage }]);
            handleSendMessage(initialMessage);
        }
    }, [initialMessage]);

    useEffect(() => {
        if(chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isChatLoading]);

    const handleMicClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser does not support speech recognition.");
            return;
        }

        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.lang = languageCodeMap[language] || 'en-US';
        recognition.continuous = true; // Keep listening
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setUserInput(transcript);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
            recognitionRef.current = null;
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed') {
                alert("Microphone access was denied. Please allow microphone access in your browser settings.");
            }
            setIsRecording(false);
            recognitionRef.current = null;
        };
        
        recognition.start();
    };

    const handleSendMessage = async (messageToSend) => {
        if (!messageToSend.trim()) return;

        const newUserMessage = { role: 'user', content: messageToSend };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsChatLoading(true);

        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const response = await fetch(`${BACKEND_URL}/chat-stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    document: documentText,
                    messages: [...messages, newUserMessage],
                    language,
                }),
            });

            if (!response.ok) throw new Error("Failed to get response from chat.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                setMessages(prev => {
                    const lastMessage = { ...prev[prev.length - 1] };
                    lastMessage.content += chunk;
                    return [...prev.slice(0, -1), lastMessage];
                });
            }

        } catch (error) {
            setMessages(prev => {
                const lastMessage = { ...prev[prev.length - 1] };
                lastMessage.content = "Sorry, I encountered an error. Please try again.";
                return [...prev.slice(0, -1), lastMessage];
            });
            console.error("Chat error:", error);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSendMessage(userInput);
    }

    return (
        <>
            <div className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg">
                    <ChatIcon />
                </button>
            </div>

            <div className={`fixed bottom-0 right-0 md:bottom-5 md:right-5 z-50 w-full max-w-full md:max-w-md h-[80vh] md:h-[70vh] bg-white dark:bg-gray-800 rounded-none md:rounded-2xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-[105%]'}`}>
                <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-bold">AI Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon />
                    </button>
                </header>
                <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.length === 0 && !isChatLoading && (
                        <div className="text-center text-gray-400 text-lg py-10">Ask me anything about your document!</div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                <p className="text-lg">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                     {isChatLoading && (
                         <div className="flex justify-start">
                           <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                <div className="flex items-center justify-center h-6">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700 flex items-center gap-2">
                    <button type="button" onClick={handleMicClick} className={`p-3 rounded-lg transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>
                        <MicIcon />
                    </button>
                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask a question..." className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg" />
                    <button type="submit" className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400" disabled={isChatLoading}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </>
    );
};

// --- LOADING OVERLAY COMPONENT ---
const LoadingOverlay = () => {
    const [loadingText, setLoadingText] = useState("Analyzing your document...");

    useEffect(() => {
        const messages = [
            "Demystifying complex clauses...",
            "Checking for risks and obligations...",
            "Getting things ready...",
            "Finalizing your summary..."
        ];
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % messages.length;
            setLoadingText(messages[currentIndex]);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="absolute inset-0 bg-gray-500/30 dark:bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-[spin-slow_2s_linear_infinite] border-blue-400"></div>
            <p className="mt-4 text-xl font-semibold text-white">{loadingText}</p>
        </div>
    );
};


// --- Refactored Components (moved outside App) ---
const InputSection = ({ 
    activeTab, setActiveTab, documentText, setDocumentText, language, setLanguage, 
    isLoading, error, setError, uploadedImageFile, setUploadedImageFile, uploadedImageSrc, 
    setUploadedImageSrc, handleAnalysis, resetState
}) => {
    const [url, setUrl] = useState('');
    const [isFetchingUrl, setIsFetchingUrl] = useState(false);
    const [doc1, setDoc1] = useState({ name: '', text: '' });
    const [doc2, setDoc2] = useState({ name: '', text: '' });
    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);
    const analyzeFileInputRef = useRef(null);

    const handleTextareaFocus = () => {
        if (uploadedImageFile || uploadedImageSrc) {
            setUploadedImageFile(null);
            setUploadedImageSrc(null);
            setDocumentText('');
            resetState();
        }
    };
    
    const handleTextareaChange = (e) => {
      setDocumentText(e.target.value);
    }

    const handleFileChange = (e, docSetter) => {
        const file = e.target.files[0];
        if (!file) return;
        
        resetState();
        
        if (activeTab === 'analyze' && file.type.startsWith('image/')) {
            setUploadedImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => setUploadedImageSrc(event.target.result);
            reader.readAsDataURL(file);
            setDocumentText('');
        } else {
            setUploadedImageFile(null);
            setUploadedImageSrc(null);
            readFile(file, (text) => {
                if(docSetter) {
                    docSetter({ name: file.name, text });
                } else {
                    setDocumentText(text);
                }
            });
        }
    };

    const handleCompare = async () => {
        // This function would be passed in as a prop if needed
    };
    
    const readFile = (file, callback) => {
        const reader = new FileReader();
        if (file.type === 'application/pdf') {
            reader.onload = (e) => {
                const typedarray = new Uint8Array(e.target.result);
                window.pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                    const pagePromises = Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then(page => page.getTextContent().then(content => content.items.map(item => item.str).join(' '))));
                    Promise.all(pagePromises).then(pagesText => { callback(pagesText.join('\n\n')); });
                });
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
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button onClick={() => setActiveTab('analyze')} className={`px-4 py-2 text-lg font-medium transition-colors ${activeTab === 'analyze' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Analyze</button>
            <button onClick={() => setActiveTab('compare')} className={`px-4 py-2 text-lg font-medium transition-colors ${activeTab === 'compare' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Compare</button>
            <button onClick={() => setActiveTab('url')} className={`px-4 py-2 text-lg font-medium transition-colors ${activeTab === 'url' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>URL</button>
        </div>
        <div className="min-h-[250px]">
            {activeTab === 'analyze' && (
                 <>
                    <DropZone onFileChange={(e) => handleFileChange(e)} accept=".txt,.pdf,image/*" inputRef={analyzeFileInputRef} label="Upload Document or Image" fileName={uploadedImageFile?.name || (documentText ? 'Text ready' : null)} />
                     {uploadedImageSrc && (
                        <div className="mt-4"><img src={uploadedImageSrc} alt="Preview" className="max-w-full max-h-48 mx-auto rounded-lg"/></div>
                     )}
                    <div className="my-4 text-center text-gray-400 dark:text-gray-500 text-lg">OR</div>
                    <textarea 
                        value={documentText} 
                        onFocus={handleTextareaFocus}
                        onChange={handleTextareaChange} 
                        placeholder="Paste your legal document text here..." 
                        className="w-full flex-grow p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors min-h-[150px] text-lg"
                    />
                </>
            )}
            {activeTab === 'compare' && (
                <div className="flex flex-col md:flex-row gap-4">
                    <DropZone onFileChange={(e) => handleFileChange(e, setDoc1)} accept=".txt,.pdf" inputRef={fileInputRef1} label="Original Document" fileName={doc1.name}/>
                    <DropZone onFileChange={(e) => handleFileChange(e, setDoc2)} accept=".txt,.pdf" inputRef={fileInputRef2} label="Revised Document" fileName={doc2.name}/>
                </div>
            )}
            {activeTab === 'url' && (
                <div className="flex flex-col h-full justify-center">
                    <label htmlFor="url-input" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Website URL</label>
                    <div className="flex gap-2">
                        <input id="url-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/terms" className="flex-grow p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-lg" />
                        <button onClick={() => {}} disabled={isFetchingUrl} className="bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 flex items-center justify-center">
                            {isFetchingUrl ? <LoadingSpinner/> : <LinkIcon/>} Fetch & Analyze
                        </button>
                    </div>
                </div>
            )}
        </div>
        <div className="mt-6">
            <label htmlFor="language-select" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Analysis Language</label>
            <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-lg">
                <option>English</option> <option>Hindi</option> <option>Gujarati</option> <option>Kannada</option> <option>Marathi</option> <option>Tamil</option> <option>Telugu</option>
            </select>
        </div>
        {activeTab === 'analyze' && <button onClick={() => handleAnalysis(!!uploadedImageFile)} disabled={isLoading || (!documentText && !uploadedImageFile)} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-all flex items-center justify-center text-xl"> {isLoading ? <><LoadingSpinner/>Analyzing...</> : 'Analyze Document'} </button>}
        {activeTab === 'compare' && <button onClick={handleCompare} disabled={isLoading || !doc1.text || !doc2.text} className="w-full mt-6 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 dark:disabled:bg-purple-800 disabled:cursor-not-allowed transition-all flex items-center justify-center text-xl"> {isLoading ? <><LoadingSpinner/>Comparing...</> : 'Compare Documents'} </button>}
        {error && <p className="text-red-500 text-lg mt-4 text-center">{error}</p>}
    </div>
  );
};

const AnalysisDashboard = ({ dashboardData, audioUrl, isAudioLoading }) => (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col items-center mb-4"> <RiskGauge score={dashboardData?.riskScore} /> </div>
        <div className="mb-4"> <AudioPlayer src={audioUrl} isLoading={isAudioLoading} /> </div>
        <div className="flex flex-col gap-8">
            <InfoCard title="Your Obligations" icon={<HandshakeIcon />} items={dashboardData?.obligations} type="obligations" />
            <InfoCard title="Potential Risks" icon={<ShieldIcon />} items={dashboardData?.risks} type="risks" />
            <InfoCard title="Key Benefits" icon={<ThumbsUpIcon />} items={dashboardData?.benefits} type="benefits" />
        </div>
    </div>
);
  
const ComparisonDashboard = ({ comparisonData }) => (
     <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-8 animate-fade-in">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white">Comparison Analysis</h2>
        <ComparisonCard title="Added Clauses" items={comparisonData?.added} type="added" />
        <ComparisonCard title="Removed Clauses" items={comparisonData?.removed} type="removed" />
        <ComparisonCard title="Modified Clauses" items={comparisonData?.modified} type="modified" />
     </div>
);

const AppFooter = () => (
    <footer className="bg-gray-800 dark:bg-black text-white mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
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
  const [dashboardData, setDashboardData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');
  const [chatInitialMessage, setChatInitialMessage] = useState('');
  
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);


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
    setDashboardData(null);
    setComparisonData(null);
    setChatInitialMessage('');
    setAudioUrl(null);
    setError('');
  };

  const handleAnalysis = async (isImageAnalysis) => {
    setIsLoading(true);
    setDashboardData(null);
    setComparisonData(null);
    setAudioUrl(null);
    setError('');

    let textToAnalyze = documentText;
    let isOcrSuccess = true;

    if (isImageAnalysis) {
        if (!uploadedImageFile) {
            setError('Please upload an image first.');
            setIsLoading(false);
            return;
        }
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
            if (!ocrResponse.ok) throw new Error('Image processing not working');
            const ocrData = await ocrResponse.json();
            textToAnalyze = ocrData.text;
            setDocumentText(textToAnalyze);
        } catch (err) {
            setError(`Image processing failed: ${err.message}`);
            setIsLoading(false);
            isOcrSuccess = false;
        }
    }

    if (!textToAnalyze || !isOcrSuccess) {
        if (isOcrSuccess) setError('No text to analyze. Please provide a document.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/analyze-structured-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: textToAnalyze, question: 'Summarize the key risks, obligations, and benefits, and provide a risk score.', language }),
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(errData || `HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedJson = '';

      setDashboardData({ riskScore: 0, obligations: [], risks: [], benefits: [] });

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulatedJson += decoder.decode(value, { stream: true });
        
        try {
            const parsedData = JSON.parse(accumulatedJson);
            setDashboardData(parsedData);
        } catch (e) {
            // Incomplete JSON, continue accumulating
        }
      }

    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dashboardData && dashboardData.riskScore > 0) {
        const fetchAudio = async () => {
            setIsAudioLoading(true);
            try {
                const summaryText = `
                    Here is a summary of your document.
                    Overall Risk Score: ${dashboardData.riskScore}.
                    Your Obligations include: ${dashboardData.obligations.join('; ')}.
                    Potential Risks are: ${dashboardData.risks.join('; ')}.
                    Key Benefits are: ${dashboardData.benefits.join('; ')}.
                `;

                const response = await fetch(`${BACKEND_URL}/generate-audio-summary`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: summaryText, language: language }),
                });

                if (!response.ok) throw new Error('Failed to generate audio from the server.');
                
                const data = await response.json();
                const audioBlob = new Blob([Uint8Array.from(atob(data.audio_content), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
            } catch (err) {
                console.error("Audio generation failed:", err);
                setError("Could not generate audio summary.");
            } finally {
                setIsAudioLoading(false);
            }
        };
        fetchAudio();
    }
  }, [dashboardData, language]);
  
  const handleSuggestionClick = (suggestion) => {
    setChatInitialMessage(suggestion);
    setTimeout(() => setChatInitialMessage(''), 100);
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col">
       <header className="bg-gray-800 dark:bg-black text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-4xl font-bold">LegalEase Ai</h1>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-yellow-300">
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
        </div>
      </header>
      <main className="p-4 sm:p-6 md:p-8 flex-grow">
        <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-4xl"> 
                <InputSection 
                    activeTab={activeTab} setActiveTab={setActiveTab}
                    documentText={documentText} setDocumentText={setDocumentText}
                    language={language} setLanguage={setLanguage}
                    isLoading={isLoading} error={error} setError={setError}
                    uploadedImageFile={uploadedImageFile} setUploadedImageFile={setUploadedImageFile}
                    uploadedImageSrc={uploadedImageSrc} setUploadedImageSrc={setUploadedImageSrc}
                    handleAnalysis={handleAnalysis}
                    resetState={resetState}
                />
            </div>
            <div className="w-full">
                {isLoading && (
                    <div className="w-full max-w-4xl mx-auto relative">
                       <LoadingOverlay />
                       <div className="flex items-center justify-center text-center min-h-[500px] bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-50">
                           <p className="text-xl text-gray-400 dark:text-gray-500">Your analysis dashboard will appear here.</p>
                       </div>
                    </div>
                )}

                {!isLoading && dashboardData && <AnalysisDashboard dashboardData={dashboardData} audioUrl={audioUrl} isAudioLoading={isAudioLoading} />}
                {!isLoading && comparisonData && <ComparisonDashboard comparisonData={comparisonData} />}

                {!isLoading && !dashboardData && !comparisonData && (
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="flex items-center justify-center text-center min-h-[500px] bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xl text-gray-400 dark:text-gray-500">Your analysis dashboard will appear here.</p>
                        </div>
                    </div>
                )}

                {dashboardData && <Suggestions documentText={documentText} onSuggestionClick={handleSuggestionClick} language={language} />}
            </div>
        </div>
      </main>
      <Chatbot documentText={documentText || (uploadedImageFile ? "The user has uploaded an image for context." : "") || (comparisonData ? `${doc1.text}\n\n${doc2.text}`: '')} language={language} initialMessage={chatInitialMessage} />
      <AppFooter/>
    </div>
  );
}

// Add this keyframes rule to your main CSS file or a style tag in your HTML head
const style = document.createElement('style');
style.innerHTML = `
@keyframes wave {
  0% { height: 0.25rem; }
  100% { height: 100%; }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

