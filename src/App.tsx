import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  ExternalLink, 
  Clock, 
  Wallet, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  X, 
  MessageSquare, 
  ChevronDown, 
  HelpCircle, 
  PhoneCall, 
  User, 
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import Logo from "./components/Logo";

// Yandex Food Recruitment Referral Links
const PRIMARY_LINK = "https://eda.yandex.kz/partner/work/kz/kz_rus/?advertisement_campaign=forms_for_agents&user_invite_code=5bc4a0d133ee4b6d92217d36d67eefb9&utm_content=blank&utm_campaign=amir";
const BACKUP_LINK = "https://ya.cc/t/0EeLudu2ADLaLk";

export default function App() {
  // Mouse position state for spotlight effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringContainer, setIsHoveringContainer] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom cursor state
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isCursorHovering, setIsCursorHovering] = useState(false);
  const [hasMouse, setHasMouse] = useState(false);

  // Chat assistant state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    { role: 'assistant', content: 'Привет! Я виртуальный менеджер компании «Твой Выход». Готов ответить на любые ваши вопросы об оформлении, графике и заработке курьером в Яндекс Еде. Что вас интересует?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Setup global mouse listeners
  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      setHasMouse(true);
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeaveGlobal = () => {
      setHasMouse(false);
    };

    window.addEventListener("mousemove", handleMouseMoveGlobal);
    document.addEventListener("mouseleave", handleMouseLeaveGlobal);

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      document.removeEventListener("mouseleave", handleMouseLeaveGlobal);
    };
  }, []);

  // Handle local spotlight coordinate update
  const handleLocalMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

    // Send message to server-side Gemini endpoint
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsChatLoading(true);

    try {
      const formattedMessages = [
        ...chatMessages,
        { role: "user" as const, content: userMessage }
      ].map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Извините, произошла ошибка подключения. Но вы всё ещё можете зарегистрироваться и начать оформление по кнопке выше!" 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };


  // Predefined prompt helper for quick chat queries
  const handleQuickQuestion = (question: string) => {
    setChatInput(question);
    // Auto submit in next cycle
    setTimeout(() => {
      const inputForm = document.getElementById("chat-form");
      if (inputForm) inputForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 50);
  };

  // Premium stagger transition containers
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 18,
      },
    },
  };

  // Steps to start
  const steps = [
    {
      num: "01",
      title: "Онлайн-заявка",
      desc: "Нажмите на кнопку «Начать оформление» и заполните короткую анкету курьера на официальном сайте."
    },
    {
      num: "02",
      title: "Инструктаж",
      desc: "Пройдите короткое собеседование в Хабе"
    },
    {
      num: "03",
      title: "Экипировка",
      desc: "Получите стильную форму и удобную термосумку в офисе Яндекс Еда в вашем городе."
    },
    {
      num: "04",
      title: "Первый доход",
      desc: "Выходите на первую смену в выбранном районе и зарабатывайте реальные деньги с первого дня."
    }
  ];

  return (
    <div
      id="app-root"
      ref={containerRef}
      onMouseMove={handleLocalMouseMove}
      onMouseEnter={() => setIsHoveringContainer(true)}
      onMouseLeave={() => setIsHoveringContainer(false)}
      className="bg-[#FAF9F5] text-stone-900 bg-noise relative min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-white overflow-hidden"
    >
      {/* Interactive spotlight grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.85] pointer-events-none z-0" />
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 hidden md:block"
        style={{
          opacity: isHoveringContainer ? 1 : 0,
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.045) 0%, rgba(250, 249, 245, 0) 80%)`
        }}
      />

      {/* Decorative luxury ambient glow at top left and bottom right */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Custom dynamic cursor dot + ring for desktop */}
      {hasMouse && (
        <div className="hidden md:block">
          <motion.div
            className="fixed top-0 left-0 w-2 h-2 bg-black rounded-full pointer-events-none z-50 mix-blend-difference"
            animate={{
              x: cursorPos.x - 4,
              y: cursorPos.y - 4,
            }}
            transition={{ type: "spring", stiffness: 1000, damping: 50 }}
          />
          <motion.div
            className="fixed top-0 left-0 w-8 h-8 border rounded-full pointer-events-none z-50"
            style={{
              borderColor: isCursorHovering ? "#10B981" : "rgba(0, 0, 0, 0.15)",
              backgroundColor: isCursorHovering ? "rgba(16, 185, 129, 0.05)" : "transparent",
            }}
            animate={{
              x: cursorPos.x - 16,
              y: cursorPos.y - 16,
              scale: isCursorHovering ? 1.3 : 1,
            }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
          />
        </div>
      )}

      {/* Header / Navbar */}
      <header className="w-full border-b border-stone-200/50 bg-[#FAF9F5]/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 text-black" strokeWidth={4.5} />
            <div className="flex flex-col">
              <span className="font-sans text-xl font-bold tracking-tight text-black flex items-center gap-1.5 leading-none">
                Твой Выход
              </span>
              <span className="text-[10px] font-mono tracking-widest text-stone-400 mt-1 uppercase">
                Рекрутинговый Сервис
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Active recruitment indicator badge */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-stone-200/60 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#10B981] relative">
                <span className="absolute inset-0 rounded-full bg-[#10B981] animate-ping" />
              </div>
              <span className="text-xs font-medium text-stone-600 font-mono tracking-tight">
                Набор курьеров открыт • 2026
              </span>
            </div>

            {/* Official Partner Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-mono uppercase tracking-wider font-semibold shadow-md">
              <span>Yandex</span>
              <span className="text-[10px] text-[#10B981]">•</span>
              <span className="text-stone-300">Рекрутинговая кампания</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-20 z-10 flex flex-col justify-center">
        
        {/* HERO SECTION with Premium Load Animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Tagline Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 text-xs font-mono mb-6 uppercase tracking-wider shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Рекрутинговая кампания Яндекс Еды в Казахстане</span>
          </motion.div>

          {/* High-Impact Display Typography */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-black leading-[1.05] max-w-3xl"
          >
            Твой выход <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-black via-stone-800 to-stone-900 bg-clip-text text-transparent">
              на стабильный доход
            </span>
          </motion.h1>

          {/* Muted luxury subtitle description */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-stone-600 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed font-normal"
          >
            Станьте курьером-партнером и начните зарабатывать до 15 000 ₸ в день. 
            Свободный выбор смен, выплаты каждую неделю, заказы рядом с домом и поддержка на каждом этапе.
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mt-4 flex max-w-2xl items-start justify-center gap-2 text-xs leading-relaxed text-stone-500 sm:text-sm"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>Набор идёт по Астане, Алматы, Шымкент, Караганда, Актобе, Актау, Костанай, Павлодар, Атырау</span>
          </motion.p>

          {/* Single Action Point - Massive Premium Tactile Button */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 mb-6 w-full flex flex-col items-center gap-4"
          >
            <a
              href={PRIMARY_LINK}
              target="_blank"
              rel="noopener noreferrer referrer"
              onMouseEnter={() => setIsCursorHovering(true)}
              onMouseLeave={() => setIsCursorHovering(false)}
              className="group relative overflow-hidden bg-black text-white px-10 py-5.5 rounded-2xl flex items-center justify-center gap-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:bg-stone-950 transition-all duration-300 font-medium tracking-wide text-lg sm:text-xl w-full max-w-md active:scale-[0.98]"
            >
              {/* Internal subtle gradient/glow effect inside button on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <span className="relative font-bold text-white tracking-tight">Начать оформление</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="relative"
              >
                <ArrowRight className="w-5.5 h-5.5 text-emerald-400 stroke-[2.5]" />
              </motion.div>
            </a>

            {/* Micro details below the main action button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-stone-500 font-mono mt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Быстрое оформление за 15 минут
              </span>
              <span className="hidden sm:inline text-stone-300">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-custom" />
                Свободный выход на смену уже сегодня
              </span>
            </div>
          </motion.div>

          {/* Minimalist backup link alternative */}
          <motion.div 
            variants={itemVariants}
            className="text-xs text-stone-400 font-sans flex items-center justify-center gap-1.5"
          >
            <span>Возникли трудности?</span>
            <a 
              href={BACKUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setIsCursorHovering(true)}
              onMouseLeave={() => setIsCursorHovering(false)}
              className="text-stone-600 hover:text-black font-semibold underline underline-offset-2 flex items-center gap-0.5 hover:gap-1 transition-all duration-200"
            >
              Резервная ссылка регистрации <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        </motion.div>


        {/* CONNECTION TIMELINE SECTION */}
        <div className="mt-24 md:mt-32 border-t border-stone-200/50 pt-20">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-stone-400">Процесс подключения //</span>
            <h2 className="text-3xl font-bold tracking-tight text-black mt-2">4 простых шага до первой смены</h2>
            <p className="text-stone-500 text-sm sm:text-base mt-2">Всё происходит дистанционно и быстро. Никакой лишней бюрократии.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={step.num} className="relative group">
                {/* Horizontal progress connection lines for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-1/2 w-full h-[1px] bg-stone-200 group-hover:bg-emerald-200 transition-colors duration-300 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-black text-white font-mono flex items-center justify-center font-bold text-sm shadow-md group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-300">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-black mt-5 tracking-tight group-hover:text-emerald-700 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-stone-500 text-xs sm:text-sm mt-2 leading-relaxed px-2 font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* DISCLAIMER CARD - Highly polished Informational disclaimer strictly with requested text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 md:mt-32 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.015)] relative overflow-hidden"
        >
          {/* Accent thin emerald highlight line at the top */}
          <div className="absolute top-0 inset-x-0 h-1 bg-[#10B981]" />
          
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-mono uppercase tracking-wider text-stone-400 font-bold mb-3 flex items-center gap-1.5">
                Независимый статус партнера //
              </h4>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal">
                Внимание: наша кампания является независимой рекрутинговой кампанией. Мы помогаем вам пройти на процесс регистрации. После успешного подключения к платформе и выхода на первую смену, все рабочие процессы, выплаты и поддержка осуществляется напрямую через официальную службу поддержки Яндекс.
              </p>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200/50 bg-[#FAF9F5]/40 mt-12 py-8 z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" strokeWidth={5} />
            <span className="text-xs font-mono font-bold tracking-tight text-black">
              © 2026 Твой Выход • Все права защищены
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-400 font-mono">
            <span>Казахстан • Подключение курьеров</span>
            <span>Рекрутинговая кампания Яндекс Еды</span>
          </div>
        </div>
      </footer>

      {/* FLOATING AI ASSISTANT (CONVERSATIONAL RECRUITER) */}
      <div className="fixed bottom-6 right-6 z-40 font-sans">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-stone-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] w-[360px] sm:w-[400px] h-[520px] flex flex-col overflow-hidden mb-4"
            >
              {/* Chat Header */}
              <div className="bg-black text-white p-5 flex items-center justify-between border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-stone-900 rounded-xl relative border border-stone-800">
                    <Logo className="w-6 h-6 text-[#10B981]" strokeWidth={5.5} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] rounded-full border border-black animate-pulse-custom" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-white leading-none">
                      Ассистент «Твой Выход»
                    </h4>
                    <span className="text-[10px] font-mono tracking-widest text-stone-400 mt-1 uppercase block">
                      Онлайн • Отвечает мгновенно
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  onMouseEnter={() => setIsCursorHovering(true)}
                  onMouseLeave={() => setIsCursorHovering(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-900 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAF9]">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${msg.role === 'user' ? 'bg-stone-100 border border-stone-200' : 'bg-black text-white'}`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-stone-600" />
                      ) : (
                        <Logo className="w-4 h-4 text-[#10B981]" strokeWidth={6} />
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-stone-200/55 text-stone-900 rounded-tr-none border border-stone-300/30' 
                        : 'bg-white text-stone-800 border border-stone-200/70 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                    <div className="p-2 bg-black rounded-xl flex-shrink-0">
                      <Logo className="w-4 h-4 text-[#10B981]" strokeWidth={6} />
                    </div>
                    <div className="bg-white border border-stone-200/70 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <span className="text-xs text-stone-500 font-mono tracking-tight animate-pulse">Ассистент думает...</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Suggesters */}
              <div className="px-4 py-2 border-t border-stone-100 flex gap-2 overflow-x-auto bg-white scrollbar-none whitespace-nowrap">
                <button
                  onClick={() => handleQuickQuestion("Сколько платит Яндекс Еда?")}
                  className="px-3 py-1.5 border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-full text-xs text-stone-600 transition-all duration-200"
                >
                  Сколько платят?
                </button>
                <button
                  onClick={() => handleQuickQuestion("Какой график у курьеров?")}
                  className="px-3 py-1.5 border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-full text-xs text-stone-600 transition-all duration-200"
                >
                  Какой график?
                </button>
                <button
                  onClick={() => handleQuickQuestion("Можно ли совмещать с учебой?")}
                  className="px-3 py-1.5 border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-full text-xs text-stone-600 transition-all duration-200"
                >
                  Для студентов?
                </button>
              </div>

              {/* Chat Input form */}
              <form
                id="chat-form"
                onSubmit={handleSendMessage}
                className="p-4 border-t border-stone-200/80 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Задайте вопрос..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-stone-900 placeholder-stone-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  onMouseEnter={() => setIsCursorHovering(true)}
                  onMouseLeave={() => setIsCursorHovering(false)}
                  className="p-3 bg-black text-white hover:bg-stone-900 disabled:opacity-45 disabled:hover:bg-black rounded-xl transition-all duration-200 shadow-md"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setIsCursorHovering(true)}
          onMouseLeave={() => setIsCursorHovering(false)}
          className="bg-black hover:bg-stone-900 text-white p-4.5 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.2)] flex items-center justify-center border border-stone-800 transition-all duration-300 group"
        >
          {isChatOpen ? (
            <X className="w-6 h-6 text-emerald-400 group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <div className="flex items-center gap-2 px-1">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              <span className="text-xs font-bold font-mono tracking-tight pr-1 hidden sm:inline">Задать вопрос</span>
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
