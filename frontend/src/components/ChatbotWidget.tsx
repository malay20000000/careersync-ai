import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { MessageSquare, X, Send, Bot, User, Loader2, MinusCircle } from 'lucide-react';
import { marked } from 'marked';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ChatbotWidget = () => {
  const { token, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`mentorChat_${user.id}`);
      if (saved) return JSON.parse(saved);
    }
    return [{ role: 'assistant', content: `Hi ${user?.name || 'there'}! I am your AI Career Mentor. Ask me about learning roadmaps, resume building, or interview tips!` }];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && messages.length > 0) {
      localStorage.setItem(`mentorChat_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user?.id]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!input.trim() || !token) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/chat/mentor`, {
        history: newHistory
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages([...newHistory, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages([...newHistory, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Only render for authenticated users on app pages
  const location = useLocation();
  const hiddenRoutes = ['/', '/features', '/login', '/register'];
  if (!token || hiddenRoutes.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-inter">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] max-h-[80vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-black">AI Career Mentor</h3>
                <p className="text-xs text-blue-100 font-medium">Online</p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-white/70 hover:text-white transition bg-white/10 p-2 rounded-lg">
              <MinusCircle size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-sky-600' : 'bg-sky-100 border border-sky-200'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-sky-600" />}
                </div>
                <div 
                  className={`px-5 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed overflow-x-auto shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-sky-600 text-white rounded-tr-sm' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm prose prose-sm max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:mb-2 [&>table]:w-full [&>table]:border-collapse [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2 [&_td]:border [&_td]:border-slate-200 [&_td]:p-2'
                  }`}
                  dangerouslySetInnerHTML={{ 
                    __html: msg.role === 'user' 
                      ? msg.content 
                      : marked.parse(msg.content, { async: false }) as string 
                  }}
                />
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-sky-600" />
                </div>
                <div className="px-5 py-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for career advice..."
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white p-3 rounded-xl transition flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={toggleChat}
          className="bg-sky-600 hover:bg-sky-500 text-white p-4 rounded-full shadow-xl shadow-sky-500/30 transition-all hover:scale-105 flex items-center gap-2 group border border-sky-400"
        >
          <MessageSquare size={24} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-bold text-sm pr-1">
            Chat with Mentor
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
