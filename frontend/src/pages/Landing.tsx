import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import NET from 'vanta/src/vanta.net';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  ArrowRight, PlayCircle, BarChart3, Zap, BrainCircuit, 
  MessageSquare, Lock, LineChart, PieChart, TrendingUp, CheckCircle2,
  Star, Database, Activity, Target
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(NET({
        el: vantaRef.current,
        THREE: THREE,
        color: 0x1d4ed8, // Darker blue to not overpower text
        backgroundColor: 0x020617, // Much darker background (tailwind slate-950)
        points: 15.00,
        maxDistance: 20.00,
        spacing: 15.00
      }));
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: BrainCircuit, title: "AI Dashboard Generation", desc: "Instantly create complex dashboards from natural language queries." },
    { icon: TrendingUp, title: "Predictive Forecasting", desc: "Machine learning models predict future revenue, churn, and growth." },
    { icon: Zap, title: "Real-time Anomalies", desc: "Get alerted the second your metrics deviate from expected patterns." },
    { icon: MessageSquare, title: "Conversational Data", desc: "Chat with your database like you're talking to a data scientist." },
    { icon: BarChart3, title: "Automated Insights", desc: "Daily briefs summarizing key changes in your business metrics." },
    { icon: Target, title: "Goal Tracking", desc: "Set organizational targets and let AI track the trajectory." },
    { icon: LineChart, title: "Root Cause Explorer", desc: "Click any metric drop to instantly see the underlying causes." },
    { icon: Lock, title: "Enterprise Security", desc: "Bank-grade encryption, role-based access, and SOC2 compliance." },
    { icon: Database, title: "1-Click Integrations", desc: "Connect Postgres, MySQL, Snowflake, and more in seconds." },
  ];

  return (
    <div className="min-h-screen bg-[#07101f] text-[#f8fafc] font-sans selection:bg-accent-indigo/30 overflow-x-hidden">
      
      {/* Sticky Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#07101f]/80 backdrop-blur-xl border-white/10 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Logo size="md" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors">
              Sign in
            </button>
            <button onClick={() => window.location.href="#demo"} className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl transition-all border border-white/10 flex items-center gap-2">
              <PlayCircle size={16} />
              Watch demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={vantaRef} className="relative pt-40 pb-20 min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 animate-slide-up">
          
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-6 leading-[1.1]">
            Business Intelligence <br/>
            <span className="italic font-light text-gradient">powered by AI.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Upload sales data, chat with AI, get dashboards built automatically, forecast the future, detect anomalies, and share reports — all in one platform. No SQL. No data team. No waiting.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => window.location.href="#demo"} className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold text-lg transition-all border border-white/10 flex items-center justify-center gap-2">
              <PlayCircle size={20} />
              Watch demo
            </button>
          </div>
        </div>

        {/* 3D Dashboard Mockup */}
        <div id="demo" className="relative w-full max-w-6xl mx-auto mt-20 px-6 z-10 animate-fade-in" style={{ perspective: '1000px' }}>
          <div className="w-full rounded-2xl bg-[#101828]/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden" 
               style={{ transform: 'rotateX(20deg) rotateY(-5deg) scale(0.95)', transformStyle: 'preserve-3d', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 100px -20px rgba(59, 130, 246, 0.3)' }}>
            
            {/* Mock Header */}
            <div className="h-12 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="mx-auto font-mono text-xs text-slate-500">NeuralBI · Overview · Acme Corp</div>
            </div>
            
            {/* Mock Content */}
            <div className="p-8 grid grid-cols-4 gap-6">
              {['Revenue', 'Profit', 'Churn', 'Orders'].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/5">
                  <div className="text-sm text-slate-400 mb-2">{stat}</div>
                  <div className="text-3xl font-bold font-mono">
                    {i === 0 ? '₹234L' : i === 1 ? '₹64L' : i === 2 ? '15.8%' : '4,210'}
                  </div>
                  <div className={`text-xs mt-2 ${i === 2 ? 'text-red-400' : 'text-green-400'}`}>
                    {i === 0 ? '+17%' : i === 1 ? '+8%' : i === 2 ? '+1.2pp' : '+9%'}
                  </div>
                </div>
              ))}
              
              <div className="col-span-2 bg-white/5 rounded-xl p-5 border border-white/5 h-48 flex flex-col justify-end gap-2 items-end">
                <div className="w-full flex justify-between text-xs text-slate-500 uppercase tracking-wider mb-auto">Revenue · Jan-Jul</div>
                <div className="flex items-end gap-2 w-full h-24">
                  {[40, 60, 45, 80, 75, 90, 110].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 bg-white/5 rounded-xl p-5 border border-white/5 h-48 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-mono">
                  <BrainCircuit size={14} className="text-blue-400" /> AI CHAT
                </div>
                <div className="text-sm text-white mb-2">"Why did profit drop in March?"</div>
                <div className="text-sm text-slate-400 p-3 bg-black/40 rounded-lg border border-white/5">
                  ↳ North region furniture shortage — Vendor SUP-0042 delay. <span className="text-green-400">Confidence 88%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="w-full bg-[#101828] border-y border-white/5 py-4 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#101828] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#101828] to-transparent z-10"></div>
        
        <div className="flex w-[200%] animate-marquee">
          {[1, 2].map((set) => (
            <div key={set} className="flex-1 flex justify-around items-center min-w-full gap-8 px-4 text-slate-400 font-mono text-sm uppercase tracking-wider">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Postgres</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Snowflake</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> NLP Query</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Anomaly Alerts</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Predictive</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Export PDF</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> RBAC Security</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
          <div className="text-center px-4">
            <div className="text-4xl font-display italic font-bold text-white mb-2">94%</div>
            <div className="text-sm text-slate-400">Forecast Accuracy</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl font-display italic font-bold text-white mb-2">8 min</div>
            <div className="text-sm text-slate-400">To First Insight</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl font-display italic font-bold text-white mb-2">2.4×</div>
            <div className="text-sm text-slate-400">Faster Decisions</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl font-display italic font-bold text-white mb-2">₹0</div>
            <div className="text-sm text-slate-400">SQL Knowledge Req.</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Unfair advantage, <span className="italic font-light text-slate-400">built-in.</span></h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">Every tool you need to understand your business, beautifully packaged and powered by cutting-edge AI.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-[#101828] border border-white/5 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 hover:border-white/10 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Chat Showcase */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Talk to your data.<br/><span className="italic font-light text-slate-400">It talks back.</span></h2>
            <p className="text-xl text-slate-400 mb-8 font-light leading-relaxed">
              Stop waiting weeks for a dashboard. Ask complex questions in plain English and NeuralBI instantly generates the SQL, runs it, and builds a beautiful visualization.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-blue-500" size={20}/> Understands complex business context</li>
              <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-blue-500" size={20}/> Generates transparent, verifiable SQL</li>
              <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-blue-500" size={20}/> Automatically picks the best chart type</li>
            </ul>
            <button onClick={() => navigate('/login')} className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              Try the AI Assistant
            </button>
          </div>
          
          <div className="bg-[#101828] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative">
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 rounded-2xl p-4 self-end max-w-[80%] rounded-tr-sm border border-white/5">
                <p className="text-sm">Show me the top 5 product categories by revenue in Q3, compared to Q2.</p>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-xs uppercase tracking-wider font-mono">
                <div className="h-px bg-white/10 flex-1"></div>
                NeuralBI Generating...
                <div className="h-px bg-white/10 flex-1"></div>
              </div>
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-blue-400"/>
                    <span className="text-sm font-semibold">Generated Query</span>
                  </div>
                  <span className="text-xs font-mono text-green-400 px-2 py-1 bg-green-400/10 rounded-md border border-green-400/20">98% Confidence</span>
                </div>
                <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 bg-[#0a0f18] rounded-xl border border-white/5">
<span className="text-purple-400">SELECT</span> category, <br/>
&nbsp;&nbsp;<span className="text-purple-400">SUM</span>(<span className="text-blue-300">CASE WHEN</span> quarter = <span className="text-green-300">'Q3'</span> <span className="text-blue-300">THEN</span> revenue <span className="text-blue-300">ELSE</span> 0 <span className="text-purple-400">END</span>) <span className="text-blue-300">AS</span> q3_rev,<br/>
&nbsp;&nbsp;<span className="text-purple-400">SUM</span>(<span className="text-blue-300">CASE WHEN</span> quarter = <span className="text-green-300">'Q2'</span> <span className="text-blue-300">THEN</span> revenue <span className="text-blue-300">ELSE</span> 0 <span className="text-purple-400">END</span>) <span className="text-blue-300">AS</span> q2_rev<br/>
<span className="text-purple-400">FROM</span> sales<br/>
<span className="text-purple-400">GROUP BY</span> category<br/>
<span className="text-purple-400">ORDER BY</span> q3_rev <span className="text-purple-400">DESC LIMIT</span> 5;
                </pre>
                
                <div className="mt-4 flex items-end gap-2 h-20 w-full pt-4 border-t border-white/5">
                  {[30, 45, 60, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm hover:opacity-80 transition-opacity cursor-pointer" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#07101f] border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo size="sm" />
          <div className="text-sm text-slate-600 font-mono">
            © 2026 NeuralBI Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
