import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2, LayoutGrid, ListFilter, ClipboardCheck, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { organizeIdeas } from '@/src/services/ideaService';

interface IdeaCard {
  title: string;
  description: string;
}

export default function App() {
  const [notes, setNotes] = useState('');
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [cards, setCards] = useState<IdeaCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleOrganize = async () => {
    if (!notes.trim()) return;
    
    setIsOrganizing(true);
    setError(null);
    try {
      const result = await organizeIdeas(notes);
      setCards(result.cards);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while organizing ideas.');
    } finally {
      setIsOrganizing(false);
    }
  };

  const clearAll = () => {
    setNotes('');
    setCards([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gallery-white flex flex-col selection:bg-neon-green selection:text-brutal-black">
      {/* Header Marquee */}
      <div className="bg-brutal-black text-gallery-white overflow-hidden whitespace-nowrap py-3 border-b border-brutal-black">
        <div className="animate-marquee flex gap-8">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="font-display uppercase text-xl tracking-widest flex items-center gap-4">
              Idea Organizer <Sparkles size={20} className="text-neon-green" /> 
              Messy Notes to Clean Cards <Sparkles size={20} className="text-neon-green" />
            </span>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0 border-x border-brutal-black">
        {/* Input Column */}
        <section className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-brutal-black p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display uppercase text-3xl flex items-center gap-2">
              <span className="bg-brutal-black text-gallery-white px-2 py-0.5">01</span> Input
            </h2>
            <button 
              onClick={clearAll}
              className="p-2 hover:bg-red-50 text-brutal-black/40 hover:text-red-500 transition-colors border border-transparent hover:border-red-200 rounded-lg"
              title="Clear all"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <p className="text-sm text-brutal-black/60 font-medium italic">
            Paste your messy, duplicate-filled, chaotic brainstorming notes below. 
            AI will distill them into clean, distinct idea cards.
          </p>

          <div className="relative flex-1 min-h-[400px] flex flex-col">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Example:
- Solar powered coffee maker
- We should build a coffee maker that uses the sun
- Maybe it has a built-in grinder
- Need to consider cloudy days
- Coffee maker with batteries
- Solar beans... wait no..."
              className="flex-1 w-full bg-transparent border-2 border-brutal-black p-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-4 focus:ring-neon-green/20 focus:border-neon-green transition-all resize-none"
            />
          </div>

          <button
            onClick={handleOrganize}
            disabled={isOrganizing || !notes.trim()}
            className={cn(
              "group relative overflow-hidden bg-brutal-black text-gallery-white py-4 font-display text-xl uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
              !isOrganizing && notes.trim() && "hover:bg-neon-green hover:text-brutal-black"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              {isOrganizing ? (
                <>
                  <Loader2 className="animate-spin" /> Organizing...
                </>
              ) : (
                <>
                  Process Brainstorm <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
        </section>

        {/* Results Column */}
        <section className="lg:col-span-7 bg-[#f8f8f8] p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display uppercase text-3xl flex items-center gap-2">
              <span className="bg-brutal-black text-gallery-white px-2 py-0.5">02</span> Organizer
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono uppercase text-brutal-black/40">
              <span className="flex items-center gap-1"><ListFilter size={14} /> Merge Similar</span>
              <span className="flex items-center gap-1"><ClipboardCheck size={14} /> Remove Dups</span>
            </div>
          </div>

          {cards.length === 0 && !isOrganizing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-brutal-black/10 rounded-2xl opacity-40">
              <Lightbulb size={48} strokeWidth={1} className="mb-4" />
              <p className="font-display uppercase text-2xl">Output will appear here</p>
              <p className="text-sm font-mono mt-2 max-w-xs">Waiting for your brilliant (or messy) ideas to be processed.</p>
            </div>
          ) : (
            <div className="flex-1 h-0 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {isOrganizing ? (
                  <motion.div 
                    key="loading-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gallery-white border-2 border-brutal-black p-4 h-40 animate-pulse flex flex-col gap-3">
                        <div className="h-6 w-3/4 bg-brutal-black/10" />
                        <div className="h-4 w-full bg-brutal-black/5" />
                        <div className="h-4 w-5/6 bg-brutal-black/5" />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="results-grid"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {cards.map((card, index) => (
                      <motion.div
                        key={index}
                        variants={{
                          hidden: { opacity: 0, scale: 0.95, y: 20 },
                          visible: { opacity: 1, scale: 1, y: 0 }
                        }}
                        whileHover={{ y: -5, x: 2, boxShadow: '4px 4px 0px 0px #000' }}
                        className="group bg-gallery-white border-2 border-brutal-black flex flex-col relative transition-all"
                      >
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-neon-green border-2 border-brutal-black flex items-center justify-center font-display text-sm z-10">
                          {(index + 1).toString().padStart(2, '0')}
                        </div>
                        <div className="p-4 border-b-2 border-brutal-black bg-brutal-black text-gallery-white group-hover:bg-neon-green group-hover:text-brutal-black transition-colors">
                          <h3 className="font-display uppercase text-lg leading-tight line-clamp-2">
                            {card.title}
                          </h3>
                        </div>
                        <div className="p-4 flex-1">
                          <p className="text-sm font-medium text-brutal-black/80 leading-relaxed italic">
                            "{card.description}"
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-brutal-black/5 border-t border-brutal-black/10 flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono uppercase tracking-tighter opacity-30">Distilled Idea</span>
                          <LayoutGrid size={12} className="opacity-20" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-brutal-black bg-brutal-black text-gallery-white py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-60">
          <span>AI POWERED DISTILLATION</span>
          <span className="w-1 h-1 bg-neon-green rounded-full" />
          <span>ZERO REDUNDANCY ENGINE</span>
        </div>
        <p className="text-[10px] font-mono opacity-40">
          © 2026 IDEA ORGANIZER • AGENTIC SYSTEMS
        </p>
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000000;
          border-radius: 9999px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #000000 transparent;
        }
      `}</style>
    </div>
  );
}
