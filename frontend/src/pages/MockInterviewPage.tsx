import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { LogOut, UploadCloud, Send, Bot, User, Loader2, Mic, Sparkles, Briefcase, FileCode, AlertCircle, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MockInterviewPage = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        useAuthStore.getState().login(res.data, token!);
      } catch (err) {
        console.error('Failed to sync user data', err);
      }
    };
    if (token) fetchUser();
  }, [token]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError('');
      
      const formData = new FormData();
      formData.append('resume', selectedFile);
      try {
        await axios.post(`${API_URL}/api/profile/resume`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to update profile resume', err);
      }
    }
  };

  const handleStartInterview = async () => {
    if ((!file && !user?.resumeFileName) || !jdText.trim()) {
      setError('Please upload your resume or use your stored resume, and paste the Job Description.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    if (file) formData.append('resume', file);
    formData.append('jdText', jdText);
    formData.append('history', JSON.stringify([]));

    try {
      const res = await axios.post(`${API_URL}/api/resume/mock-interview`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });

      setMessages([{ role: 'assistant', content: res.data.reply }]);
      setStarted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const formData = new FormData();
      if (file) formData.append('resume', file);
      formData.append('jdText', jdText);
      formData.append('history', JSON.stringify(newMessages));

      const res = await axios.post(`${API_URL}/api/resume/mock-interview`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });

      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err: any) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndInterview = async () => {
    if (messages.length === 0) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/history`, {
        type: 'MOCK_INTERVIEW',
        title: `Mock Interview: ${file?.name || 'Session'}`,
        data: { messages, jdText }
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      navigate('/dashboard');
    } catch (e) {
      console.error('Failed to save interview history');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-10 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="text-2xl font-black text-sky-600 tracking-tight cursor-pointer" onClick={() => navigate('/')}>CareerSync AI</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Welcome, {user?.name}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Tools</p>
            <nav className="space-y-1">
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"><Briefcase size={18} /> Career Sync</button>
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"><FileCode size={18} /> JD Matcher</button>
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"><AlertCircle size={18} /> Authenticity Check</button>
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Practice & Hire</p>
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition bg-sky-50 text-sky-600"><Mic size={18} /> Mock Interview</button>
              <button onClick={() => navigate('/recruiter')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"><Users size={18} /> Recruiter Mode</button>
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Account</p>
            <nav className="space-y-1">
              <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"><User size={18} /> My Profile</button>
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"><Calendar size={18} /> History</button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 flex flex-col h-screen">
        {!started ? (
          /* Setup Screen */
          <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center">
            <div className="max-w-xl w-full">
              <div className="text-center mb-10">
                <div className="w-24 h-24 mx-auto bg-sky-50 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                  <Mic className="text-sky-500" size={40} />
                </div>
                <h1 className="text-4xl font-black mb-3 text-slate-900">AI Mock Interview</h1>
                <p className="text-slate-500 text-lg">Practice for your dream job with an AI interviewer that gives real-time feedback.</p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-3 block flex justify-between">
                    <span>Upload Resume (PDF)</span>
                    {user?.resumeFileName && !file && <span className="text-indigo-600 font-medium">Using: {user.resumeFileName}</span>}
                  </label>
                  <label className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-sky-400 hover:bg-sky-50 transition cursor-pointer group block">
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                    <UploadCloud className={`mx-auto mb-3 ${(file || user?.resumeFileName) ? 'text-sky-500' : 'text-slate-400'} group-hover:text-sky-500 transition`} size={32} />
                    <p className="text-slate-600 font-bold text-sm">{file ? file.name : (user?.resumeFileName ? 'Upload different resume' : 'Click to select PDF Resume')}</p>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-3 block">Paste Job Description</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 h-32 resize-none transition"
                    placeholder="Paste the full job description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <button
                  onClick={handleStartInterview}
                  disabled={loading || (!file && !user?.resumeFileName) || !jdText.trim()}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                  {loading ? 'Starting Interview...' : 'Start Mock Interview'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Mic className="text-sky-500" size={20} /> Live Interview</h2>
              <button 
                onClick={handleEndInterview}
                disabled={loading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg border border-slate-200 transition text-sm"
              >
                Save & End Interview
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm border border-sky-200">
                      <Bot size={20} className="text-sky-600" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-sm' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.content.split('\n').map((line, j) => (
                      <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center shrink-0 mt-1 border border-slate-300">
                      <User size={20} className="text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-sky-200">
                    <Bot size={20} className="text-sky-600" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-200 p-6 bg-white shrink-0">
              <div className="flex gap-3 max-w-4xl mx-auto items-end">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response..."
                  rows={1}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 resize-none max-h-32 overflow-y-auto transition"
                  style={{ minHeight: '56px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !userInput.trim()}
                  className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white p-4 rounded-2xl transition shadow-md shadow-sky-500/20"
                >
                  <Send size={24} />
                </button>
              </div>
              <p className="text-slate-400 text-xs text-center mt-3 font-medium">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MockInterviewPage;
