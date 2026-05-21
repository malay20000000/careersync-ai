import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Users, Trophy, AlertCircle, FileText, ChevronDown, ChevronUp, Briefcase, FileCode, Mic, Calendar, CheckCircle2, ArrowLeft } from 'lucide-react';

interface CandidateResult {
  filename: string;
  candidate_name: string;
  match_percentage: number;
  matching_skills: string[];
  missing_keywords: string[];
  suitability_summary: string;
  status: string;
}

const RecruiterResultsPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const state = location.state as { candidates: CandidateResult[]; filesCount: number; jdText: string } | null;
  
  if (!state || !state.candidates) {
    navigate('/recruiter');
    return null;
  }

  const { candidates, filesCount } = state;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRankColor = (idx: number) => {
    if (idx === 0) return 'text-yellow-500';
    if (idx === 1) return 'text-slate-400';
    if (idx === 2) return 'text-orange-500';
    return 'text-slate-500';
  };

  const getRankBg = (idx: number) => {
    if (idx === 0) return 'bg-yellow-50 border-yellow-200';
    if (idx === 1) return 'bg-slate-50 border-slate-200';
    if (idx === 2) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-slate-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-sky-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
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
              <button onClick={() => navigate('/recruiter')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition bg-emerald-50 text-emerald-600"><Users size={18} /> Recruiter Mode</button>
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
      <main className="flex-1 ml-72 p-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/recruiter')} className="text-slate-500 hover:text-emerald-600 font-bold flex items-center gap-2 mb-4 transition">
              <ArrowLeft size={18} /> Back to Upload
            </button>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Users className="text-emerald-500" size={32} /> Analysis Results
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Leaderboard and suitability analysis for the {filesCount} uploaded candidates.
            </p>
          </div>
        </header>

        <div className="max-w-5xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black flex items-center gap-2 text-slate-900">
                <Trophy size={28} className="text-yellow-500" /> Leaderboard Rankings
              </h3>
              <span className="bg-slate-100 text-slate-600 font-bold px-4 py-1.5 rounded-full text-sm">{candidates.length} Candidates Analyzed</span>
            </div>

            <div className="space-y-4">
              {candidates.map((c, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl border shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md overflow-hidden ${getRankBg(idx)}`}
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                >
                  <div className="p-6 flex items-center gap-6">
                    {/* Rank */}
                    <div className={`text-4xl font-black w-16 text-center ${getRankColor(idx)}`}>
                      #{idx + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-xl truncate mb-1">{c.candidate_name}</h4>
                      <p className="text-slate-500 text-sm font-medium flex items-center gap-2 truncate">
                        <FileText size={14} /> {c.filename}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <div className={`text-3xl font-black ${getScoreColor(c.match_percentage)}`}>
                          {c.match_percentage}%
                        </div>
                        <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1">Match</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        {expandedIdx === idx ? <ChevronUp size={20} className="text-slate-600" /> : <ChevronDown size={20} className="text-slate-600" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedIdx === idx && (
                    <div className="px-6 pb-6 pt-2 animate-in fade-in duration-300">
                      <div className="border-t border-slate-200/60 pt-4 space-y-6">
                        <p className="text-slate-600 text-sm italic font-medium bg-white/50 p-4 rounded-xl border border-slate-100">
                          "{c.suitability_summary}"
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h5 className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                              <CheckCircle2 size={16} /> Matching Skills
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {c.matching_skills.map((s, i) => (
                                <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h5 className="text-xs font-bold text-red-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                              <AlertCircle size={16} /> Missing Keywords
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {c.missing_keywords.map((s, i) => (
                                <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterResultsPage;
