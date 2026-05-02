import React from 'react';
import { 
  ChevronRight, 
  Code2, 
  ChevronDown, 
  BrainCircuit, 
  Pin, 
  Rocket, 
  Zap, 
  Layers, 
  Activity, 
  Bot, 
  CheckCircle2, 
  Box, 
  FastForward, 
  MessageSquare, 
  Cpu 
} from 'lucide-react';

export const DeployAgentsView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] overflow-hidden">
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#1F1F1F] bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <h2 className="text-sm font-bold text-white tracking-widest uppercase">Deploy Agents</h2>
           <ChevronRight className="w-3 h-3 text-gray-700" />
           <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1A1A1A] rounded-md border border-[#333]">
             <Code2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
             <span className="text-[11px] font-bold text-gray-300">Coding Agent</span>
             <ChevronDown className="w-3 h-3 text-gray-600 ml-1" />
           </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#080808]">
        {/* TITLE CARD */}
        <div className="flex items-center justify-between p-7 bg-[#0B0B0B] border border-[#1F1F1F] rounded-[32px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-6 relative z-10">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/10 to-transparent flex items-center justify-center border border-[#8B5CF6]/20 shadow-inner">
               <BrainCircuit className="w-7 h-7 text-[#8B5CF6]" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-white tracking-tight mb-1">Deploy Coding Agent</h3>
               <p className="text-xs text-gray-500 font-medium">Design and deploy your autonomous coding pipeline. Select architecture and models.</p>
             </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
             <button className="flex items-center gap-2 px-4 py-2.5 border border-[#1F1F1F] bg-[#111] rounded-xl text-[11px] font-bold text-gray-500 hover:text-white hover:bg-[#161616] transition-all">
               <Pin className="w-3.5 h-3.5" />
               Save as Template
             </button>
             <button className="flex items-center gap-2 px-6 py-2.5 bg-[#8B5CF6] text-black font-extrabold text-[11px] rounded-xl hover:bg-[#7C3AED] transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
               <Rocket className="w-3.5 h-3.5" />
               Deploy Agent
             </button>
          </div>
        </div>

        {/* SECTION 1: ARCHITECTURE */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 pl-1">
              <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[10px] font-bold text-[#8B5CF6]">1</div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Agent Template</span>
           </div>
           
           <div className="grid grid-cols-4 gap-4">
              {[
                { id: 'fast', label: 'Fast', desc: 'Single model, high speed', cost: 'Low Cost', icon: Zap },
                { id: 'cascade', label: 'Cascade', desc: 'Relay architecture', cost: 'Recommended', icon: Layers, active: true },
                { id: 'planner', label: 'Planner', desc: 'Plan & Execute pattern', cost: 'High Quality', icon: Activity },
                { id: 'autonomous', label: 'Autonomous', desc: 'Full agency loop', cost: 'Experimental', icon: Bot },
              ].map(t => (
                <div key={t.id} className={`p-6 bg-[#0E0E0E] border rounded-[24px] cursor-pointer transition-all relative group ${t.active ? 'border-[#8B5CF6] bg-[#8B5CF6]/[0.02] shadow-lg shadow-[#8B5CF6]/5' : 'border-[#1A1A1A] hover:border-[#333]'}`}>
                  <div className="flex items-start justify-between mb-5">
                    <div className={`p-2.5 rounded-xl ${t.active ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-[#161616] text-gray-600'}`}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    {t.active && <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{t.label}</h4>
                  <p className="text-[10px] text-gray-500 mb-4 leading-relaxed font-medium">{t.desc}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${t.active ? 'bg-[#8B5CF6]/20 text-[#A78BFA]' : 'bg-[#1A1A1A] text-gray-600'}`}>
                    {t.cost}
                  </span>
                </div>
              ))}
           </div>
        </div>

        {/* SECTION 2: MODEL ASSIGNMENT - 3 Cards */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 pl-1">
              <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[10px] font-bold text-[#8B5CF6]">2</div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Model Assignment</span>
           </div>

           <div className="grid grid-cols-3 gap-5">
              {[
                { role: 'Planner / Router', model: 'Qwen 7B Instruct', icon: Code2, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { role: 'Worker Models (Parallel)', model: 'Qwen3 3B (A27B)', icon: Box, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { role: 'Final Synthesis', model: 'Mistral 7B Instruct', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10' }
              ].map((item, idx) => (
                <div key={idx} className="p-6 bg-[#0E0E0E] border border-[#1A1A1A] rounded-[24px] space-y-5">
                   <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{item.role}</h4>
                   <div className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#1F1F1F] rounded-2xl cursor-pointer hover:border-[#333] transition-all group">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${item.bg}`}>
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                         </div>
                         <span className="text-xs font-bold text-white tracking-tight">{item.model}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
                   </div>
                   <div className="flex items-center gap-5 pt-1">
                      <div className="flex items-center gap-1.5"><FastForward className="w-3.5 h-3.5 text-yellow-500/80" /><span className="text-[9px] font-bold text-gray-500">SPEED: ULTRA</span></div>
                      <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-500/80" /><span className="text-[9px] font-bold text-gray-500">VRAM: ~14GB</span></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* PIPELINE PREVIEW VISUALIZER */}
        <div className="p-8 bg-[#0B0B0B] border border-[#1F1F1F] rounded-[32px] overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B5CF6]/40" />
           <div className="flex items-center justify-between mb-10 px-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Pipeline Preview</span>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Architecture</span>
              </div>
           </div>

           <div className="flex items-center justify-between px-10 relative">
              {/* Connector Line */}
              <div className="absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent -translate-y-full px-20" />
              
              <div className="flex flex-col items-center gap-4 z-10">
                 <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-[#1F1F1F] flex items-center justify-center shadow-xl"><MessageSquare className="w-6 h-6 text-gray-600" /></div>
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Task</span>
              </div>
              
              <div className="flex flex-col items-center gap-4 z-10">
                 <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-[#8B5CF6]/30 flex items-center justify-center shadow-xl shadow-[#8B5CF6]/5"><BrainCircuit className="w-6 h-6 text-[#8B5CF6]" /></div>
                 <span className="text-[10px] font-black text-white uppercase tracking-tighter">Router</span>
              </div>

              <div className="flex items-center gap-3 py-3 px-6 bg-[#141414]/80 border border-[#222] rounded-[24px] z-10 shadow-2xl backdrop-blur-md">
                 <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 border-2 border-[#0B0B0B] flex items-center justify-center"><Cpu className="w-4 h-4 text-[#8B5CF6]" /></div>)}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-200">WORKERS</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase">3x Parallel Nodes</span>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-4 z-10">
                 <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-orange-500/20 flex items-center justify-center shadow-xl"><Layers className="w-6 h-6 text-orange-500" /></div>
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Synthesize</span>
              </div>

              <div className="flex flex-col items-center gap-4 z-10">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shadow-xl"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Response</span>
              </div>
           </div>
        </div>

        {/* BOTTOM CONTROLS GRID */}
        <div className="grid grid-cols-2 gap-8 pt-2 pb-10">
           <div className="space-y-5">
              <div className="flex items-center gap-3 pl-1">
                 <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[10px] font-bold text-[#8B5CF6]">3</div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Execution Settings</span>
              </div>
              <div className="p-7 bg-[#0E0E0E] border border-[#1A1A1A] rounded-[28px] space-y-6">
                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-0.5">Parallel Workers</label>
                       <div className="relative">
                          <select className="w-full bg-[#141414] border border-[#1F1F1F] rounded-xl px-4 py-3 text-[11px] font-bold text-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]">
                             <option>3 Modules</option>
                             <option>5 Modules</option>
                             <option>8 Modules</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-0.5">Max Iterations</label>
                       <div className="relative">
                          <select className="w-full bg-[#141414] border border-[#1F1F1F] rounded-xl px-4 py-3 text-[11px] font-bold text-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]">
                             <option>10 Steps</option>
                             <option>20 Steps</option>
                             <option>Infinite Loop</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-5">
              <div className="flex items-center gap-3 pl-1">
                 <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[10px] font-bold text-[#8B5CF6]">4</div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Knowledge Ingestion</span>
              </div>
              <div className="p-7 bg-[#0E0E0E] border border-[#1A1A1A] rounded-[28px] h-full space-y-6">
                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                       <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-0.5">Project</span>
                       <div className="flex items-center justify-between px-4 py-3 bg-[#141414] border border-[#1F1F1F] rounded-xl">
                          <span className="text-[11px] font-bold text-white">E-commerce API</span>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-700" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
