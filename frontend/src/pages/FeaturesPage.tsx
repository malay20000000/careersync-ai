import { Link } from 'react-router-dom';
import { ArrowRight, Brain, FileText, Target, Users } from 'lucide-react';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900">
            Everything you need to <span className="text-sky-600">succeed</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            CareerSync AI provides a complete suite of tools for job seekers and recruiters to find the perfect match.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 group">
            <div className="bg-sky-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileText className="text-sky-600" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Resume Parsing & JD Matcher</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Instantly extract skills and experience from your resume. Compare it against job descriptions to get an ATS compatibility score and identify missing keywords before you apply.
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 group">
            <div className="bg-sky-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Brain className="text-sky-600" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">AI Mentor & Mock Interviews</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Chat with a 24/7 AI career mentor for personalized advice, or jump into a live mock interview to practice answering dynamic questions based entirely on your uploaded resume.
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 group">
            <div className="bg-sky-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="text-sky-600" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Career Roadmaps</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Not ready for the job yet? Let CareerSync AI generate a personalized 0-12 month timeline designed to bridge your skill gaps and teach you exactly what you need to learn.
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 group">
            <div className="bg-sky-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="text-sky-600" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Recruiter Batch Analysis</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Hiring? Upload dozens of applicant resumes at once alongside a job description. Our AI will automatically score, rank, and summarize every candidate on a clean leaderboard.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-3 bg-sky-600 hover:bg-sky-500 text-white px-10 py-5 rounded-2xl font-black text-xl transition shadow-2xl shadow-sky-500/30 hover:-translate-y-1 duration-300">
            Continue to Login <ArrowRight size={24} />
          </Link>
          <p className="mt-6 text-slate-500 font-bold">New here? You can create an account on the next screen.</p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
