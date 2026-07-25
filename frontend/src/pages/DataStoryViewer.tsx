import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ChartRenderer from '../components/ChartRenderer';
import { ChevronLeft, ChevronRight, Loader2, Presentation, Play, Square, X } from 'lucide-react';

const DataStoryViewer = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [widgetsData, setWidgetsData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const fetchStoryAndWidgets = async () => {
      try {
        const storyRes = await axios.get('http://localhost:8080/api/v1/reports/story/web');
        const slidesData = storyRes.data;
        setSlides(slidesData);

        const widgetsRes = await axios.get('http://localhost:8080/api/v1/dashboard/widgets');
        const widgetsMap: Record<string, any> = {};
        widgetsRes.data.forEach((w: any) => {
          widgetsMap[w.id] = { config: JSON.parse(w.chartConfig), data: w.cachedData ? JSON.parse(w.cachedData) : [] };
        });
        setWidgetsData(widgetsMap);
      } catch (err) {
        console.error("Failed to load data story", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStoryAndWidgets();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && slides.length > 0) {
      interval = setInterval(() => {
        setCurrentSlideIndex(prev => {
          if (prev < slides.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 5000); // 5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center text-muted gap-4">
        <Loader2 size={48} className="animate-spin text-indigo-500" />
        <p className="text-xl">AI is generating your Data Story...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center text-muted gap-4">
        <Presentation size={64} className="text-slate-700" />
        <p className="text-xl">No dashboard widgets available for a story.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-2 bg-accent-indigo text-main rounded-xl">Return to Dashboard</button>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];
  const widgetInfo = widgetsData[currentSlide?.widgetId];

  return (
    <div className="fixed inset-0 bg-surface z-50 flex flex-col animate-fade-in text-main">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 bg-surface/50 border-b border-border-theme">
        <div className="flex items-center gap-3">
          <Presentation className="text-accent-indigo" />
          <h1 className="text-xl font-bold">Data Story Mode</h1>
          <span className="text-muted ml-4">Slide {currentSlideIndex + 1} of {slides.length}</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-muted hover:text-main bg-surface-hover p-2 rounded-2xl transition">
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chart */}
        <div className="flex-[2] p-12 flex flex-col items-center justify-center bg-surface/20 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
          <div className="w-full h-full max-w-5xl bg-surface border border-border-theme rounded-2xl shadow-[0_4px_20px_rgba(79,70,229,0.15)] p-8 flex flex-col z-10">
            <h2 className="text-3xl font-bold mb-8 text-center">{currentSlide.title}</h2>
            <div className="flex-1 w-full relative">
              {widgetInfo && widgetInfo.data.length > 0 ? (
                <ChartRenderer config={widgetInfo.config} data={widgetInfo.data} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted">No data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Teleprompter / AI Script */}
        <div className="flex-1 bg-surface border-l border-border-theme p-12 flex flex-col">
          <div className="mb-6 uppercase tracking-widest text-sm font-semibold text-accent-indigo">AI Presenter Script</div>
          <div className="flex-1 overflow-y-auto">
            <p className="text-3xl leading-relaxed text-main font-light">
              "{currentSlide.script}"
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 bg-surface/50 border-t border-border-theme flex justify-center items-center gap-6">
        <button 
          onClick={() => setCurrentSlideIndex(p => Math.max(0, p - 1))}
          disabled={currentSlideIndex === 0}
          className="text-main disabled:opacity-30 hover:bg-surface-hover p-3 rounded-full transition"
        >
          <ChevronLeft size={32} />
        </button>
        
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-accent-indigo hover:bg-accent-indigo text-main p-4 rounded-full transition shadow-[0_4px_20px_rgba(79,70,229,0.15)] shadow-accent-indigo/20"
        >
          {isPlaying ? <Square size={24} /> : <Play size={24} className="ml-1" />}
        </button>

        <button 
          onClick={() => setCurrentSlideIndex(p => Math.min(slides.length - 1, p + 1))}
          disabled={currentSlideIndex === slides.length - 1}
          className="text-main disabled:opacity-30 hover:bg-surface-hover p-3 rounded-full transition"
        >
          <ChevronRight size={32} />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-accent-indigo transition-all duration-300" style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }} />
    </div>
  );
};

export default DataStoryViewer;
