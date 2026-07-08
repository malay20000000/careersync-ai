import React, { useEffect, useRef, useState } from 'react';
import { 
  PanelLeft, ChevronLeft, ChevronRight, Monitor, RotateCw, Share, Plus, Copy,
  Grid, Compass, Layers, ListTodo, Sparkles
} from 'lucide-react';
import { Logo } from './Logo';

const ScaledDashboard = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && innerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Fixed design width specified in prompt: 896px
        const designWidth = 896; 
        const newScale = containerWidth / designWidth;
        setScale(newScale);
        setHeight(innerRef.current.offsetHeight * newScale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative" style={{ height: `${height}px` }}>
      <div 
        ref={innerRef} 
        className="absolute top-0 left-0 w-[896px] origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
};

export const DashboardMockup = () => {
  return (
    <div className="animate-hero-rise [animation-delay:620ms] relative z-0 w-[92%] sm:w-[84%] lg:w-[72%] max-w-4xl mx-auto shrink-0 -mb-10 sm:-mb-20 lg:-mb-32">
      <ScaledDashboard>
        <div className="rounded-t-2xl overflow-hidden bg-[#1a1a1c] shadow-[0_-20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10 text-left flex flex-col h-[600px]">
          
          {/* Title bar */}
          <div className="bg-[#242427] border-b border-white/5 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-4 flex items-center gap-3">
                <PanelLeft className="w-3.5 h-3.5 text-white/40" />
                <div className="flex items-center gap-1.5 ml-2">
                  <ChevronLeft className="w-3.5 h-3.5 text-white/40" />
                  <ChevronRight className="w-3.5 h-3.5 text-white/25" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 max-w-sm mx-4">
              <div className="bg-[#1a1a1c] rounded-md px-6 py-1 flex items-center justify-center gap-2 text-[10px] text-white/60">
                <Monitor className="w-3 h-3" />
                careersync.ai
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <RotateCw className="w-3.5 h-3.5 text-white/40" />
              <Share className="w-3.5 h-3.5 text-white/40" />
              <Plus className="w-3.5 h-3.5 text-white/40" />
              <Copy className="w-3.5 h-3.5 text-white/40" />
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-[22%] shrink-0 border-r border-white/5 bg-[#1e1e21] px-3 py-3.5 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <Logo className="w-4 h-4 text-white/70" />
                <Grid className="w-3.5 h-3.5 text-white/30" />
              </div>
              
              <div className="flex items-center gap-2 mb-6 px-1">
                <div className="w-4 h-4 rounded bg-[#e8553f] flex items-center justify-center text-[9px] font-bold text-white">
                  C
                </div>
                <span className="text-[10px] text-white/80 font-medium">CareerSync AI</span>
              </div>
              
              <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-[10px] text-white/60 cursor-pointer">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Uncover</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/10 text-[10px] text-white/90 cursor-pointer">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Resumes</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-[10px] text-white/60 cursor-pointer">
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>Interviews</span>
                </div>
              </div>
              
              <div className="px-2 mb-2 text-[8px] font-bold text-white/40 tracking-wider">RECENT RESUMES</div>
              <div className="flex flex-col gap-1.5 px-2">
                <div className="flex items-center gap-2 text-[10px] text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]/70" />
                  Frontend Engineer
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]/70" />
                  Product Manager
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#febc2e]/70" />
                  Data Scientist
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-[#151516] p-8 overflow-hidden flex flex-col gap-8">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#e8553f] flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-[#e8553f]/20">
                    C
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-white">CareerSync AI Workspace</h2>
                    <p className="text-[10px] text-white/45">Manage your resumes and mock interviews</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full text-[11px] font-medium hover:bg-white/90 transition-colors">
                  <Sparkles className="w-3 h-3" />
                  Analyze Resume
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 divide-x divide-white/5 rounded-xl bg-white/[0.03] ring-1 ring-white/5 shrink-0">
                <div className="px-5 py-4 flex flex-col gap-1">
                  <div className="text-[8px] font-bold tracking-wider text-white/35">ATS MATCH</div>
                  <div className="text-xl font-medium text-white">94%</div>
                </div>
                <div className="px-5 py-4 flex flex-col gap-1">
                  <div className="text-[8px] font-bold tracking-wider text-white/35">TAILORED RESUMES</div>
                  <div className="text-xl font-medium text-white">12</div>
                </div>
                <div className="px-5 py-4 flex flex-col gap-1">
                  <div className="text-[8px] font-bold tracking-wider text-white/35">INTERVIEW SCORE</div>
                  <div className="text-xl font-medium text-white">88/100</div>
                </div>
                <div className="px-5 py-4 flex flex-col gap-1">
                  <div className="text-[8px] font-bold tracking-wider text-white/35">APPLICATIONS</div>
                  <div className="text-xl font-medium text-white">45</div>
                </div>
              </div>

              {/* Subject Cards */}
              <div className="grid grid-cols-3 gap-4 shrink-0">
                <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/5 p-4 flex flex-col gap-2">
                  <h3 className="text-[11px] font-medium text-white/90">Software Engineering</h3>
                  <p className="text-[9px] text-white/40">Highly optimized for ATS screening.</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/5 p-4 flex flex-col gap-2">
                  <h3 className="text-[11px] font-medium text-white/90">Product Management</h3>
                  <p className="text-[9px] text-white/40">Focus on leadership and impact metrics.</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/5 p-4 flex flex-col gap-2">
                  <h3 className="text-[11px] font-medium text-white/90">Data Analytics</h3>
                  <p className="text-[9px] text-white/40">Strong emphasis on tooling and outcomes.</p>
                </div>
              </div>

              {/* Drafting Inbox */}
              <div className="flex-1 rounded-lg border border-white/5 overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-white/[0.02] border-b border-white/5 text-[9px] font-medium text-white/40">
                  <div className="col-span-6">RESUME VARIANT</div>
                  <div className="col-span-3">JD MATCH</div>
                  <div className="col-span-3">STATUS</div>
                </div>
                <div className="flex flex-col divide-y divide-white/5">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2.5 items-center">
                    <div className="col-span-6 text-[10px] text-white/80">Senior React Developer - Google</div>
                    <div className="col-span-3 text-[10px] text-white/60">98%</div>
                    <div className="col-span-3 text-[10px] text-[#28c840]/80">Ready</div>
                  </div>
                  <div className="grid grid-cols-12 gap-4 px-4 py-2.5 items-center bg-white/[0.01]">
                    <div className="col-span-6 text-[10px] text-white/80">Fullstack Engineer - Startup</div>
                    <div className="col-span-3 text-[10px] text-white/60">85%</div>
                    <div className="col-span-3 text-[10px] text-[#febc2e]/80">Analyzing</div>
                  </div>
                  <div className="grid grid-cols-12 gap-4 px-4 py-2.5 items-center">
                    <div className="col-span-6 text-[10px] text-white/80">Frontend Architect - Amazon</div>
                    <div className="col-span-3 text-[10px] text-white/60">91%</div>
                    <div className="col-span-3 text-[10px] text-[#28c840]/80">Ready</div>
                  </div>
                  <div className="grid grid-cols-12 gap-4 px-4 py-2.5 items-center">
                    <div className="col-span-6 text-[10px] text-white/80">Web Developer - Meta</div>
                    <div className="col-span-3 text-[10px] text-white/60">72%</div>
                    <div className="col-span-3 text-[10px] text-[#ff5f57]/80">Needs Revision</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </ScaledDashboard>
    </div>
  );
};
