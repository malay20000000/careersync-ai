import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { LogOut, UploadCloud, CheckCircle2, AlertCircle, Calendar, Target, Loader2, Briefcase, ChevronRight, Wand2, Download, Copy, Check, FileCode, Mic, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AnalysisResult {
  score: number;
  ats_compatibility: number;
  strengths: string[];
  weaknesses: string[];
  skill_gaps: string[];
  suggestions: string[];
  roadmap: {
    '0-3 months': string[];
    '3-6 months': string[];
    '6-12 months': string[];
  };
}

interface JDMatchResult {
  match_percentage: number;
  missing_keywords: string[];
  matching_skills: string[];
  recommendations: string[];
  suitability_summary: string;
}

const DashboardPage = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [jdResult, setJdResult] = useState<JDMatchResult | null>(null);
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [tailoredLatex, setTailoredLatex] = useState<string | null>(null);
  const [jdText, setJdText] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'career' | 'jd' | 'history' | 'authenticity'>('career');
  const [copied, setCopied] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [authenticityResult, setAuthenticityResult] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [mockHistoryView, setMockHistoryView] = useState<any>(null);
  const [recruiterHistoryView, setRecruiterHistoryView] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHistoryList(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleAnalyzeCareer = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setTailoredResume(null);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await axios.post(`${API_URL}/api/resume/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      setResult(res.data);
      setJdResult(null);
      
      try {
        await axios.post(`${API_URL}/api/history`, {
          type: 'CAREER_ANALYSIS',
          title: `Career Sync: ${file.name}`,
          data: res.data
        }, { headers: { 'Authorization': `Bearer ${token}` } });
      } catch (e) {
        console.error('Failed to save history');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeJD = async () => {
    if (!file || !jdText) {
      setError('Please provide both a resume and a Job Description.');
      return;
    }
    setLoading(true);
    setError('');
    setTailoredResume(null);
    const formData = new FormData();
    formData.append('jdText', jdText);
    formData.append('resume', file);
    try {
      const res = await axios.post(`${API_URL}/api/resume/analyze-jd`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      setJdResult(res.data);
      setResult(null);

      try {
        await axios.post(`${API_URL}/api/history`, {
          type: 'JD_MATCH',
          title: `JD Match: ${file.name}`,
          data: res.data
        }, { headers: { 'Authorization': `Bearer ${token}` } });
      } catch (e) {
        console.error('Failed to save history');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'JD Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticityCheck = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const res = await axios.post(`${API_URL}/api/resume/authenticity`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setAuthenticityResult(res.data);
      setActiveTab('authenticity');

      try {
        await axios.post(`${API_URL}/api/history`, {
          type: 'AUTHENTICITY_CHECK',
          title: `Authenticity: ${file.name}`,
          data: res.data
        }, { headers: { 'Authorization': `Bearer ${token}` } });
      } catch (e) {
        console.error('Failed to save history');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check authenticity');
    } finally {
      setLoading(false);
    }
  };

  const handleTailorResume = async () => {
    if (!file || !jdText) return;
    setTailoring(true);
    setError('');
    const formData = new FormData();
    formData.append('jdText', jdText);
    formData.append('resume', file);
    try {
      const res = await axios.post(`${API_URL}/api/resume/tailor`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      setTailoredResume(res.data.tailored_content_markdown);
      setTailoredLatex(res.data.tailored_content_latex);
    } catch (err: any) {
      setError('Tailoring failed.');
    } finally {
      setTailoring(false);
    }
  };

  const [compilingPdf, setCompilingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (!tailoredLatex) return;
    setCompilingPdf(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/resume/compile-pdf`, 
        { latex: tailoredLatex },
        { 
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          responseType: 'blob',
          timeout: 60000
        }
      );
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resume_${user?.name || 'User'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF download error:', err);
      setError('PDF compilation failed. Download the .TEX file and compile on Overleaf instead.');
    } finally {
      setCompilingPdf(false);
    }
  };

  const handleDownloadLatex = () => {
    if (!tailoredLatex) return;
    const blob = new Blob([tailoredLatex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resume_${user?.name || 'User'}.tex`;
    link.click();
    URL.revokeObjectURL(url);
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
              <button 
                onClick={() => setActiveTab('career')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition ${activeTab === 'career' ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Briefcase size={18} /> Career Sync
              </button>
              <button 
                onClick={() => setActiveTab('jd')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition ${activeTab === 'jd' ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileCode size={18} /> JD Matcher
              </button>
              <button 
                onClick={() => setActiveTab('authenticity')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition ${activeTab === 'authenticity' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <AlertCircle size={18} /> Authenticity Check
              </button>
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Practice & Hire</p>
            <nav className="space-y-1">
              <button 
                onClick={() => navigate('/mock-interview')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                <Mic size={18} /> Mock Interview
              </button>
              <button 
                onClick={() => navigate('/recruiter')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                <Users size={18} /> Recruiter Mode
              </button>
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Account</p>
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition ${activeTab === 'history' ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar size={18} /> History
              </button>
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
      <main className="flex-1 ml-72 p-10">
        <div className="max-w-5xl mx-auto">
          
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                {activeTab === 'career' && 'Career Sync Analysis'}
                {activeTab === 'jd' && 'Job Description Matcher'}
                {activeTab === 'authenticity' && 'Resume Authenticity Check'}
                {activeTab === 'history' && 'Your Activity History'}
              </h1>
              <p className="text-slate-500 mt-2 font-medium">
                {activeTab === 'history' ? 'Review your past AI analyses and interviews.' : 'Upload your resume to get started.'}
              </p>
            </div>
            
            {activeTab !== 'history' && (
              <div className="flex items-center gap-4">
                <label className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex items-center gap-3 hover:border-sky-300 hover:shadow-md transition cursor-pointer group">
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                  <div className={`p-2 rounded-lg ${file ? 'bg-sky-100' : 'bg-slate-100'} group-hover:bg-sky-100 transition`}>
                    <UploadCloud className={`${file ? 'text-sky-600' : 'text-slate-500'} group-hover:text-sky-600 transition`} size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Resume</p>
                    <p className="text-sm font-bold text-slate-800 max-w-[150px] truncate">{file ? file.name : 'Select PDF File'}</p>
                  </div>
                </label>
                
                <button 
                  onClick={activeTab === 'career' ? handleAnalyzeCareer : activeTab === 'authenticity' ? handleAuthenticityCheck : handleAnalyzeJD}
                  disabled={loading || !file}
                  className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-bold py-4 px-8 rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Target size={20} />}
                  {loading ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>
            )}
          </header>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-8">
            {activeTab === 'history' && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                {historyLoading ? (
                  <div className="flex justify-center p-12"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">No history found.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historyList.map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setMockHistoryView(null);
                          setRecruiterHistoryView(null);
                          if (item.type === 'CAREER_ANALYSIS') {
                            setResult(item.data);
                            setJdResult(null);
                            setAuthenticityResult(null);
                            setTailoredResume(null);
                            setActiveTab('career');
                          } else if (item.type === 'JD_MATCH') {
                            setJdResult(item.data);
                            setResult(null);
                            setAuthenticityResult(null);
                            setTailoredResume(null);
                            setActiveTab('jd');
                          } else if (item.type === 'AUTHENTICITY_CHECK') {
                            setAuthenticityResult(item.data);
                            setResult(null);
                            setJdResult(null);
                            setTailoredResume(null);
                            setActiveTab('authenticity');
                          } else if (item.type === 'MOCK_INTERVIEW') {
                            setMockHistoryView(item.data);
                            setResult(null);
                            setJdResult(null);
                            setAuthenticityResult(null);
                            setTailoredResume(null);
                          } else if (item.type === 'RECRUITER_MODE') {
                            setRecruiterHistoryView(item.data);
                            setResult(null);
                            setJdResult(null);
                            setAuthenticityResult(null);
                            setTailoredResume(null);
                          }
                        }}
                        className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md cursor-pointer transition group"
                      >
                        <div className="text-xs text-sky-600 font-bold mb-2 uppercase tracking-wider">{item.type.replace('_', ' ')}</div>
                        <h4 className="font-bold text-slate-900 group-hover:text-sky-600 transition truncate" title={item.title}>{item.title}</h4>
                        <div className="text-xs text-slate-500 mt-3 font-medium">{new Date(item.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'jd' && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Paste Job Description</h3>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 h-32 resize-none transition"
                  placeholder="Paste the job requirements here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>
            )}

            {!result && !jdResult && !authenticityResult && !loading && !mockHistoryView && !recruiterHistoryView && activeTab !== 'history' && (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mb-6">
                  {activeTab === 'career' ? <Briefcase className="text-sky-500" size={40} /> : activeTab === 'authenticity' ? <AlertCircle className="text-sky-500" size={40} /> : <FileCode className="text-sky-500" size={40} />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Ready for AI Analysis</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Upload your resume using the button in the top right corner to begin extracting insights and building your career roadmap.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-sky-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-sky-500">
                    <Wand2 size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">AI Analysis in Progress</h3>
                <p className="text-slate-500 italic animate-pulse">Scanning keywords, matching skills, and mapping roadmaps...</p>
              </div>
            )}

            {/* Authenticity Tab */}
            {activeTab === 'authenticity' && authenticityResult && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Trust Score</h3>
                    <p className="text-slate-500 mt-1 font-medium">AI calculated resume authenticity</p>
                  </div>
                  <div className={`text-6xl font-black ${authenticityResult.trust_score > 70 ? 'text-emerald-500' : authenticityResult.trust_score > 40 ? 'text-orange-500' : 'text-red-500'}`}>
                    {authenticityResult.trust_score}%
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <AlertCircle className="text-orange-500" size={24} /> Red Flags Detected
                  </h3>
                  {authenticityResult.red_flags?.length > 0 ? (
                    <ul className="space-y-4">
                      {authenticityResult.red_flags.map((flag: any, i: number) => (
                        <li key={i} className="bg-orange-50/50 p-5 rounded-2xl border border-orange-200">
                          <span className="font-bold text-slate-900 block mb-2 text-lg">Claim: {flag.claim}</span>
                          <span className="text-slate-600 font-medium">Issue: {flag.reason}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
                      <p className="text-slate-500 font-bold text-lg">No red flags detected. This resume appears highly authentic.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Career Results */}
            {result && activeTab === 'career' && (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <p className="text-sky-600 text-sm font-bold uppercase tracking-wider mb-3">Career Score</p>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-7xl font-black text-slate-900">{result.score}</h4>
                      <span className="text-slate-400 font-bold text-xl">/100</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-3">ATS Readiness</p>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-7xl font-black text-slate-900">{result.ats_compatibility}</h4>
                      <span className="text-slate-400 font-bold text-xl">%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Target size={24} className="text-sky-500" /> Key Strengths
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {result.strengths?.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 text-slate-700 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" /> {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-10 shadow-2xl">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <Calendar className="text-sky-400" size={28} /> Personalized Career Roadmap
                  </h3>
                  <div className="grid gap-8">
                    {Object.entries(result.roadmap || {}).map(([period, tasks], idx) => (
                      <div key={idx} className="group relative pl-8 border-l-2 border-slate-700 hover:border-sky-500 transition duration-500">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-900 border-2 border-slate-700 group-hover:border-sky-500 rounded-full transition duration-500"></div>
                        <h4 className="text-sky-400 font-black uppercase tracking-widest text-sm mb-4">{period}</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {Array.isArray(tasks) && tasks.map((task, i) => (
                            <div key={i} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl text-sm text-slate-300 flex items-start gap-3 hover:border-sky-500/50 hover:bg-slate-800/80 transition">
                              <ChevronRight className="text-sky-500 mt-0.5 shrink-0" size={18} />
                              {task}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* JD Match Results */}
            {jdResult && activeTab === 'jd' && !tailoredResume && (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-[12px] border-slate-50 bg-white shadow-xl mb-8">
                      <span className="text-5xl font-black text-sky-600">{jdResult.match_percentage}%</span>
                    </div>
                    <h3 className="text-4xl font-black mb-4 text-slate-900">Job Match Score</h3>
                    <p className="text-slate-500 max-w-xl mx-auto text-lg mb-10">"{jdResult.suitability_summary}"</p>
                    
                    <button 
                      onClick={handleTailorResume}
                      disabled={tailoring}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-10 py-5 rounded-2xl transition shadow-xl shadow-slate-900/20 text-lg"
                    >
                      {tailoring ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                      {tailoring ? 'Generating AI Resume...' : 'One-Click AI Resume'}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                      <CheckCircle2 className="text-emerald-500" size={24} /> Matching Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jdResult.matching_skills?.map((s, i) => (
                        <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                      <AlertCircle className="text-red-500" size={24} /> Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jdResult.missing_keywords?.map((s, i) => (
                        <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tailored Resume Display */}
            {tailoredResume && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
                <button 
                  onClick={() => setTailoredResume(null)}
                  className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-2 transition bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"
                >
                  <ChevronRight className="rotate-180" size={18} /> Back to Analysis
                </button>
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-200 flex flex-wrap gap-3 justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-black flex items-center gap-2 text-slate-900">
                      <Wand2 className="text-sky-500" size={28} /> Tailored AI Resume
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleDownloadPDF}
                        disabled={compilingPdf}
                        className="p-3 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-200 rounded-xl transition text-white flex items-center gap-2 font-bold shadow-md"
                      >
                        {compilingPdf ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        {compilingPdf ? 'Compiling...' : 'Download PDF'}
                      </button>
                    </div>
                  </div>
                  <div className="p-10 max-h-[700px] overflow-y-auto font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white">
                    {tailoredResume}
                  </div>
                </div>
              </div>
            )}

            {mockHistoryView && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900">
                  <Mic className="text-sky-500" size={28} /> Past Mock Interview Log
                </h3>
                <div className="max-h-[600px] overflow-y-auto space-y-4 pr-4">
                  {mockHistoryView.messages.map((msg: any, i: number) => (
                    <div key={i} className={`p-5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-sky-50 border border-sky-200 ml-12 text-slate-800' : 'bg-slate-50 border border-slate-200 mr-12 text-slate-800'}`}>
                      <span className="font-bold mb-2 block text-xs opacity-50 uppercase tracking-widest">{msg.role}</span>
                      {msg.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recruiterHistoryView && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900">
                  <Users className="text-sky-500" size={28} /> Past Recruiter Batch Analysis
                </h3>
                <div className="space-y-4">
                  {recruiterHistoryView.candidates.map((candidate: any, i: number) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex justify-between items-center hover:border-sky-300 transition">
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">Candidate #{i + 1}</h4>
                        <p className="text-sm text-slate-500 font-medium mt-1">Match: {candidate.suitability_summary}</p>
                      </div>
                      <div className="text-4xl font-black text-emerald-500">{candidate.match_percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
