import React, { useState, useMemo, useRef } from 'react';
import { Search, Gamepad2, X, Maximize2, ExternalLink, Volume2, Film, Github, Square, Play, Shield, Download, MessageSquare, User, Pencil, CheckSquare, LayoutGrid, Key, Backpack, LogOut, Box, Rocket, UserCircle2, ArrowLeft, ChevronLeft, ChevronRight, Send, Menu, Calculator, Type, Sigma, Eraser, RotateCcw, RotateCw, Trash2, Keyboard, Circle, Image, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './games.json';
import soundsData from './sounds.json';
import moviesData from './movies.json';

export default function App() {
  console.log('App mounting...');
  const [view, setView] = useState<string>('amplify'); // 'amplify' or 'app'
  const [dashboardTab, setDashboardTab] = useState<string>('apps'); // 'apps', 'todo', 'past'
  const [activeTab, setActiveTab] = useState<string>('games');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [activeTranscript, setActiveTranscript] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showAssignmentSplash, setShowAssignmentSplash] = useState<boolean>(false);
  const [showDoneModal, setShowDoneModal] = useState<boolean>(false);
  const [showAppError, setShowAppError] = useState<string | null>(null);
  console.log('showAppError state:', showAppError);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [direction, setDirection] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [submittedPages, setSubmittedPages] = useState<Record<number, boolean>>({});
  const [wrongAttempts, setWrongAttempts] = useState<Record<number, boolean>>({});
  const [currentTool, setCurrentTool] = useState<string>('pencil');
  const [paths, setPaths] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingSounds = useRef<Record<string, HTMLAudioElement>>({});

  // Reset assignment state when selectedAssignment changes
  React.useEffect(() => {
    if (!selectedAssignment) {
      setCurrentPage(1);
      setUserAnswers({});
      setSubmittedPages({});
      setWrongAttempts({});
      setPaths([]);
      setCurrentTool('pencil');
      setDirection(0);
    }
  }, [selectedAssignment]);

  // Redraw canvas when paths change
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isDrawing) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    paths.forEach(path => {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = path.tool === 'eraser' ? 20 : 3;
      ctx.strokeStyle = path.tool === 'eraser' ? '#ffffff' : '#1A73E8';
      ctx.beginPath();
      if (path.points.length > 0) {
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      }
    });
  }, [paths, isDrawing]);

  // Clear canvas on page change
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPaths([]);
  }, [currentPage]);

  // Generate problem based on topic and page
  const getProblemForPage = (topic: string, page: number) => {
    const isMultipleChoice = page % 3 === 0; // Every 3rd page is multiple choice
    
    let q = "";
    let opts = null;
    let ctx = "";
    let ans: any = null;

    // Use a seed-like approach for consistency within a page
    const seed = page * 13 + (topic?.length || 0);
    const n1 = (seed % 40) + 10;
    const n2 = ((seed * 7) % 30) + 5;

    switch(topic) {
      case 'Addition':
        ctx = `Kris has ${n1} toy cars and buys ${n2} more.`;
        q = `How many toy cars does Kris have in total?`;
        ans = n1 + n2;
        if (isMultipleChoice) opts = [ans, ans + 5, ans - 2, ans + 10];
        break;
      case 'Subtraction':
        ctx = `Kris had ${n1 + n2} toy cars and sold ${n1} of them.`;
        q = `How many toy cars does Kris have left?`;
        ans = n2;
        if (isMultipleChoice) opts = [ans, ans + 5, ans - 3, n1];
        break;
      case 'Multiplication':
        const price = (n1 / 10).toFixed(2);
        const count = (n2 % 10) + 2;
        ctx = `Kris is selling toy cars for $${price} each.`;
        q = `If Kris sells ${count} cars, how much money will he earn?`;
        ans = (parseFloat(price) * count).toFixed(2);
        if (isMultipleChoice) opts = [ans, (parseFloat(ans) * 1.1).toFixed(2), (parseFloat(ans) * 0.9).toFixed(2), (parseFloat(ans) * 2).toFixed(2)];
        break;
      case 'Division':
        ctx = `Kris has ${n1 * 5} toy cars and wants to put them into ${5} equal boxes.`;
        q = `How many toy cars will be in each box?`;
        ans = n1;
        if (isMultipleChoice) opts = [ans, ans + 2, ans - 1, 5];
        break;
      case 'Adding Fractions':
        q = `What is 1/4 + 2/4?`;
        ans = "3/4";
        if (isMultipleChoice) opts = ["3/4", "1/2", "3/8", "1/4"];
        break;
      case 'Subtracting Fractions':
        q = `What is 5/8 - 2/8?`;
        ans = "3/8";
        if (isMultipleChoice) opts = ["3/8", "7/8", "1/4", "3/4"];
        break;
      case 'Multiplying Fractions':
        q = `What is 1/2 × 1/3?`;
        ans = "1/6";
        if (isMultipleChoice) opts = ["1/6", "2/5", "1/5", "2/3"];
        break;
      case 'Dividing Fractions':
        q = `What is 1/2 ÷ 1/4?`;
        ans = "2";
        if (isMultipleChoice) opts = ["2", "1/8", "1/2", "4"];
        break;
      case 'Finding Percentages':
        q = `What is 20% of 50?`;
        ans = "10";
        if (isMultipleChoice) opts = ["10", "5", "20", "15"];
        break;
      case 'Variables':
        q = `If x + 5 = 12, what is x?`;
        ans = "7";
        if (isMultipleChoice) opts = ["7", "17", "5", "12"];
        break;
      case 'Doing Variables with Numbers':
        q = `If y = 3, what is 4y + 2?`;
        ans = "14";
        if (isMultipleChoice) opts = ["14", "12", "10", "16"];
        break;
      case 'To the Power of':
        q = `What is 2 to the power of 3?`;
        ans = "8";
        if (isMultipleChoice) opts = ["8", "6", "9", "16"];
        break;
      default:
        ctx = "Kris is selling little toy cars for $1.50 each.";
        q = "Write an equation that represents how much money Kris earns, m, for selling any number of toy cars, c.";
        ans = "m = 1.50c";
    }

    return { context: ctx, question: q, options: opts, correctAnswer: ans };
  };

  const problemData = useMemo(() => {
    if (!selectedAssignment) return { context: "", question: "", options: null, correctAnswer: null };
    return getProblemForPage(selectedAssignment.topic, currentPage);
  }, [selectedAssignment?.topic, currentPage]);

  const { context, question, options, correctAnswer } = problemData;

  const topicMap = {
    1: 'Addition',
    2: 'Subtraction',
    3: 'Multiplication',
    4: 'Division',
    5: 'Adding Fractions',
    6: 'Subtracting Fractions',
    7: 'Multiplying Fractions',
    8: 'Dividing Fractions',
    9: 'Finding Percentages',
    10: 'Variables',
    11: 'Doing Variables with Numbers',
    12: 'To the Power of'
  };

  const todoItems = useMemo(() => {
    const items = [];
    // To-do items should be the next ones in the sequence
    let mid = 12;
    let last = 19;
    for (let i = 0; i < 3; i++) {
      items.push({
        id: `todo-${i}`,
        title: `6.${mid.toString().padStart(2, '0')}.${last.toString().padStart(2, '0')}`,
        date: `Due Mar ${17 + i + 1}`,
        status: 'New',
        unit: 'Unit 5',
        topic: topicMap[mid] || 'Review',
        totalPages: Math.floor(Math.random() * 8) + 8
      });
      last++;
    }
    return items.sort((a, b) => b.title.localeCompare(a.title, undefined, { numeric: true }));
  }, []);

  const pastWorkItems = useMemo(() => {
    const items = [];
    const start = new Date(2025, 7, 29); // Aug 29, 2025
    const end = new Date(2026, 2, 17); // Mar 17, 2026
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let currentDate = new Date(end);
    let mid = 12;
    let last = 18;

    while (currentDate >= start) {
      const month = months[currentDate.getMonth()];
      const day = currentDate.getDate();
      
      items.push({
        id: currentDate.getTime(),
        title: `6.${mid.toString().padStart(2, '0')}.${last.toString().padStart(2, '0')}`,
        date: `Completed ${month} ${day}`,
        unit: `Unit ${Math.ceil(mid / 4)}`,
        topic: topicMap[mid] || 'Review',
        timestamp: currentDate.getTime(),
        totalPages: Math.floor(Math.random() * 8) + 8 // 8-15 pages
      });

      // Decrement the "numbers" sequentially
      last--;
      if (last < 0) {
        last = 18;
        mid--;
      }
      if (mid < 1) mid = 1;

      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Secret entry point logic
    const secretIndex = Math.floor(Math.random() * items.length);
    items[secretIndex].isSecret = true;
    items[secretIndex].date = '67';
    
    return items;
  }, []);

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

  const playSound = async (sound) => {
    try {
      // Stop existing instance if it's already playing to avoid overlap
      if (playingSounds.current[sound.id]) {
        playingSounds.current[sound.id].pause();
        playingSounds.current[sound.id].currentTime = 0;
      }

      setActiveTranscript(sound.transcript);

      // Use fetch with no-referrer to bypass hotlink protection
      let audio;
      let blobUrl;
      try {
        const response = await fetch(sound.url, { referrerPolicy: 'no-referrer' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
        audio = new Audio(blobUrl);
      } catch (fetchErr) {
        console.warn("Fetch failed, falling back to direct Audio:", fetchErr);
        audio = new Audio(sound.url);
      }
      
      audio.preload = "auto";
      
      const playId = sound.id;
      playingSounds.current[playId] = audio;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setActiveTranscript(`BLOCKED: ${sound.title}`);
          setTimeout(() => setActiveTranscript(null), 3000);
        });
      }

      audio.onended = () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl); // Clean up the blob URL
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
      setTimeout(() => setActiveTranscript(null), 3000);
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

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setPaths(prev => [...prev, { tool: currentTool, points: [{ x, y }] }]);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPaths(prev => {
      const newPaths = [...prev];
      const currentPath = newPaths[newPaths.length - 1];
      currentPath.points.push({ x, y });
      return newPaths;
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = currentTool === 'eraser' ? 20 : 3;
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : '#1A73E8';
    
    const lastPath = paths[paths.length - 1];
    if (lastPath && lastPath.points.length > 1) {
      const p1 = lastPath.points[lastPath.points.length - 2];
      const p2 = lastPath.points[lastPath.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPaths([]);
  };

  if (selectedAssignment && showAssignmentSplash) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans overflow-hidden">
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-center gap-12 relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-10">
            <Send className="w-16 h-16 text-gray-400 -rotate-45" />
          </div>

          {/* Assignment Card */}
          <div className="w-full max-w-[320px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden transform -rotate-1">
            <div className="bg-[#A5D6A7] aspect-square flex items-center justify-center p-8 relative">
              <div className="w-full h-full bg-[#81C784] rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="absolute top-4 left-4 w-24 h-3 bg-[#2E7D32]/20 rounded-full" />
                <div className="absolute top-10 left-4 w-16 h-3 bg-[#2E7D32]/20 rounded-full" />
                <Pencil className="w-24 h-24 text-[#1B5E20] rotate-45 drop-shadow-xl" />
              </div>
            </div>
            <div className="p-6 text-center">
              <h2 className="text-2xl font-black text-[#3C4043] mb-2 tracking-tight">Practice {selectedAssignment.title}</h2>
              <p className="text-gray-500 font-bold text-sm leading-tight px-2">
                Lesson Practice: {selectedAssignment.topic}
              </p>
            </div>
          </div>

          {/* Welcome Text & Action */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <h1 className="text-5xl md:text-6xl font-black text-[#3C4043] leading-[1.1] tracking-tight">
              Welcome back, <br />
              <span className="text-[#1A73E8]">Guest!</span>
            </h1>
            
            <div className="space-y-4">
              <button 
                onClick={() => setShowAssignmentSplash(false)}
                className="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white px-8 py-4 rounded-full text-lg font-black shadow-md hover:shadow-xl hover:scale-105 transition-all active:scale-95 uppercase tracking-widest"
              >
                Continue the activity
              </button>
              
              <div className="flex flex-col md:flex-row items-center gap-2 text-gray-400 font-bold text-sm">
                <span>Not Guest?</span>
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  className="text-[#9C27B0] hover:underline decoration-2 underline-offset-4"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedAssignment) {
    const totalPages = selectedAssignment.totalPages || 10;
    const isReflectPage = currentPage === totalPages;

    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans text-[#3C4043]">
        {/* Header */}
        <header className="bg-[#F8F9FA] border-b border-gray-300 px-6 h-14 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-lg font-medium text-gray-900">Practice {selectedAssignment.title}</h1>
              <p className="text-xs text-gray-500">Guest</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Maximize2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Calculator className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => {
                setDirection(-1);
                setCurrentPage(p => Math.max(1, p - 1));
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">{currentPage} of {totalPages}</span>
            <button 
              onClick={() => {
                if (currentPage < totalPages) {
                  setDirection(1);
                  setCurrentPage(p => p + 1);
                } else {
                  setShowDoneModal(true);
                }
              }}
              className={`px-4 py-1.5 border rounded-md transition-all flex items-center gap-2 text-sm font-medium ${
                isReflectPage ? 'bg-[#9C27B0] text-white border-[#9C27B0] hover:bg-[#7B1FA2]' : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {isReflectPage ? 'Done' : 'Next'} {!isReflectPage && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center p-4 lg:p-8 overflow-auto relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div 
              key={currentPage}
              initial={{ x: direction * 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-[98%] bg-white border-2 border-gray-400 rounded-sm shadow-lg p-6 lg:p-10 flex flex-col items-center"
            >
              {isReflectPage ? (
              <div className="w-full max-w-6xl space-y-12">
                <h2 className="text-3xl font-sans font-medium text-gray-600 text-center">Reflect</h2>
                
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                  {/* Left Side: Table */}
                  <div className="w-full lg:w-1/2 border-2 border-gray-400 rounded-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-400">
                          <th className="p-4 font-bold text-gray-600 border-r-2 border-gray-400 text-center w-1/3">Problem</th>
                          <th className="p-4 font-bold text-gray-600 text-center">Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: totalPages - 1 }).map((_, i) => {
                          const pageNum = i + 1;
                          const userAnswer = userAnswers[pageNum];
                          const problem = getProblemForPage(selectedAssignment.topic, pageNum);
                          const isCorrect = userAnswer?.toString() === problem.correctAnswer?.toString();
                          
                          return (
                            <tr key={i} className="border-b-2 border-gray-400 last:border-b-0">
                              <td className="p-4 text-center border-r-2 border-gray-400 font-medium text-gray-600 bg-gray-50">{pageNum}</td>
                              <td className="p-4 min-h-[50px] bg-gray-50 text-center">
                                {userAnswer ? (
                                  isCorrect ? (
                                    <span className="text-green-600 font-bold flex items-center justify-center gap-2">
                                      <CheckSquare className="w-5 h-5" /> Correct
                                    </span>
                                  ) : (
                                    <span className="text-red-600 font-bold flex items-center justify-center gap-2">
                                      <X className="w-5 h-5" /> Incorrect
                                    </span>
                                  )
                                ) : (
                                  <span className="text-gray-400 italic">Incomplete</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Right Side: Reflection Box */}
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="space-y-4">
                      <p className="text-xl text-gray-700">Here are your results from this lesson practice.</p>
                      <p className="text-xl text-gray-700">Use this space to ask a question or share something you're proud of.</p>
                    </div>

                    <div className="border-2 border-gray-400 rounded-sm overflow-hidden shadow-sm bg-white">
                      <div className="min-h-[200px] p-6">
                        <textarea 
                          placeholder=""
                          className="w-full h-full outline-none text-xl font-medium resize-none min-h-[150px]"
                        />
                      </div>
                      <div className="bg-[#F8F9FA] border-t-2 border-gray-400 p-4 flex justify-between items-center">
                        <div className="flex gap-3">
                          <button className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-sm shadow-sm hover:bg-gray-50">
                            <Image className="w-6 h-6 text-gray-600" />
                          </button>
                          <button className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-sm shadow-sm hover:bg-gray-50">
                            <Mic className="w-6 h-6 text-gray-600" />
                          </button>
                          <button className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-sm shadow-sm hover:bg-gray-50">
                            <Sigma className="w-6 h-6 text-gray-600" />
                          </button>
                        </div>
                        <button className="px-8 py-3 bg-[#D1A3D1] text-white font-bold rounded-sm shadow-sm hover:bg-[#C183C1] transition-all">
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-sans font-bold text-gray-500 mb-8">Problem {currentPage}</h2>
                
                <div className="w-full flex flex-col lg:flex-row gap-12 items-start justify-center">
                  {/* Left Side: Drawing Area with Toolbar on Top */}
                  <div className="flex flex-col gap-4 w-full lg:w-auto">
                    {/* Horizontal Toolbar on Top */}
                    <div className="flex gap-1 bg-white p-1.5 rounded-sm border-2 border-gray-400 shadow-sm w-fit">
                      {[
                        { id: 'pencil', icon: Pencil, color: 'bg-[#1A73E8] text-white' },
                        { id: 'arrow', icon: ArrowLeft, color: 'bg-white text-gray-600' },
                        { id: 'type', icon: Type, color: 'bg-white text-gray-600' },
                        { id: 'sigma', icon: Sigma, color: 'bg-white text-gray-600' },
                        { id: 'eraser', icon: Eraser, color: 'bg-white text-gray-600' },
                        { id: 'undo', icon: RotateCcw, color: 'bg-[#C62828] text-white' },
                      ].map((tool, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            if (tool.id === 'undo') {
                              // Simple undo: pop last path and redraw
                              setPaths(prev => {
                                const newPaths = prev.slice(0, -1);
                                const canvas = canvasRef.current;
                                if (canvas) {
                                  const ctx = canvas.getContext('2d');
                                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                                  newPaths.forEach(path => {
                                    ctx.lineCap = 'round';
                                    ctx.lineJoin = 'round';
                                    ctx.lineWidth = path.tool === 'eraser' ? 20 : 3;
                                    ctx.strokeStyle = path.tool === 'eraser' ? '#ffffff' : '#1A73E8';
                                    ctx.beginPath();
                                    ctx.moveTo(path.points[0].x, path.points[0].y);
                                    for (let j = 1; j < path.points.length; j++) {
                                      ctx.lineTo(path.points[j].x, path.points[j].y);
                                    }
                                    ctx.stroke();
                                  });
                                }
                                return newPaths;
                              });
                            } else {
                              setCurrentTool(tool.id);
                            }
                          }}
                          className={`w-10 h-10 flex items-center justify-center rounded-sm transition-all ${
                            currentTool === tool.id ? tool.color : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <tool.icon className="w-5 h-5" />
                        </button>
                      ))}
                      <div className="w-[2px] h-7 bg-gray-300 mx-2 self-center" />
                      <button className="w-10 h-10 flex items-center justify-center bg-white rounded-sm hover:bg-gray-50">
                        <RotateCcw className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center bg-white rounded-sm hover:bg-gray-50">
                        <RotateCw className="w-5 h-5 text-gray-400" />
                      </button>
                      <div className="w-[2px] h-7 bg-gray-300 mx-2 self-center" />
                      <button 
                        onClick={clearCanvas}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-sm hover:bg-gray-50"
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    </div>

                    {/* Drawing Canvas Area */}
                    <div className="flex-1 lg:w-[650px] h-[650px] bg-white border-2 border-gray-400 rounded-sm shadow-md relative overflow-hidden">
                      <canvas 
                        ref={canvasRef}
                        width={650}
                        height={650}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="cursor-crosshair"
                      />
                    </div>
                  </div>

                  {/* Right Side: Problem Text and Input */}
                  <div className="flex-1 space-y-10 pt-4 max-w-2xl">
                    <div className="space-y-6 p-8 bg-white border-2 border-gray-400 rounded-sm shadow-sm">
                      {context && <p className="text-xl text-gray-700 leading-relaxed font-medium">{context}</p>}
                      <p className="text-3xl text-gray-900 leading-relaxed font-bold">
                        {question}
                      </p>
                    </div>

                    {options ? (
                      <div className="w-full space-y-6">
                        <div className="grid grid-cols-1 gap-4 w-full">
                          {options.map((option, i) => (
                            <button 
                              key={i}
                              disabled={submittedPages[currentPage]}
                              onClick={() => setUserAnswers(prev => ({ ...prev, [currentPage]: option }))}
                              className={`flex items-center gap-4 p-6 bg-white border-2 rounded-lg transition-all text-left group shadow-sm ${
                                userAnswers[currentPage] === option ? 'border-[#1A73E8] bg-blue-50' : 'border-gray-400 hover:border-[#1A73E8] hover:bg-blue-50'
                              } ${submittedPages[currentPage] ? 'opacity-80 cursor-default' : ''}`}
                            >
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                                userAnswers[currentPage] === option ? 'border-[#1A73E8]' : 'border-gray-400 group-hover:border-[#1A73E8]'
                              }`}>
                                <div className={`w-5 h-5 rounded-full ${
                                  userAnswers[currentPage] === option ? 'bg-[#1A73E8]' : 'bg-transparent'
                                }`} />
                              </div>
                              <span className="text-2xl font-bold">{option}</span>
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-end items-center">
                          <button 
                            disabled={!userAnswers[currentPage]}
                            onClick={() => {
                              const isSubmitted = submittedPages[currentPage];
                              setSubmittedPages(prev => ({ ...prev, [currentPage]: !isSubmitted }));
                              if (!isSubmitted) {
                                const isCorrect = userAnswers[currentPage]?.toString() === correctAnswer?.toString();
                                setWrongAttempts(prev => ({ ...prev, [currentPage]: !isCorrect }));
                              }
                            }}
                            className={`px-8 py-3 text-white font-bold rounded-sm shadow-sm transition-all ${
                              !userAnswers[currentPage] ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                              submittedPages[currentPage] 
                                ? 'bg-gray-400 hover:bg-gray-500' 
                                : 'bg-[#D1A3D1] hover:bg-[#C183C1]'
                            }`}
                          >
                            {submittedPages[currentPage] ? 'Unsubmit' : 'Submit'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full space-y-6">
                        <div className="border-2 border-gray-400 rounded-sm overflow-hidden shadow-sm bg-white">
                          <div className="min-h-[120px] p-6">
                            <input 
                              type="text" 
                              onFocus={() => {
                                if (submittedPages[currentPage]) {
                                  setSubmittedPages(prev => ({ ...prev, [currentPage]: false }));
                                }
                              }}
                              value={userAnswers[currentPage] || ''}
                              onChange={(e) => {
                                setUserAnswers(prev => ({ ...prev, [currentPage]: e.target.value }));
                                if (wrongAttempts[currentPage]) {
                                  setWrongAttempts(prev => ({ ...prev, [currentPage]: false }));
                                }
                              }}
                              placeholder="Enter your answer"
                              className="w-full h-full outline-none text-3xl font-bold placeholder:text-gray-300 border-b-4 border-transparent focus:border-[#D1A3D1] transition-colors pb-2"
                            />
                          </div>
                          <div className="bg-[#F8F9FA] border-t-2 border-gray-400 p-4 flex justify-between items-center">
                            <button className="w-14 h-14 flex items-center justify-center bg-white border-2 border-gray-300 rounded-sm shadow-sm hover:bg-gray-50">
                              <Keyboard className="w-8 h-8 text-gray-600" />
                            </button>
                            <button 
                              disabled={!userAnswers[currentPage]}
                              onClick={() => {
                                const isSubmitted = submittedPages[currentPage];
                                setSubmittedPages(prev => ({ ...prev, [currentPage]: !isSubmitted }));
                                if (!isSubmitted) {
                                  const isCorrect = userAnswers[currentPage]?.toString().trim().toLowerCase() === correctAnswer?.toString().trim().toLowerCase();
                                  setWrongAttempts(prev => ({ ...prev, [currentPage]: !isCorrect }));
                                }
                              }}
                              className={`px-8 py-3 text-white font-bold rounded-sm shadow-sm transition-all ${
                                !userAnswers[currentPage] ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                submittedPages[currentPage] 
                                  ? 'bg-gray-400 hover:bg-gray-500' 
                                  : 'bg-[#D1A3D1] hover:bg-[#C183C1]'
                              }`}
                            >
                              {submittedPages[currentPage] ? 'Unsubmit' : 'Submit'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Done Confirmation Modal */}
      <AnimatePresence>
        {showDoneModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDoneModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-12 flex flex-col items-center text-center space-y-10">
                <h2 className="text-5xl font-sans font-light text-gray-700">Finished your activity?</h2>
                
                <div className="flex items-center justify-center gap-6 w-full pt-4">
                  <button 
                    onClick={() => setShowDoneModal(false)}
                    className="px-10 py-4 border-2 border-gray-300 rounded-full text-xl font-medium text-gray-600 hover:bg-gray-50 transition-all min-w-[240px]"
                  >
                    Continue working
                  </button>
                  <button 
                    onClick={() => {
                      setShowDoneModal(false);
                      setSelectedAssignment(null);
                    }}
                    className="px-10 py-4 bg-[#9C27B0] text-white rounded-full text-xl font-bold hover:bg-[#7B1FA2] shadow-lg transition-all min-w-[200px]"
                  >
                    I'm done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

  if (view === 'amplify') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2B58A7] via-[#3A78B5] to-[#4DB6AC] text-white font-['Lexend'] relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-4 h-4 border-2 border-white rotate-45" />
          <div className="absolute top-40 right-20 w-6 h-6 border-2 border-white rounded-full" />
          <div className="absolute bottom-40 left-1/4 w-8 h-8 border-2 border-white" />
          <div className="absolute top-1/2 right-1/3 w-5 h-5 border-t-2 border-l-2 border-white rotate-12" />
          {/* Add more geometric shapes to match the image */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-white/40 text-xl font-light"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              {['+', '×', '○', '△', '□'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        {/* Classroom Header */}
        <header className="bg-white text-[#5F6368] px-4 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6B00] rounded flex items-center justify-center text-white font-bold text-xl shadow-sm">A</div>
              <span className="text-2xl font-bold tracking-tight text-[#5F6368]">classroom</span>
            </div>
            <div className="h-8 w-[1px] bg-gray-300 mx-2" />
            <span className="text-2xl font-bold text-[#202124] tracking-tight">Guest</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 flex items-center justify-center bg-[#E8F0FE] text-[#1A73E8] rounded-full shadow-sm hover:bg-[#D2E3FC] transition-colors">
              <Key className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-[#E8F0FE] text-[#1A73E8] rounded-full shadow-sm hover:bg-[#D2E3FC] transition-colors">
              <Backpack className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setView('app')}
              className="w-12 h-12 flex items-center justify-center bg-[#1A73E8] text-white rounded-full shadow-md hover:bg-[#1765CC] transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">
          {/* Profile & Nav Buttons */}
          <div className="flex items-center gap-4 mb-12">
            <div className="relative">
              <div className="w-24 h-24 bg-[#E8EAED] rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 text-[#BDC1C6]" />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setDashboardTab('apps')}
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all border-2 ${
                  dashboardTab === 'apps' ? 'bg-[#1A73E8] text-white border-[#1A73E8]' : 'bg-white text-[#1A73E8] border-transparent hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                Apps
              </button>
              <button 
                onClick={() => setDashboardTab('todo')}
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all border-2 ${
                  dashboardTab === 'todo' ? 'bg-[#1A73E8] text-white border-[#1A73E8]' : 'bg-white text-[#1A73E8] border-transparent hover:bg-gray-50'
                }`}
              >
                <Pencil className="w-5 h-5" />
                To Do
              </button>
              <button 
                onClick={() => setDashboardTab('past')}
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all border-2 ${
                  dashboardTab === 'past' ? 'bg-[#1A73E8] text-white border-[#1A73E8]' : 'bg-white text-[#1A73E8] border-transparent hover:bg-gray-50'
                }`}
              >
                <CheckSquare className="w-5 h-5" />
                Past Work
              </button>
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl font-medium text-white shadow-sm flex flex-col items-center justify-center min-w-[140px] border border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70 mb-1">Today is</span>
                <span className="text-sm font-extrabold">Tue, Mar 17th</span>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="w-full">
            {dashboardTab === 'apps' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {[
                  { title: 'Math Fluency Practice', color: 'bg-[#4CAF50]', icon: <div className="grid grid-cols-2 gap-1"><div className="w-4 h-4 bg-white rounded-sm" /><div className="w-4 h-4 bg-white rounded-sm" /><div className="w-4 h-4 bg-white rounded-sm" /></div> },
                  { title: 'Polypad Manipulatives', color: 'bg-[#2196F3]', icon: <Box className="w-12 h-12 text-white" /> },
                  { title: 'Formula Won', color: 'bg-[#E91E63]', icon: <Rocket className="w-12 h-12 text-white" /> },
                  { title: 'Twelve a Dozen', color: 'bg-[#00BCD4]', icon: <div className="relative"><UserCircle2 className="w-12 h-12 text-black" /><div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">12</div></div> }
                ].map((app, i) => (
                  <div 
                    key={i}
                    onClick={() => setShowAppError(app.title)}
                    className="bg-white rounded-xl p-4 shadow-xl hover:scale-105 transition-transform cursor-pointer group"
                  >
                    <div className={`${app.color} rounded-lg aspect-video mb-4 flex items-center justify-center p-6 relative overflow-hidden`}>
                      {typeof app.icon === 'string' ? (
                        <img 
                          src={app.icon} 
                          alt={app.title} 
                          className="w-16 h-16 object-contain drop-shadow-md group-hover:rotate-12 transition-transform"
                        />
                      ) : (
                        <div className="drop-shadow-md group-hover:rotate-12 transition-transform">
                          {app.icon}
                        </div>
                      )}
                    </div>
                    <h3 className="text-[#3C4043] font-bold text-center text-lg">{app.title}</h3>
                  </div>
                ))}
              </div>
            )}

            {dashboardTab === 'todo' && (
              <div className="flex flex-col gap-6 w-full max-w-6xl">
                {todoItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => { setSelectedAssignment(item); setCurrentPage(1); setShowAssignmentSplash(true); }}
                    className="bg-white p-8 rounded-2xl shadow-xl flex gap-10 items-center hover:scale-[1.01] transition-transform cursor-pointer group"
                  >
                    <div className="w-48 h-48 bg-[#A5D6A7] rounded-2xl flex items-center justify-center p-6 border-8 border-[#2E7D32]">
                      <div className="w-full h-full bg-[#81C784] rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-4 left-4 w-20 h-4 bg-[#2E7D32]/20" />
                        <div className="absolute top-12 left-4 w-14 h-4 bg-[#2E7D32]/20" />
                        <Pencil className="w-24 h-24 text-[#1B5E20] rotate-45 drop-shadow-2xl" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-6">
                          <span className="bg-[#C8E6C9] text-[#2E7D32] text-sm font-black px-4 py-1.5 rounded-lg uppercase tracking-widest">Math</span>
                          <span className="text-lg text-gray-500 font-bold">Lesson Practice: {item.topic}</span>
                        </div>
                        <span className="text-lg text-gray-400 font-bold">{item.date}</span>
                      </div>
                      <h3 className="text-6xl font-black text-[#3C4043] group-hover:text-[#1A73E8] transition-colors tracking-tight">Practice {item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dashboardTab === 'past' && (
              <div className="flex flex-col gap-6 w-full max-w-6xl">
                {pastWorkItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      if (item.isSecret) {
                        setView('app');
                      } else {
                        setSelectedAssignment(item);
                        setCurrentPage(1);
                        setShowAssignmentSplash(true);
                      }
                    }}
                    className="bg-white/95 p-8 rounded-2xl shadow-xl flex gap-10 items-center hover:bg-white transition-all cursor-pointer group"
                  >
                    <div className="w-40 h-40 bg-[#E1F5FE] rounded-2xl flex items-center justify-center p-6 opacity-90 border-4 border-[#0288D1]/20">
                      <CheckSquare className="w-20 h-20 text-[#0288D1] drop-shadow-lg" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-6">
                          <span className="bg-[#B3E5FC] text-[#0288D1] text-sm font-black px-4 py-1.5 rounded-lg uppercase tracking-widest">Math</span>
                          <span className="text-lg text-gray-500 font-bold">Review: {item.topic}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg text-gray-400 font-bold">{item.date}</span>
                        </div>
                      </div>
                      <h3 className="text-5xl font-black text-[#3C4043] group-hover:text-[#1A73E8] transition-colors tracking-tight">Practice {item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => setView('amplify')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
              title="Return to Dashboard"
            >
              <Maximize2 className="w-5 h-5 text-zinc-400 group-hover:text-neon-cyan transition-colors rotate-45" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Dashboard
              </span>
            </button>
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
            <a href="https://github.com/TopherClauser/TopherGames" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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

      {/* App Error Modal */}
      <AnimatePresence>
        {showAppError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAppError(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="w-10 h-10 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                  <p className="text-gray-500">
                    You do not have permission to access <span className="font-bold text-gray-900">{showAppError}</span>. 
                    Please contact your teacher for access.
                  </p>
                </div>
                <button 
                  onClick={() => setShowAppError(null)}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
