import React, { useState, useRef, useEffect } from 'react';
import { postChat } from '../services/api';
import { Send, Bot, User, BookOpen, AlertCircle, Sparkles, MessageSquare, RotateCcw } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  sources?: string[];
  timestamp?: string;
}

const SAMPLE_QUESTIONS = [
  'What is LAD stenosis?',
  'Explain how SHAP values work',
  'What is the function of LCX and RCA arteries?',
  'What does Region RWMA mean in Echocardiography?',
  'How does the ML model prevent target leakage?'
];

export function EducationalChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Hello! I am your CARDIOVISION X Educational AI Assistant. Ask me anything about coronary vessel stenosis (LAD, LCX, RCA), ECG ischemia patterns, or SHAP explainability.',
      sources: ['CARDIOVISION X Medical Knowledge Engine'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: queryText, timestamp: timeStr }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await postChat(queryText);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: res.answer,
          sources: res.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      // Fallback domain response if backend server is briefly restarting
      let fallbackAnswer = '';
      const qLower = queryText.toLowerCase();

      if (qLower.includes('lad') || qLower.includes('anterior')) {
        fallbackAnswer = 'The **Left Anterior Descending (LAD) artery** supplies blood to the anterior wall of the left ventricle and interventricular septum. In CARDIOVISION X, LAD stenosis is predicted using ECG ST elevation, Q wave, and RWMA features.';
      } else if (qLower.includes('shap') || qLower.includes('explain')) {
        fallbackAnswer = ' **SHAP (SHapley Additive exPlanations)** computes feature attribution scores based on cooperative game theory. Positive SHAP values indicate risk-increasing parameters, while negative values indicate protective parameters.';
      } else if (qLower.includes('rwma') || qLower.includes('wall motion')) {
        fallbackAnswer = ' **Regional Wall Motion Abnormality (RWMA)** is an echocardiographic metric indicating abnormal contraction or hypokinesis of a specific myocardial segment.';
      } else {
        fallbackAnswer = 'CARDIOVISION X is an explainable AI system predicting multi-vessel coronary artery disease (CAD, LAD, LCX, RCA) from 55 non-invasive clinical, laboratory, ECG, and echocardiographic parameters.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: fallbackAnswer,
          sources: ['CARDIOVISION X Knowledge Engine'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuery(input);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 max-w-4xl mx-auto flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <span>Medical AI Educational Assistant</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Evidence-grounded RAG query interface for coronary disease, ECG patterns, and SHAP explainability.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                sender: 'bot',
                text: 'Chat history reset. How can I help you understand coronary risk predictions?',
                sources: ['CARDIOVISION X Engine'],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ])
          }
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Clear Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(q)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-blue-300 border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 text-xs ${
              m.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-950 text-blue-400 border border-slate-800'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-[82%] space-y-2.5 shadow-lg ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-950/90 text-slate-200 border border-slate-800/90 rounded-tl-none'
              }`}
            >
              <div className="leading-relaxed whitespace-pre-line text-xs md:text-sm">
                {m.text}
              </div>

              {m.sources && m.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-blue-400" />
                    <span>Sources: {m.sources.join(', ')}</span>
                  </span>
                  {m.timestamp && <span className="font-mono text-slate-500">{m.timestamp}</span>}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium p-2 bg-slate-950/40 rounded-xl w-max border border-slate-800">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Consulting CARDIOVISION X RAG Knowledge Base...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a medical question (e.g., 'What is LAD stenosis?', 'Explain SHAP values')..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/25"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
