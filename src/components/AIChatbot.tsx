import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Send, Loader2, Bot,
} from 'lucide-react';
import { callAI, type ChatMessage } from '@/lib/ai';

const PREMADE_QUESTIONS = [
  "How do I say no to drugs at a party?",
  "I'm feeling overwhelmed with exams",
  "Someone's pressuring me to join a gang",
  "I feel lonely and excluded",
  "Give me an escape line for drinks",
  "How to handle hazing?",
];

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    "Hey! I'm TWIST — your AI companion on NUDGEE. Ask me anything about peer pressure, stress, wellness, or campus life. I've got escape lines, advice, and zero judgment. What's up?",
};

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, scrollToBottom]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await callAI<string>('chat', { history: newMessages });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (!open) setUnread(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Hmm, I couldn't connect right now. ${errorMsg}. Try again in a sec?`,
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handlePremade = (q: string) => {
    send(q);
  };

  const resetChat = () => {
    setMessages([GREETING]);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg active:scale-90 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #F2994A, #ec4899)',
              boxShadow: '0 8px 24px rgba(242,153,74,0.35)',
            }}
            aria-label="Open AI chat"
          >
            <Bot className="h-6 w-6 text-white" />
            {unread && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-[#081B33]" />
            )}
            <motion.span
              className="absolute inset-0 rounded-2xl"
              style={{ border: '2px solid rgba(242,153,74,0.4)' }}
              animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-0 right-0 z-50 w-full sm:bottom-5 sm:right-5 sm:w-[400px] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(13,34,64,0.97)',
              border: '1px solid rgba(74,158,255,0.15)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
              height: 'min(75vh, 600px)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0 border-b"
              style={{ borderColor: 'rgba(74,158,255,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #F2994A, #ec4899)' }}
                >
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">TWIST</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      online
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40">AI Companion</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
                  title="Reset conversation"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ overscrollBehavior: 'contain' }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-br-md text-white'
                        : 'rounded-bl-md text-white/90'
                    }`}
                    style={
                      msg.role === 'user'
                        ? { background: 'linear-gradient(135deg, #F2994A, #ec4899)' }
                        : { background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.08)' }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md"
                    style={{ background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.08)' }}
                  >
                    {[0, 0.2, 0.4].map((delay) => (
                      <motion.span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full bg-blue-300"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Premade questions — only show at start */}
              {messages.length <= 1 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2"
                >
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-2">
                    Quick questions
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {PREMADE_QUESTIONS.map((q, i) => (
                      <motion.button
                        key={q}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.06 }}
                        onClick={() => handlePremade(q)}
                        className="text-left px-3 py-2 rounded-xl text-xs text-white/70 transition-all active:scale-[0.98] hover:text-white"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(74,158,255,0.08)',
                        }}
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 px-3 py-3 border-t"
              style={{ borderColor: 'rgba(74,158,255,0.1)' }}
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask TWIST anything..."
                  disabled={loading}
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none disabled:opacity-50"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(74,158,255,0.1)',
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-all active:scale-90 disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #F2994A, #ec4899)' }}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
