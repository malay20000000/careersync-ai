import React from 'react';
import { Navbar } from './Navbar';
import { DashboardMockup } from './DashboardMockup';
import { ArrowUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <div 
      className="relative min-h-[100svh] overflow-hidden bg-cover bg-center flex flex-col font-sans"
      style={{ backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260611_133301_d5f2a94a-b22e-4e4a-a6b6-eacdddf1f5b0.png&w=1280&q=85')` }}
    >
      <Navbar />

      {/* Spacer between nav and content */}
      <div className="flex-1 min-h-8 sm:min-h-12 lg:min-h-16 shrink-0" />

      {/* Hero Content */}
      <div className="flex flex-col items-center justify-center text-center px-5 shrink-0 relative z-20">
        
        <h1 className="text-gray-900 font-normal leading-[1.05] tracking-tight text-[40px] min-[400px]:text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px] flex flex-col items-center">
          <span className="animate-fade-up block">Get Hired.</span>
          <span className="animate-fade-up block [animation-delay:100ms]">Effortlessly.</span>
        </h1>

        <form className="animate-fade-up [animation-delay:220ms] mt-5 sm:mt-6 w-full max-w-xl">
          <div className="flex items-center gap-3 rounded-full bg-white/60 backdrop-blur-md ring-1 ring-gray-200 pl-5 pr-1.5 py-1.5 shadow-sm">
            <input 
              type="text" 
              placeholder="What makes a resume rank in AI screening?"
              className="flex-1 bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 outline-none py-2"
            />
            <button 
              type="submit"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-900 text-white hover:scale-105 active:scale-95 transition-transform shrink-0 flex items-center justify-center"
            >
              <ArrowUp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </form>

        <p className="animate-fade-up [animation-delay:340ms] mt-4 sm:mt-5 text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
          Tailor resumes that answer actual recruiter expectations <br className="hidden sm:block" />
          -- and be seen on <Sparkles className="inline w-4 h-4 -mt-1 text-gray-800" /> ATS Platforms.
        </p>

        <div className="animate-fade-up [animation-delay:460ms] mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-3 mb-8">
          <Link 
            to="/register" 
            className="bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-800 hover:shadow-lg transition-all"
          >
            Try It Free
          </Link>
          <Link 
            to="/features" 
            className="text-gray-700 text-sm font-medium px-6 py-2.5 rounded-full ring-1 ring-gray-300 hover:bg-gray-100 transition-colors bg-white/50 backdrop-blur-sm"
          >
            Explore Features
          </Link>
        </div>

      </div>

      {/* Spacer between content and dashboard */}
      <div className="flex-1 min-h-10 sm:min-h-12 lg:min-h-16 shrink-0" />

      {/* Dashboard Mockup Component */}
      <DashboardMockup />

      {/* Grass Overlay */}
      <img 
        src="https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1781191264/grass_eam204.png" 
        alt="grass foreground" 
        className="pointer-events-none absolute bottom-0 left-0 z-10 w-full select-none"
      />
    </div>
  );
};
