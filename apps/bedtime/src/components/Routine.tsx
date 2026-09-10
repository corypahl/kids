import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Play, 
  RotateCcw, 
  Settings2, 
  CheckCircle2, 
  Timer as TimerIcon,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';
import { playTick, playSpinClick, playHooray, playTada } from '../lib/audio';

const COMMON_EMOJIS = [
  '⭐', '🚽', '👕', '🪮', '🪥', '👃', '🧴', '🧸', '📚', '💧', 
  '🛌', '🌙', '☀️', '🍎', '🥛', '🛁', '🫧', '🧻', '👖', '🧦'
];

const DEFAULT_TASKS: Task[] = [
  { id: '1', text: 'Go to the Bathroom', color: '#FF6B6B', emoji: '🚽' },
  { id: '2', text: 'Pajamas', color: '#4ECDC4', emoji: '👕' },
  { id: '3', text: 'Brush Hair', color: '#45B7D1', emoji: '🪮' },
  { id: '4', text: 'Brush Teeth', color: '#96CEB4', emoji: '🪥' },
  { id: '5', text: 'Nose Spray', color: '#FFEEAD', emoji: '👃' },
  { id: '6', text: 'Clean Ears/Lotion', color: '#D4A5A5', emoji: '🧴' },
];

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', 
  '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];

interface RoutineProps {
  name: string;
  avatar: string;
  avatarColor: string;
  storagePrefix: string;
  bgColor?: string;
  initialTasks?: Task[];
}

export default function Routine({ name, avatar, avatarColor, storagePrefix, bgColor = 'bg-white/50', initialTasks = DEFAULT_TASKS }: RoutineProps) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_tasks`);
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [completedTasks, setCompletedTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_completed`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(() => {
    const saved = localStorage.getItem(`${storagePrefix}_selected_task`);
    return saved ? JSON.parse(saved) : null;
  });
  const [timerDuration, setTimerDuration] = useState(() => {
    const saved = localStorage.getItem(`${storagePrefix}_timer`);
    return saved ? parseInt(saved, 10) : 15;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem(`${storagePrefix}_time_left`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isTimerActive, setIsTimerActive] = useState(() => {
    const saved = localStorage.getItem(`${storagePrefix}_timer_active`);
    return saved ? JSON.parse(saved) : false;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskEmoji, setNewTaskEmoji] = useState('⭐');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [stars, setStars] = useState(() => {
    const saved = localStorage.getItem(`${storagePrefix}_stars`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const maxStars = tasks.length + completedTasks.length;

  useEffect(() => {
    if (stars > maxStars) {
      setStars(maxStars);
    }
  }, [maxStars, stars]);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (task: Task) => {
    if (isSpinning) return;
    longPressTimer.current = setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== task.id));
      setCompletedTasks(prev => {
        if (prev.some(t => t.id === task.id)) return prev;
        return [...prev, task];
      });
      setSelectedTask(prev => (prev?.id === task.id ? null : prev));
      setIsTimerActive(false);
      playTada();
    }, 800);
  };

  const handlePointerUpOrLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const restoreTask = (taskToRestore: Task) => {
    setCompletedTasks(prev => prev.filter(t => t.id !== taskToRestore.id));
    setTasks(prev => [...prev, taskToRestore]);
  };

  // Persistence logic
  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_tasks`, JSON.stringify(tasks));
    localStorage.setItem(`${storagePrefix}_completed`, JSON.stringify(completedTasks));
    localStorage.setItem(`${storagePrefix}_timer`, timerDuration.toString());
    localStorage.setItem(`${storagePrefix}_stars`, stars.toString());
    localStorage.setItem(`${storagePrefix}_selected_task`, JSON.stringify(selectedTask));
    localStorage.setItem(`${storagePrefix}_time_left`, timeLeft.toString());
    localStorage.setItem(`${storagePrefix}_timer_active`, JSON.stringify(isTimerActive));
  }, [tasks, completedTasks, timerDuration, stars, selectedTask, timeLeft, isTimerActive, storagePrefix]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        playTick();
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      playTada();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const spinWheel = () => {
    if (isSpinning || tasks.length === 0) return;

    setIsSpinning(true);
    setSelectedTask(null);
    setIsTimerActive(false);

    const extraSpins = 5 + Math.random() * 5;
    const newRotation = rotation + extraSpins * 360 + Math.random() * 360;
    setRotation(newRotation);

    let spinTime = 0;
    const spinDuration = 4000;
    let lastClickTime = 0;
    
    const spinInterval = setInterval(() => {
      spinTime += 50;
      const progress = spinTime / spinDuration;
      const currentDelay = 50 + (progress * progress * 400);
      
      if (spinTime - lastClickTime >= currentDelay) {
        playSpinClick();
        lastClickTime = spinTime;
      }
      
      if (spinTime >= spinDuration) {
        clearInterval(spinInterval);
      }
    }, 50);

    setTimeout(() => {
      setIsSpinning(false);
      const actualRotation = newRotation % 360;
      const segmentAngle = 360 / tasks.length;
      const index = Math.floor(((360 - (actualRotation % 360)) % 360) / segmentAngle);
      const landedTask = tasks[index];
      
      setSelectedTask(landedTask);
      setTimeLeft(timerDuration);
      
      // Remove task from wheel after a short delay
      setTimeout(() => {
        setTasks(prev => prev.filter(t => t.id !== landedTask.id));
        setCompletedTasks(prev => [...prev, landedTask]);
      }, 2000);
    }, 4000);
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText.trim(),
      color: COLORS[tasks.length % COLORS.length],
      emoji: newTaskEmoji
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setShowEmojiPicker(false);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const resetApp = () => {
    setTasks(initialTasks);
    setCompletedTasks([]);
    setSelectedTask(null);
    setIsTimerActive(false);
    setTimeLeft(0);
    setRotation(0);
    setStars(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col gap-4 w-full h-full rounded-3xl p-4 border border-white/10 shadow-xl ${bgColor}`}>
      {/* Header for Routine */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner border-2 border-white/20" style={{ backgroundColor: avatarColor }}>
            {avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{name}'s Routine</h2>
            <div className="flex items-center gap-1 text-[#FDCB6E] font-bold text-lg drop-shadow-sm">
              ⭐ {stars} / {maxStars}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-colors shadow-sm"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button 
            onClick={resetApp}
            className="p-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Column: Tasks Management */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="xl:col-span-4 space-y-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-md border border-white/20 text-white"
            >
              <div>
                <h3 className="text-md font-bold mb-2 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Manage Tasks
                </h3>
                <div className="flex gap-2 mb-2 relative">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 border border-white/20 rounded-xl hover:bg-white/20 text-lg bg-white/10 transition-colors flex items-center justify-center w-10 h-10"
                    title="Choose Emoji"
                  >
                    {newTaskEmoji}
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-[#2D3436] border border-white/10 rounded-2xl shadow-xl z-50 grid grid-cols-5 gap-1 w-56">
                      {COMMON_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setNewTaskEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="p-1 hover:bg-white/10 rounded-xl text-xl transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <input 
                    type="text" 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="New task..."
                    className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                  />
                  <button 
                    onClick={addTask}
                    className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors w-10 h-10 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl group border border-white/5 hover:border-white/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm text-xs" style={{ backgroundColor: task.color }}>
                          {task.emoji}
                        </div>
                        <span className="text-xs font-medium text-white/90">{task.text}</span>
                      </div>
                      <button 
                        onClick={() => removeTask(task.id)}
                        className="text-white/30 hover:text-[#FF7675] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/20">
                <h3 className="text-md font-bold mb-2 flex items-center gap-2">
                  <TimerIcon className="w-4 h-4" /> Timer Settings
                </h3>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="15" 
                    max="120" 
                    step="15"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                    className="flex-1 accent-white"
                  />
                  <span className="font-mono font-bold text-white w-12 text-right text-sm">
                    {timerDuration >= 60 ? `${Math.floor(timerDuration / 60)}m ` : ''}{timerDuration % 60 > 0 ? `${timerDuration % 60}s` : ''}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Middle Column: The Wheel */}
        <div className={`xl:col-span-${showSettings ? '5' : '8'} flex flex-col items-center justify-center py-2`}>
          <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px]">
            {/* Pointer */}
            <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-20">
              <div className="w-6 h-8 bg-[#2D3436] clip-path-triangle shadow-lg" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
            </div>

            {/* Wheel Container */}
            <motion.div 
              className="w-full h-full rounded-full border-[8px] border-white shadow-xl overflow-hidden relative"
              animate={{ rotate: rotation }}
              transition={{ 
                duration: 4, 
                ease: [0.45, 0.05, 0.55, 0.95] 
              }}
            >
              {tasks.length > 0 ? (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {tasks.map((task, i) => {
                    const angle = 360 / tasks.length;
                    const startAngle = i * angle;
                    const endAngle = (i + 1) * angle;
                    
                    const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);
                    
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const d = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    return (
                      <g 
                        key={task.id}
                        onPointerDown={() => handlePointerDown(task)}
                        onPointerUp={handlePointerUpOrLeave}
                        onPointerLeave={handlePointerUpOrLeave}
                        onPointerCancel={handlePointerUpOrLeave}
                        onContextMenu={(e) => e.preventDefault()}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <path d={d} fill={task.color} stroke="white" strokeWidth="0.5" />
                        <g transform={`rotate(${startAngle + angle / 2}, 50, 50)`}>
                          <foreignObject x="35" y="5" width="30" height="30">
                            <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center text-white text-[12px]" style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.3))' }}>
                              {task.emoji}
                            </div>
                          </foreignObject>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/70 font-serif italic text-sm text-center px-4">
                  All done! Time for bed.
                </div>
              )}
              
              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-inner flex items-center justify-center z-10">
                <div className="w-2 h-2 bg-[#2D3436] rounded-full" />
              </div>
            </motion.div>

            {/* Spin Button Overlay */}
            <button 
              onClick={spinWheel}
              disabled={isSpinning || tasks.length === 0}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 
                w-16 h-16 rounded-full bg-white shadow-2xl flex flex-col items-center justify-center
                transition-transform active:scale-90 hover:scale-105 border-4 border-white/50
                ${(isSpinning || tasks.length === 0) ? 'opacity-0 pointer-events-none' : 'opacity-100'}
              `}
            >
              <span className="text-[#2D3436] font-bold text-xs uppercase tracking-widest">Spin</span>
              <Play className="w-4 h-4 text-[#2D3436] fill-current" />
            </button>
          </div>

          {/* Selected Task & Timer Display */}
          <div className="mt-2 w-full max-w-xs text-center">
            <AnimatePresence mode="wait">
              {selectedTask && (
                <motion.div
                  key={selectedTask.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20"
                >
                  <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold mb-1">Current Task</h3>
                  <h2 className="text-xl font-serif font-black mb-3 flex items-center justify-center gap-2" style={{ color: selectedTask.color }}>
                    <span className="text-2xl drop-shadow-sm">{selectedTask.emoji}</span>
                    {selectedTask.text}
                  </h2>
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke={selectedTask.color}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 34}
                          animate={{ strokeDashoffset: (2 * Math.PI * 34) * (1 - timeLeft / timerDuration) }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-mono font-bold text-white">{formatTime(timeLeft)}</span>
                        {timeLeft === 0 && <CheckCircle2 className="w-4 h-4 text-[#2ECC71] mt-0.5" />}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 w-full">
                      <button 
                        onClick={() => setIsTimerActive(!isTimerActive)}
                        disabled={timeLeft === 0}
                        className={`px-6 py-2 rounded-full font-bold text-white shadow-md transition-all active:scale-95 text-sm flex-1
                          ${isTimerActive ? 'bg-white/20 hover:bg-white/30' : 'bg-[#2ECC71] hover:bg-[#27AE60]'}
                          ${timeLeft === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {isTimerActive ? 'Pause' : 'Start'}
                      </button>
                      
                      <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/20">
                        <button 
                          onClick={() => setStars(Math.max(0, stars - 1))} 
                          className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-sm font-bold text-white shadow-sm"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-[#FDCB6E] px-1">⭐</span>
                        <button 
                          onClick={() => {
                            if (stars < maxStars) {
                              setStars(stars + 1);
                              playHooray();
                            }
                          }} 
                          disabled={stars >= maxStars}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors text-sm font-bold text-white shadow-sm border border-white/20 ${stars >= maxStars ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ backgroundColor: avatarColor }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedTask && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-sm inline-flex"
              >
                <button 
                  onClick={() => setStars(Math.max(0, stars - 1))} 
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-sm font-bold text-white"
                >
                  -
                </button>
                <span className="text-sm font-bold text-white px-2 flex items-center gap-1">
                  <span className="text-[#FDCB6E]">⭐</span> {stars} / {maxStars} Stars
                </span>
                <button 
                  onClick={() => {
                    if (stars < maxStars) {
                      setStars(stars + 1);
                      playHooray();
                    }
                  }} 
                  disabled={stars >= maxStars}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-bold text-white shadow-sm border border-white/20 ${stars >= maxStars ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: avatarColor }}
                >
                  +
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Completed Tasks */}
        <div className={`xl:col-span-${showSettings ? '3' : '4'} space-y-4`}>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-md border border-white/20 text-white">
            <h3 className="text-md font-bold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Completed
            </h3>
            <div className="space-y-2">
              {completedTasks.length === 0 && (
                <p className="text-white/50 italic text-xs">No tasks completed yet.</p>
              )}
              {completedTasks.map((task) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={task.id} 
                  className="flex items-center justify-between p-2 bg-white/5 rounded-xl group border border-white/5"
                >
                  <div className="flex items-center gap-2 line-through text-white/50">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white opacity-50 text-[10px]" style={{ backgroundColor: task.color }}>
                      {task.emoji}
                    </div>
                    <span className="text-xs font-medium">{task.text}</span>
                  </div>
                  <button
                    onClick={() => restoreTask(task)}
                    className="text-white/30 hover:text-[#2ECC71] opacity-0 group-hover:opacity-100 transition-all p-1"
                    title="Restore task"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
          

        </div>
      </div>
    </div>
  );
}
