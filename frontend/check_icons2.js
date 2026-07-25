import * as lucide from 'lucide-react';

const allImports = [
  "MessageSquare", "CheckSquare", "Send", "UserIcon", "X", "Check", "Clock",
  "Bot", "Sparkles", "Loader2",
  "Database", "Terminal", "ShieldCheck",
  "History", "Play", "Pause",
  "Building2", "Users", "Activity", "Server",
  "AlertTriangle", "ShieldAlert", "GitCommit", "Search", "CalendarDays",
  "LayoutDashboard", "PinOff", "Download", "FileText", "Info", "Presentation", "Lightbulb", "Plus", "BarChart2",
  "User", "Pin",
  "UploadCloud", "FileSpreadsheet", "CheckCircle2", "BrainCircuit", "TrendingUp", "Globe", "Table2", "HardDrive",
  "ChevronLeft", "ChevronRight", "Square",
  "BookOpen", "CheckCircle", "AlertCircle",
  "Target", "Calendar",
  "Store", "ThumbsUp", "Copy",
  "Mail", "Lock", "ArrowRight",
  "Shield",
  "LineChart",
  "GitMerge", "ChevronDown", "Network",
  "XCircle"
];

const missing = allImports.filter(icon => icon !== "UserIcon" && !lucide[icon]);

console.log("Missing Icons across all files:", missing);
