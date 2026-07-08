import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="animate-fade-down relative z-20 flex flex-row items-center justify-between px-5 py-4 sm:px-8 sm:py-5 lg:px-10">
      <Link to="/" className="flex items-center gap-2 text-gray-900">
        <Logo className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="font-bold tracking-tight text-lg">CareerSync AI</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <button className="flex items-center gap-1.5 text-[13px] text-gray-700 hover:text-gray-900 transition-colors">
          Toolkit <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <Link to="/features" className="text-[13px] text-gray-700 hover:text-gray-900 transition-colors">
          Features
        </Link>
        <Link to="/plans" className="text-[13px] text-gray-700 hover:text-gray-900 transition-colors">
          Plans
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          to="/login"
          className="bg-gray-900 text-white text-[13px] font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-full hover:bg-gray-800 transition-colors"
        >
          Sign In
        </Link>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-gray-900 hover:bg-gray-900/10 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute left-4 right-4 top-full mt-2 rounded-2xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-200 px-5 py-3 animate-fade-up flex flex-col shadow-xl">
          <Link to="/features" className="text-[15px] font-medium text-gray-700 hover:text-gray-900 border-b border-gray-200 py-3">
            Features
          </Link>
          <Link to="/plans" className="text-[15px] font-medium text-gray-700 hover:text-gray-900 border-b border-gray-200 py-3">
            Plans
          </Link>
          <Link to="/login" className="text-[15px] font-medium text-gray-700 hover:text-gray-900 py-3">
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
};
