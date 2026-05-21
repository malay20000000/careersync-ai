import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 font-inter flex flex-col justify-center items-center relative">
      
      {/* Background decorations for a bit of flair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-300/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <main className="container mx-auto px-6 text-center max-w-4xl relative z-10">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-slate-900">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">CareerSync AI</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-600 mb-14 leading-relaxed max-w-3xl mx-auto">
          Your AI-powered bridge from ambition to achievement. <br className="hidden md:block" /> Supercharge your resume and dominate your next interview.
        </h2>
        
        <div className="flex justify-center">
          <Link to="/features" className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-black text-xl transition shadow-2xl shadow-slate-900/20 hover:scale-105 duration-300">
            Explore Features <ArrowRight size={24} />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
