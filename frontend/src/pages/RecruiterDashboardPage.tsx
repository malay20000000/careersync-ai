import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { LogOut, UploadCloud, Loader2, Users, AlertCircle, BarChart3, FileText, Briefcase, FileCode, Mic, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RecruiterDashboardPage = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => {
        const existingNames = new Set(prev.map(f => f.name));
        const filteredNewFiles = newFiles.filter(f => !existingNames.has(f.name));
        return [...prev, ...filteredNewFiles];
      });
      setError('');
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleBatchAnalyze = async () => {
    if (!files || files.length === 0 || !jdText.trim()) {
      setError('Please upload at least one resume and paste the Job Description.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('jdText', jdText);
    for (let i = 0; i < files.length; i++) {
      formData.append('resumes', files[i]);
    }

    try {
      const res = await axios.post(`${API_URL}/api/resume/batch-analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
        timeout: 120000
      });
      const sortedResults = res.data.candidates.sort((a: any, b: any) => b.match_percentage - a.match_percentage);
      
      try {
        await axios.post(`${API_URL}/api/history`, {
          type: 'RECRUITER_MODE',
          title: `Recruiter Batch (${files.length} Candidates) - ${new Date().toLocaleDateString()}`,
          data: { jdText, candidates: sortedResults }
        }, { headers: { 'Authorization': `Bearer ${token}` } });
      } catch (e) {
        console.error('Failed to save recruiter history');
      }

      // Navigate to the results page instead of showing it here
      navigate('/recruiter-results', { state: { candidates: sortedResults, jdText, filesCount: files.length } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Batch analysis failed.');
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
              <button onClick={() => navigate('/mock-interview')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"><Mic size={18} /> Mock Interview</button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition bg-emerald-50 text-emerald-600"><Users size={18} /> Recruiter Mode</button>
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Account</p>
            <nav className="space-y-1">
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

      {/* Main Content Area */}
      <main className="flex-1 ml-72 p-10 flex flex-col items-center">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-slate-900 flex items-center justify-center gap-3">
            <Users className="text-emerald-500" size={40} /> Recruiter Mode
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium max-w-2xl">
            Upload multiple resumes and a Job Description to batch rank candidates by compatibility.
          </p>
        </header>

        <div className="w-full max-w-3xl">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-12 w-full">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                  <Users size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Analyzing {files.length} Resumes</h3>
              <p className="text-slate-500 italic animate-pulse">Scoring each candidate against the job description...</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm space-y-8 w-full">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">Upload Resumes (PDFs)</label>
                <label className="border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer group block">
                  <input type="file" className="hidden" onChange={handleFilesChange} accept=".pdf" multiple />
                  <UploadCloud className={`mx-auto mb-4 ${files.length > 0 ? 'text-emerald-500' : 'text-slate-400'} group-hover:text-emerald-500 transition`} size={40} />
                  <p className="text-slate-600 font-bold">
                    {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Select multiple PDFs'}
                  </p>
                  <p className="text-slate-400 text-sm mt-2 font-medium">Click to browse or drag and drop</p>
                </label>
                {files.length > 0 && (
                  <div className="mt-4 space-y-1.5 max-h-48 overflow-y-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {files.map((f, i) => (
                      <div key={i} className="text-sm font-medium text-slate-600 flex items-center justify-between group/item p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText size={16} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.preventDefault(); removeFile(i); }} 
                          className="text-slate-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition shrink-0 ml-3"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">Paste Job Description</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 h-40 resize-none transition"
                  placeholder="Paste the job requirements here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-5 bg-red-50 border border-red-200 text-red-600 font-bold rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0" /> {error}
                </div>
              )}

              <button
                onClick={handleBatchAnalyze}
                disabled={loading || !files || files.length === 0 || !jdText.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-5 rounded-2xl transition shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <BarChart3 size={24} />}
                {loading ? `Analyzing ${files.length} resumes...` : 'Rank Candidates'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboardPage;
