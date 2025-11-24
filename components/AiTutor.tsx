import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { askGeminiTutor } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AiTutor: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour ! Je suis ton tuteur Linux pour le module R1.04. Pose-moi des questions sur les commandes, le système de fichiers ou les scripts bash !" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Modified prompt for French context
    const prompt = `Tu es un expert en Système d'Exploitation Linux et tuteur pour le cours universitaire R1.04.
    Réponds en français. Sois concis, pédagogique et donne des exemples de code bash clairs.
    La question de l'étudiant est : ${userMessage}`;

    const response = await askGeminiTutor(prompt);

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  const hasApiKey = !!process.env.API_KEY;

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-8">
        <div className="bg-red-900/20 p-6 rounded-full mb-6 border border-red-500/30">
            <AlertCircle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Clé API Manquante</h2>
        <p className="text-slate-400 max-w-md">
            Pour utiliser le Tuteur IA, vous devez configurer une clé API Google Gemini dans les variables d'environnement.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-400" size={20} />
                <h3 className="font-bold text-slate-200">Tuteur Linux Gemini</h3>
            </div>
            <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded-full font-medium border border-indigo-500/30">Gemini 2.5 Flash</span>
        </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                msg.role === 'user' 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : 'bg-indigo-900/50 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
              }`}
            >
              {msg.role === 'assistant' ? (
                  <ReactMarkdown 
                    components={{
                        code: ({node, inline, className, children, ...props}: any) => {
                            if (inline) return <code className="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-700" {...props}>{children}</code>;
                            return (
                                <div className="my-3 bg-slate-950 p-3 rounded-lg overflow-x-auto text-slate-300 font-mono text-xs border border-slate-700 shadow-inner">
                                    <code {...props}>{children}</code>
                                </div>
                            )
                        },
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    }}
                  >
                      {msg.content}
                  </ReactMarkdown>
              ) : (
                  msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-900/50 text-indigo-300 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
              <Bot size={16} />
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-5 py-4 border border-slate-700">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Demandez comment utiliser 'chmod', écrire une boucle..."
            className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-200 placeholder-slate-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiTutor;