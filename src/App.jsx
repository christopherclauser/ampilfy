import React, { useState, useMemo, useRef } from 'react';
import { Search, Gamepad2, X, Maximize2, ExternalLink, Volume2, Film, Github, Square, Play, Shield, Download, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './games.json';
import soundsData from './sounds.json';
import moviesData from './movies.json';

export default function App() {
  console.log('App mounting...');
  const [activeTab, setActiveTab] = useState('games');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeTranscript, setActiveTranscript] = useState(null);
  const playingSounds = useRef({});

  const cloak = () => {
    const win = window.open();
    if (!win) return;
    const url = window.location.href;
    win.document.title = 'Classes';
    const link = win.document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = 'https://ssl.gstatic.com/classroom/favicon.png';
    win.document.head.appendChild(link);
    const style = win.document.createElement('style');
    style.innerHTML = `
      body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; }
      iframe { width: 100%; height: 100%; border: none; }
    `;
    win.document.head.appendChild(style);
    const iframe = win.document.createElement('iframe');
    iframe.src = url;
    win.document.body.appendChild(iframe);
    window.location.replace('https://google.com');
  };

  const filteredGames = useMemo(() => {
    return gamesData.filter(game => 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredSounds = useMemo(() => {
    return soundsData.filter(sound => 
      sound.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredMovies = useMemo(() => {
    return moviesData.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const playSound = (sound) => {
    try {
      // Stop existing instance if it's already playing to avoid overlap
      if (playingSounds.current[sound.id]) {
        playingSounds.current[sound.id].pause();
        playingSounds.current[sound.id].currentTime = 0;
      }

      const audio = new Audio(sound.url);
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";
      
      const playId = sound.id;
      playingSounds.current[playId] = audio;
      
      setActiveTranscript(sound.transcript);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setActiveTranscript(`BLOCKED: ${sound.title}`);
          setTimeout(() => setActiveTranscript(null), 3000);
        });
      }

      audio.onended = () => {
        if (playingSounds.current[playId] === audio) {
          delete playingSounds.current[playId];
          if (Object.keys(playingSounds.current).length === 0) {
            setActiveTranscript(null);
          }
        }
      };
    } catch (err) {
      console.error("Audio creation failed:", err);
      setActiveTranscript("System Error: Audio Init Failed");
    }
  };

  const downloadSound = (sound) => {
    const link = document.createElement('a');
    link.href = sound.url;
    link.download = `${sound.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stopAllSounds = () => {
    Object.values(playingSounds.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    playingSounds.current = {};
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-cyan/30 scanline relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-magenta/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => { setActiveTab('games'); setSelectedGame(null); }}
          >
            <div className="w-10 h-10 bg-neon-cyan/10 rounded-lg flex items-center justify-center border border-neon-cyan/30 group-hover:border-neon-cyan transition-all neon-glow-cyan">
              <Gamepad2 className="w-6 h-6 text-neon-cyan" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">
              TOPHERS<span className="text-neon-magenta">GAMES</span>
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {[
              { id: 'games', icon: Gamepad2, label: 'Games', color: 'neon-cyan' },
              { id: 'soundboard', icon: Volume2, label: 'Sounds', color: 'neon-magenta' },
              { id: 'movies', icon: Film, label: 'Movies', color: 'neon-yellow' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedGame(null); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest cursor-pointer ${
                  activeTab === tab.id 
                    ? `bg-${tab.color} text-black` 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="SEARCH THE GRID..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-neon-cyan/50 transition-all text-[10px] font-bold tracking-widest uppercase"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={cloak}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
              title="Cloak (About:Blank)"
            >
              <Shield className="w-5 h-5 text-zinc-400 group-hover:text-neon-cyan transition-colors" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Cloak Site
              </span>
            </button>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Github className="w-5 h-5 text-zinc-400" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'games' && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!selectedGame && (
                <div className="mb-12 flex flex-col lg:flex-row gap-10 items-center">
                  <div className="flex-1 border-l-2 border-neon-cyan/30 pl-6 py-4">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 italic">
                      Topher's <span className="text-neon-cyan">Games</span>
                    </h2>
                    <p className="text-sm font-mono text-zinc-400 uppercase tracking-[0.3em] max-w-xl leading-relaxed">
                      Topher is 11 5thgrade and made this website with his code with a bit of 6-7 versions
                    </p>
                    <div className="mt-8 flex gap-4">
                      <div className="h-1 w-20 bg-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                      <div className="h-1 w-10 bg-neon-magenta shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
                    </div>
                  </div>
                  <div className="flex-1 w-full max-w-3xl">
                    <div className="relative group rounded-2xl border border-white/10 overflow-hidden neon-glow-cyan/20">
                      <img 
                        src="https://gifdb.com/images/high/cyberpunk-pixel-city-neon-2bagugxcfp2to7tx.gif" 
                        alt="Cyberpunk City" 
                        className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                      <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[10px] font-mono text-neon-cyan uppercase tracking-widest">
                        System_Visual_01
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!selectedGame ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredGames.map((game) => (
                    <motion.div
                      key={game.id}
                      whileHover={{ y: -5 }}
                      className="group bg-zinc-900/40 border border-white/5 cyber-border overflow-hidden cursor-pointer hover:border-neon-cyan/50 transition-all"
                      onClick={() => setSelectedGame(game)}
                    >
                      <div className="aspect-video relative bg-zinc-800 flex items-center justify-center p-6">
                        <img 
                          src={game.thumbnail} 
                          alt={game.title}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Launch Session</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-sm uppercase tracking-tighter italic mb-1 text-neon-cyan group-hover:brightness-125 transition-all">{game.title}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter line-clamp-2">{game.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4 h-[calc(100vh-12rem)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedGame(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                        <X className="w-6 h-6" />
                      </button>
                      <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedGame.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer">
                        <Maximize2 className="w-4 h-4" /> Fullscreen
                      </button>
                      <a href={selectedGame.iframeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-black rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                        <ExternalLink className="w-4 h-4" /> Source
                      </a>
                    </div>
                  </div>
                  <div className="flex-1 bg-black rounded-xl border border-white/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
                    <iframe src={selectedGame.iframeUrl} className="w-full h-full border-none relative z-10" title={selectedGame.title} allowFullScreen />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'soundboard' && (
            <motion.div
              key="soundboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="border-l-2 border-neon-magenta/30 pl-6 py-2">
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">Sound <span className="text-neon-magenta">Archive</span></h2>
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-2">Neural audio link synchronized</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={stopAllSounds}
                    className="flex items-center gap-2 px-6 py-3 bg-neon-magenta/10 hover:bg-neon-magenta text-neon-magenta hover:text-black border border-neon-magenta/30 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4" /> Stop All
                  </button>
                </div>
              </div>

              {/* Transcript Display */}
              <AnimatePresence>
                {activeTranscript && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 overflow-hidden"
                  >
                    <div className="bg-neon-magenta/5 border border-neon-magenta/20 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-8 h-8 bg-neon-magenta/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-neon-magenta" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-neon-magenta/60 uppercase tracking-widest block mb-1">Live Transcript</span>
                        <p className="text-lg font-black italic uppercase tracking-tight text-white">{activeTranscript}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredSounds.map((sound) => (
                  <motion.div
                    key={sound.id}
                    whileHover={{ y: -5 }}
                    className="group relative bg-zinc-900/40 border border-white/5 p-4 rounded-xl hover:border-neon-magenta/50 transition-all flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-tighter italic text-neon-magenta group-hover:brightness-125 transition-all truncate">
                        {sound.title}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloadSound(sound); }}
                        className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-zinc-500 hover:text-white"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => playSound(sound)}
                      className="w-full py-4 bg-neon-magenta/10 hover:bg-neon-magenta text-neon-magenta hover:text-black border border-neon-magenta/20 hover:border-neon-magenta transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Play</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'movies' && (
            <motion.div
              key="movies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-12 border-l-2 border-neon-yellow/30 pl-6 py-2">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Movie <span className="text-neon-yellow">Stream</span></h2>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-2">Accessing encrypted media vault</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {filteredMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    whileHover={{ y: -5 }}
                    className="group bg-zinc-900/40 border border-white/5 cyber-border overflow-hidden cursor-pointer hover:border-neon-yellow/50 transition-all"
                    onClick={() => window.open(movie.driveUrl, '_blank')}
                  >
                    <div className="aspect-[2/3] relative bg-zinc-800 overflow-hidden">
                      <img 
                        src={movie.thumbnail} 
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neon-yellow">Open Drive</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-sm uppercase tracking-tighter italic text-neon-yellow group-hover:brightness-125 transition-all">{movie.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
            <Gamepad2 className="w-4 h-4 text-neon-cyan" />
            TOPHERSGAMES // SYSTEM ACTIVE
          </div>
          <div className="flex gap-6 text-[10px] font-mono uppercase tracking-widest">
            <a href="#" className="hover:text-neon-cyan transition-colors">Privacy</a>
            <a href="#" className="hover:text-neon-cyan transition-colors">Terms</a>
            <a href="#" className="hover:text-neon-cyan transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
