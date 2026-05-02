import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Volume2, Send, Globe, MessageSquare, BookOpen, 
  Languages, RefreshCw, Loader2, CheckCircle2, XCircle, 
  Sparkles, Trophy, Play, Rocket, GraduationCap, ChevronDown, BrainCircuit, Wand2
} from 'lucide-react';

// سجل اللغات المدعومة
const LANGUAGES = [
  { code: 'ar-SA', name: 'العربية', voice: 'Zephyr' },
  { code: 'en-US', name: 'الإنجليزية (US)', voice: 'Kore' },
  { code: 'fr-FR', name: 'الفرنسية', voice: 'Umbriel' },
  { code: 'es-ES', name: 'الإسبانية', voice: 'Puck' },
  { code: 'ja-JP', name: 'اليابانية', voice: 'Fenrir' }
].sort((a, b) => a.name.localeCompare(b.name));

const RTL_LANGS = ['ar-SA'];

// دالة الاتصال بالخادم الخلفي (Backend)
const callBackend = async (prompt, systemInstruction, isJson = false) => {
  // ملاحظة: عند النشر، سيتم توجيه الطلبات تلقائياً إلى المسار /api/chat بفضل إعدادات vercel.json
  const API_ENDPOINT = "/api/chat"; 
  
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction, isJson })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.text;
  } catch (err) {
    console.error(err);
    return "خطأ في الاتصال بالمعلم الذكي. تأكد من إعداد مفتاح API في لوحة التحكم.";
  }
};

export default function App() {
  const [nativeLang, setNativeLang] = useState('ar-SA');
  const [targetLang, setTargetLang] = useState('en-US');
  const [activeTab, setActiveTab] = useState('chat');
  const [stats, setStats] = useState({ words: 0, streak: 1 });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col rtl" dir="rtl">
      {/* الرأس */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Globe size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">لينجو سفير</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 text-sm font-semibold">
              <Trophy size={14} className="text-amber-500" />
              <span>{stats.words} نقطة</span>
            </div>
            <div className="flex gap-4 items-center">
              <LangPicker label="لغتك" value={nativeLang} onChange={setNativeLang} />
              <LangPicker label="تعلّم" value={targetLang} onChange={setTargetLang} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        {/* القائمة الجانبية */}
        <aside className="fixed bottom-0 left-0 w-full md:relative md:w-64 bg-white md:bg-transparent border-t md:border-t-0 p-2 md:p-0 flex md:flex-col gap-2 z-40">
          <SidebarBtn active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare />} label="المعلم الذكي" />
          <SidebarBtn active={activeTab === 'translate'} onClick={() => setActiveTab('translate')} icon={<Languages />} label="المترجم الثقافي" />
          <SidebarBtn active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} icon={<BookOpen />} label="مختبر الممارسة" />
        </aside>

        {/* منطقة المحتوى */}
        <main className="flex-grow pb-20 md:pb-0">
          {activeTab === 'chat' && <ChatSection native={nativeLang} target={targetLang} />}
          {activeTab === 'translate' && <TranslateSection native={nativeLang} target={targetLang} />}
          {activeTab === 'practice' && <PracticeSection native={nativeLang} target={targetLang} onWin={() => setStats(s => ({...s, words: s.words + 10}))} />}
        </main>
      </div>
    </div>
  );
}

// --- مكونات فرعية ---

function SidebarBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex-1 md:flex-none flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'}`}>
      {icon} <span className="text-sm">{label}</span>
    </button>
  );
}

function LangPicker({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-slate-400">{label}:</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="font-bold text-indigo-600 bg-transparent outline-none cursor-pointer">
        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
      </select>
    </div>
  );
}

function ChatSection({ native, target }) {
  const [messages, setMessages] = useState([{ role: 'model', text: "مرحباً بك في لينجو سفير! أنا معلمك الخاص، كيف أساعدك اليوم؟" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const tLangName = LANGUAGES.find(l => l.code === target).name;
    const sys = `You are a helpful language tutor for ${tLangName}. Speak primarily in ${tLangName}. Correct the user's mistakes and be encouraging. Keep responses brief.`;
    
    const response = await callBackend(userMsg, sys);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm h-[calc(100vh-12rem)] flex flex-col overflow-hidden">
      <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tl-none' : 'bg-white border border-slate-100 rounded-tr-none'}`}>
              <p className="text-sm md:text-base">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-indigo-500 animate-pulse font-bold flex items-center gap-2"><Sparkles size={14}/> الذكاء الاصطناعي يفكر...</div>}
      </div>
      <div className="p-4 border-t bg-white flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-grow bg-slate-50 p-4 rounded-2xl outline-none border border-transparent focus:border-indigo-200 transition-all" placeholder="اكتب رسالتك..." />
        <button onClick={handleSend} className="p-4 bg-indigo-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-100"><Send size={20} /></button>
      </div>
    </div>
  );
}

function TranslateSection({ native, target }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!text.trim()) return setResult('');
      setLoading(true);
      const res = await callBackend(text, "Translate the text accurately. Only output the translation.");
      setResult(res);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="grid md:grid-cols-2 gap-6 h-full">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
        <span className="text-[10px] font-black uppercase text-slate-400 mb-2">النص الأصلي</span>
        <textarea value={text} onChange={e => setText(e.target.value)} className="flex-grow resize-none text-2xl font-bold outline-none placeholder:text-slate-200" placeholder="ابدأ الكتابة..." />
      </div>
      <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl text-white flex flex-col relative overflow-hidden">
        <span className="text-[10px] font-black uppercase text-indigo-200 mb-2">الترجمة الذكية</span>
        <div className="flex-grow flex items-center justify-center text-2xl font-bold text-center">
          {loading ? <Loader2 className="animate-spin" /> : result || "بانتظار النص..."}
        </div>
      </div>
    </div>
  );
}

function PracticeSection({ native, target, onWin }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm text-center px-6">
      <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        <BrainCircuit size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">مختبر التحدي اللغوي</h2>
      <p className="text-slate-500 max-w-md mb-8">هذا القسم قيد التطوير، قريباً ستتمكن من خوض تحديات استماع ونطق حية مدعومة بالذكاء الاصطناعي.</p>
      <button onClick={onWin} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
        <Rocket size={18} /> تجربة النسخة التجريبية (+10 نقاط)
      </button>
    </div>
  );
}