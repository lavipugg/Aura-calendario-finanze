/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Heart, Coffee, Code, Sparkles, Cpu, Layers, 
  Check, Copy, User, Sun, Moon, Save, Plus, Trash2, Calendar as CalendarIcon,
  TrendingUp, TrendingDown, CreditCard, DollarSign, BookOpen, ChevronLeft, ChevronRight,
  Folder, FolderOpen, FileCode, CheckCircle, HelpCircle, Activity, PiggyBank, Briefcase
} from 'lucide-react';
import { javaProjectStructure, JavaFile, JavaFolder } from './data/javaStructure';

// Standard Interfaces
interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'ENTRATA' | 'USCITA';
  method: 'CARTA' | 'CONTANTI';
  category: string;
  notes: string;
}

interface DailyNote {
  date: string; // YYYY-MM-DD
  content: string;
  emotions?: string[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  preferredLang: string;
}

// Emotions definitions
export const EMOTIONS = [
  { id: 'felice', label: 'Felice', emoji: '😊', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'produttiva', label: 'Produttiva', emoji: '💻', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  { id: 'motivata', label: 'Motivata', emoji: '⚡', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'rilassata', label: 'Rilassata', emoji: '🧘‍♀️', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'ansiosa', label: 'Ansiosa', emoji: '😰', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'triste', label: 'Triste', emoji: '😢', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { id: 'stanca', label: 'Stanca', emoji: '😴', color: 'bg-stone-500/10 text-stone-600 dark:text-stone-450 border-stone-500/20' },
  { id: 'grata', label: 'Grata', emoji: '💖', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  { id: 'calma', label: 'Calma', emoji: '🍃', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'soddisfazione', label: 'Soddisfazione', emoji: '✨', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'sollievo', label: 'Sollievo', emoji: '😌', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  { id: 'rabbia', label: 'Rabbia', emoji: '😡', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  { id: 'paura', label: 'Paura', emoji: '😨', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'vergogna', label: 'Vergogna', emoji: '😳', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' },
  { id: 'senso_di_colpa', label: 'Senso di colpa', emoji: '😔', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  { id: 'frustrazione', label: 'Frustrazione', emoji: '😤', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  { id: 'confusione', label: 'Confusione', emoji: '😕', color: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' }
];

// Category interface
interface Category {
  id: string;
  label: string;
  color: string;
  isIncome: boolean;
}

// Categories definitions
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'STIPENDIO', label: 'Stipendio / Entrata', color: 'bg-emerald-500', isIncome: true },
  { id: 'ALCOL', label: 'Alcol', color: 'bg-red-500', isIncome: false },
  { id: 'ALTRO', label: 'Altro', color: 'bg-gray-500', isIncome: false },
  { id: 'APPLE', label: 'Apple', color: 'bg-zinc-800', isIncome: false },
  { id: 'BENZINA', label: 'Benzina', color: 'bg-blue-500', isIncome: false },
  { id: 'LIQUIDI', label: 'Liquidi', color: 'bg-cyan-500', isIncome: false },
  { id: 'REGALI', label: 'Regali', color: 'bg-pink-500', isIncome: false },
  { id: 'SHOPPING', label: 'Shopping', color: 'bg-purple-500', isIncome: false },
  { id: 'SPESA', label: 'Spesa', color: 'bg-amber-500', isIncome: false },
  { id: 'VITA', label: 'Vita', color: 'bg-teal-500', isIncome: false },
];

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lavinia_devconsole_theme');
    return saved === 'dark';
  });

  // Current active main workspace tab
  const [activeTab, setActiveTab] = useState<'app' | 'backend'>('app');

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lavinia_finance_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      id: '1',
      name: 'Lavinia',
      email: 'lavipugg@gmail.com',
      avatarUrl: '/src/assets/images/app_logo_1784475828044.jpg',
      preferredLang: 'Italiano'
    };
  });

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempEmail, setTempEmail] = useState(profile.email);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(profile.avatarUrl);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('lavinia_finance_logged_in') === 'true';
  });

  // Starting balances
  const [initialCard, setInitialCard] = useState<number>(() => {
    const saved = localStorage.getItem('lavinia_finance_initial_card');
    return saved ? parseFloat(saved) : 0;
  });

  const [initialCash, setInitialCash] = useState<number>(() => {
    const saved = localStorage.getItem('lavinia_finance_initial_cash');
    return saved ? parseFloat(saved) : 0;
  });

  const [tempInitialCard, setTempInitialCard] = useState<string>(() => {
    return localStorage.getItem('lavinia_finance_initial_card') || '0';
  });

  const [tempInitialCash, setTempInitialCash] = useState<string>(() => {
    return localStorage.getItem('lavinia_finance_initial_cash') || '0';
  });

  // App core data states
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('lavinia_finance_txs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate legacy BANCONOTA methods to CONTANTI, and legacy categories
        return parsed.map((t: any) => ({
          ...t,
          method: t.method === 'BANCONOTA' ? 'CONTANTI' : t.method,
          category: t.category === 'SPESA_ALIMENTARE' ? 'SPESA' : 
                    t.category === 'RISTORANTI' ? 'VITA' :
                    t.category === 'SVAGO' ? 'VITA' :
                    t.category === 'BOLLETTE' ? 'ALTRO' : t.category
        }));
      } catch (e) { /* ignore */ }
    }
    // Default initial transactions for demonstration
    return [
      { id: 'tx-1', date: '2026-07-15', amount: 1500, type: 'ENTRATA', method: 'CARTA', category: 'STIPENDIO', notes: 'Primo stipendio mensile' },
      { id: 'tx-2', date: '2026-07-16', amount: 45, type: 'USCITA', method: 'CARTA', category: 'BENZINA', notes: 'Rifornimento Eni' },
      { id: 'tx-3', date: '2026-07-17', amount: 15, type: 'USCITA', method: 'CONTANTI', category: 'ALCOL', notes: 'Aperitivo post-lavoro' },
      { id: 'tx-4', date: '2026-07-18', amount: 120, type: 'USCITA', method: 'CARTA', category: 'SHOPPING', notes: 'Acquisto tastiera meccanica per STS' }
    ];
  });

  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>(() => {
    const saved = localStorage.getItem('lavinia_finance_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { date: '2026-07-18', content: 'Oggi ho iniziato a strutturare l\'architettura del backend in Java 21 utilizzando STS. Ho pianificato la divisione in controller, service, repository ed entità. Super motivata!', emotions: ['produttiva', 'motivata'] }
    ];
  });

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 18)); // July 18, 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-07-18');

  // Input states for new transaction on selected day
  const [txAmount, setTxAmount] = useState<string>('');
  const [txType, setTxType] = useState<'ENTRATA' | 'USCITA'>('USCITA');
  const [txMethod, setTxMethod] = useState<'CARTA' | 'CONTANTI'>('CARTA');
  const [txCategory, setTxCategory] = useState<string>('ALTRO');
  const [txNotes, setTxNotes] = useState<string>('');

  // Dynamic categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('lavinia_finance_categories_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return DEFAULT_CATEGORIES;
  });

  // New category creation form state
  const [newCatLabel, setNewCatLabel] = useState<string>('');
  const [newCatType, setNewCatType] = useState<'ENTRATA' | 'USCITA'>('USCITA');
  const [newCatColor, setNewCatColor] = useState<string>('bg-teal-500');

  // Personal notes input state for selected day
  const [dayNotesContent, setDayNotesContent] = useState<string>('');
  const [dayEmotions, setDayEmotions] = useState<string[]>([]);

  // Java Explorer state
  const [selectedJavaFile, setSelectedJavaFile] = useState<JavaFile | null>(
    javaProjectStructure.folders?.[0].folders?.[0].folders?.[0].folders?.[0].folders?.[0].folders?.[0].files?.[1] || null // FinanceController.java by default
  );
  // Track open folders in tree
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'backend': true,
    'backend/src': true,
    'backend/src/main': true,
    'backend/src/main/java': true,
    'backend/src/main/java/com': true,
    'backend/src/main/java/com/finance': true,
    'backend/src/main/java/com/finance/controller': true,
    'backend/src/main/java/com/finance/entity': false,
    'backend/src/main/java/com/finance/enums': false,
    'backend/src/main/java/com/finance/repository': false,
    'backend/src/main/java/com/finance/dto': false,
    'backend/src/main/java/com/finance/service': false,
    'backend/src/main/java/com/finance/service/impl': false,
  });

  const [copiedCode, setCopiedCode] = useState(false);

  // Save changes to localStorage whenever states change
  useEffect(() => {
    localStorage.setItem('lavinia_devconsole_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('lavinia_finance_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('lavinia_finance_notes', JSON.stringify(dailyNotes));
  }, [dailyNotes]);

  useEffect(() => {
    localStorage.setItem('lavinia_finance_user', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('lavinia_finance_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('lavinia_finance_initial_card', initialCard.toString());
  }, [initialCard]);

  useEffect(() => {
    localStorage.setItem('lavinia_finance_initial_cash', initialCash.toString());
  }, [initialCash]);

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem('lavinia_finance_categories_v2', JSON.stringify(categories));
  }, [categories]);

  // Ensure selected transaction category is always valid
  useEffect(() => {
    const expenseCats = categories.filter(c => !c.isIncome);
    if (expenseCats.length > 0 && !expenseCats.some(c => c.id === txCategory)) {
      setTxCategory(expenseCats[0].id);
    }
  }, [categories, txCategory]);

  // Update current day note text field and emotions when selected date changes
  useEffect(() => {
    const activeNote = dailyNotes.find(n => n.date === selectedDateStr);
    setDayNotesContent(activeNote ? activeNote.content : '');
    setDayEmotions(activeNote && activeNote.emotions ? activeNote.emotions : []);
  }, [selectedDateStr, dailyNotes]);

  // Toggle Dark Mode
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setInitialCard(parseFloat(tempInitialCard) || 0);
    setInitialCash(parseFloat(tempInitialCash) || 0);
    setIsLoggedIn(true);
  };

  // Sync edit profile form fields
  useEffect(() => {
    if (isEditingProfile) {
      setTempName(profile.name);
      setTempEmail(profile.email);
      setTempAvatarUrl(profile.avatarUrl);
      setTempInitialCard(initialCard.toString());
      setTempInitialCash(initialCash.toString());
    }
  }, [isEditingProfile, profile, initialCard, initialCash]);

  // Register / Save profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: tempName,
      email: tempEmail,
      avatarUrl: tempAvatarUrl
    };
    setProfile(updated);
    setInitialCard(parseFloat(tempInitialCard) || 0);
    setInitialCash(parseFloat(tempInitialCash) || 0);
    setIsEditingProfile(false);
  };

  // Format Helper: date string from Date object
  const formatDateString = (year: number, month: number, day: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Save note and emotions for currently selected day
  const handleSaveNote = () => {
    const existingIndex = dailyNotes.findIndex(n => n.date === selectedDateStr);
    if (existingIndex >= 0) {
      const updated = [...dailyNotes];
      updated[existingIndex] = { date: selectedDateStr, content: dayNotesContent, emotions: dayEmotions };
      setDailyNotes(updated);
    } else {
      setDailyNotes([...dailyNotes, { date: selectedDateStr, content: dayNotesContent, emotions: dayEmotions }]);
    }
  };

  // Toggle emotion helper
  const handleToggleEmotion = (emotionId: string) => {
    setDayEmotions(prev => {
      if (prev.includes(emotionId)) {
        return prev.filter(id => id !== emotionId);
      } else {
        return [...prev, emotionId];
      }
    });
  };

  // Add a financial transaction to current selected day
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(txAmount);
    if (isNaN(val) || val <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: selectedDateStr,
      amount: val,
      type: txType,
      method: txMethod,
      category: txType === 'ENTRATA' ? 'STIPENDIO' : txCategory,
      notes: txNotes.trim()
    };

    setTransactions([...transactions, newTx]);
    setTxAmount('');
    setTxNotes('');
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Add a dynamic custom category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const labelUpper = newCatLabel.trim();
    const id = labelUpper.toUpperCase().replace(/\s+/g, '_');

    // Prevent duplicate keys
    if (categories.some(c => c.id === id)) {
      alert("Questa categoria esiste già!");
      return;
    }

    const newCategory: Category = {
      id,
      label: labelUpper,
      color: newCatColor,
      isIncome: newCatType === 'ENTRATA'
    };

    setCategories(prev => {
      const updated = [...prev, newCategory];
      // Keep STIPENDIO first, sort everything else alphabetically
      const stipendio = updated.find(c => c.id === 'STIPENDIO');
      const otherExpenses = updated.filter(c => c.id !== 'STIPENDIO');
      otherExpenses.sort((a, b) => a.label.localeCompare(b.label));
      return stipendio ? [stipendio, ...otherExpenses] : otherExpenses;
    });

    setNewCatLabel('');
  };

  // Delete a custom category
  const handleDeleteCategory = (catId: string) => {
    if (catId === 'STIPENDIO') return;
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Finance calculations
  const totalIncome = initialCard + initialCash + transactions.reduce((acc, t) => t.type === 'ENTRATA' ? acc + t.amount : acc, 0);
  const totalExpenses = transactions.reduce((acc, t) => t.type === 'USCITA' ? acc + t.amount : acc, 0);
  const balance = totalIncome - totalExpenses;

  // Breakdown by method
  const balanceOnCard = initialCard + transactions.reduce((acc, t) => {
    if (t.method === 'CARTA') {
      return t.type === 'ENTRATA' ? acc + t.amount : acc - t.amount;
    }
    return acc;
  }, 0);

  const balanceInCash = initialCash + transactions.reduce((acc, t) => {
    if (t.method === 'CONTANTI') {
      return t.type === 'ENTRATA' ? acc + t.amount : acc - t.amount;
    }
    return acc;
  }, 0);

  // Breakdown by category
  const expensesByCategory = categories.reduce((acc, cat) => {
    const total = transactions
      .filter(t => t.type === 'USCITA' && t.category === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    acc[cat.id] = total;
    return acc;
  }, {} as Record<string, number>);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Monthly calculations based on the currently viewed calendar month
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonthPrefix));
  
  const monthlyTotalSpent = monthlyTransactions
    .filter(t => t.type === 'USCITA')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyCashSpent = monthlyTransactions
    .filter(t => t.type === 'USCITA' && t.method === 'CONTANTI')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyCardSpent = monthlyTransactions
    .filter(t => t.type === 'USCITA' && t.method === 'CARTA')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyCategoryStats = categories.filter(c => !c.isIncome).map(cat => {
    const amount = monthlyTransactions
      .filter(t => t.type === 'USCITA' && t.category === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...cat,
      amount
    };
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Day of week (0-6)
  // Shift Sunday (0) to end of week for European visual calendar alignment (Monday-based)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  // Helper to copy code inside explorer
  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // File explorer toggle
  const toggleFolder = (path: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Render Directory Tree Node
  const renderFolderNode = (folder: JavaFolder, currentPath: string = "backend") => {
    const isFolderOpen = openFolders[currentPath];
    const nodePath = currentPath;

    return (
      <div key={folder.name} className="ml-3 select-none">
        <div 
          onClick={() => toggleFolder(nodePath)}
          className={`flex items-center gap-1.5 py-1 px-1.5 rounded-md cursor-pointer transition text-xs font-mono font-medium ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-stone-100 text-stone-700'}`}
        >
          {isFolderOpen ? (
            <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span>{folder.name}</span>
        </div>

        {isFolderOpen && (
          <div className="border-l border-stone-200 dark:border-zinc-800 ml-2.5 pl-2">
            {folder.folders?.map(f => renderFolderNode(f, `${nodePath}/${f.name}`))}
            {folder.files?.map(file => (
              <div
                key={file.name}
                onClick={() => setSelectedJavaFile(file)}
                className={`flex items-center gap-1.5 py-1 px-1.5 rounded-md cursor-pointer transition text-xs font-mono mt-0.5 ${selectedJavaFile?.path === file.path ? (isDarkMode ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'bg-amber-50 text-amber-800 font-semibold') : (isDarkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900')}`}
              >
                <FileCode className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const savedNoteForDay = dailyNotes.find(n => n.date === selectedDateStr);
  const isNotesChanged = dayNotesContent !== (savedNoteForDay?.content || '') ||
    JSON.stringify(dayEmotions) !== JSON.stringify(savedNoteForDay?.emotions || []);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#0f0f11] text-zinc-100' : 'bg-[#F3F4F6] text-stone-800'}`}>
      
      {/* HEADER NAVBAR */}
      <nav className={`h-16 border-b px-4 md:px-8 flex items-center justify-between shadow-xs z-20 transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-amber-500/20 shadow-xs shrink-0">
            <img 
              src="/src/assets/images/app_logo_1784475828044.jpg" 
              alt="Aura Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight text-sm md:text-base leading-none">Aura Calendario & Finanza</span>
          </div>
        </div>

        {isLoggedIn && (
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme selector */}
            <button 
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-amber-400 hover:text-amber-300' : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800'}`}
              title={isDarkMode ? 'Modalità Chiara' : 'Modalità Scura'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Profile trigger */}
            <div 
              onClick={() => {
                setActiveTab('app');
                setIsEditingProfile(true);
              }}
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              title="Configura Profilo"
            >
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover border border-amber-500/30 group-hover:border-amber-500 transition-colors"
              />
              <span className="text-xs font-mono font-medium hidden sm:inline-block max-w-[100px] truncate">
                {profile.name}
              </span>
            </div>
          </div>
        )}
      </nav>

      {/* LOGIN SCREEN / FIRST ONBOARDING */}
      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-md w-full rounded-2xl border p-8 shadow-md transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-3 border border-amber-500/20 shadow-md">
                <img 
                  src="/src/assets/images/app_logo_1784475828044.jpg" 
                  alt="Aura Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2.5xl font-semibold tracking-tight">Aura Calendario & Finanza</h1>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">Crea o conferma il tuo profilo per iniziare a pianificare entrate, uscite e annotare le tue giornate.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">Nome Utente</label>
                <input 
                  type="text" 
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700 focus:ring-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400 focus:ring-stone-400'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">Indirizzo Email</label>
                <input 
                  type="email" 
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700 focus:ring-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400 focus:ring-stone-400'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">Avatar URL</label>
                <input 
                  type="url" 
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700 focus:ring-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400 focus:ring-stone-400'}`}
                />
              </div>

              {/* Starting Balances */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">💳 Partenza Carta (€)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={tempInitialCard}
                    onChange={(e) => setTempInitialCard(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">💵 Partenza Contanti (€)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={tempInitialCash}
                    onChange={(e) => setTempInitialCash(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-lg bg-black text-white dark:bg-zinc-100 dark:text-black font-semibold text-sm transition hover:opacity-90 cursor-pointer"
              >
                Inizia Sviluppo & Pianificazione
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-zinc-800 text-center">
              <span className="text-[11px] font-mono text-stone-400 dark:text-zinc-500">
                Aura Calendario & Finanza • Gestione Semplice e Intuitiva
              </span>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-3 md:p-6 gap-6 min-h-0">
          
          {/* TAB 1: CALENDAR & FINANCE APPLICATION */}
          {activeTab === 'app' && (
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-w-0">
              
              {/* LEFT COLUMN: Summary Cards + Interactive Calendar Grid */}
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                
                {/* Total Balance Overview Summary Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {/* Balance Card */}
                  <div className={`p-4 rounded-xl border shadow-xs transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}>
                    <div className="flex items-center justify-between text-stone-400 dark:text-zinc-500 text-xs font-mono">
                      <span>Saldo Totale</span>
                      <PiggyBank className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <p className={`text-xl font-bold font-mono mt-1 ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {balance.toFixed(2)} €
                    </p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Entrate - Uscite</span>
                  </div>

                  {/* On Card (Carta) */}
                  <div className={`p-4 rounded-xl border shadow-xs transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}>
                    <div className="flex items-center justify-between text-stone-400 dark:text-zinc-500 text-xs font-mono">
                      <span>Su Carta</span>
                      <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className={`text-xl font-bold font-mono mt-1 ${balanceOnCard >= 0 ? (isDarkMode ? 'text-zinc-200' : 'text-stone-800') : 'text-rose-500'}`}>
                      {balanceOnCard.toFixed(2)} €
                    </p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Conto Elettronico</span>
                  </div>

                  {/* In Cash (Contante) */}
                  <div className={`p-4 rounded-xl border shadow-xs transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}>
                    <div className="flex items-center justify-between text-stone-400 dark:text-zinc-500 text-xs font-mono">
                      <span>In Contanti</span>
                      <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <p className={`text-xl font-bold font-mono mt-1 ${balanceInCash >= 0 ? (isDarkMode ? 'text-zinc-200' : 'text-stone-800') : 'text-rose-500'}`}>
                      {balanceInCash.toFixed(2)} €
                    </p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Banconote reali</span>
                  </div>

                  {/* Summary Ratio Card */}
                  <div className={`p-4 rounded-xl border shadow-xs transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}>
                    <div className="flex items-center justify-between text-stone-400 dark:text-zinc-500 text-xs font-mono">
                      <span>Spese Totali</span>
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <p className="text-xl font-bold font-mono mt-1 text-rose-500">
                      -{totalExpenses.toFixed(2)} €
                    </p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Risparmio: {totalIncome > 0 ? (((totalIncome - totalExpenses)/totalIncome)*100).toFixed(0) : '0'}%</span>
                  </div>

                </div>

                {/* CALENDAR MONTH CONTAINER */}
                <div className={`rounded-xl border shadow-xs p-5 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}>
                  
                  {/* Calendar Header Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-amber-500" />
                      <h2 className="text-base font-semibold tracking-tight font-mono uppercase">
                        {monthNames[month]} {year}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={handlePrevMonth}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleNextMonth}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid Weekdays */}
                  <div className="grid grid-cols-7 gap-1 text-center border-b border-stone-150 dark:border-zinc-800 pb-2 mb-2 text-xs font-mono text-stone-400 dark:text-zinc-500 font-semibold">
                    <span>LUN</span>
                    <span>MAR</span>
                    <span>MER</span>
                    <span>GIO</span>
                    <span>VEN</span>
                    <span>SAB</span>
                    <span>DOM</span>
                  </div>

                  {/* Calendar Days Matrix */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Empty elements before start of month */}
                    {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square bg-stone-50/50 dark:bg-zinc-950/20 rounded-lg border border-dashed border-transparent" />
                    ))}

                    {/* Month Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNumber = i + 1;
                      const dateStr = formatDateString(year, month, dayNumber);
                      const isSelected = selectedDateStr === dateStr;

                      // Calculate sums for this day
                      const dayTxs = transactions.filter(t => t.date === dateStr);
                      const dayIncome = dayTxs.filter(t => t.type === 'ENTRATA').reduce((acc, t) => acc + t.amount, 0);
                      const dayExpense = dayTxs.filter(t => t.type === 'USCITA').reduce((acc, t) => acc + t.amount, 0);
                      const dayNote = dailyNotes.find(n => n.date === dateStr);
                      const dayHasNote = dayNote && dayNote.content.trim() !== '';
                      const dayEmotionsList = dayNote && dayNote.emotions ? dayNote.emotions : [];

                      return (
                        <div
                          key={`day-${dayNumber}`}
                          onClick={() => setSelectedDateStr(dateStr)}
                          className={`aspect-square p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer relative transition-all group ${isSelected ? (isDarkMode ? 'bg-zinc-100 border-zinc-100 text-black shadow-md font-bold' : 'bg-black border-black text-white shadow-md font-bold') : (isDarkMode ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300' : 'bg-stone-50 border-stone-150 hover:bg-white hover:border-stone-300 text-stone-800')}`}
                        >
                          {/* Day number & emotions */}
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-mono">{dayNumber}</span>
                            {dayEmotionsList.length > 0 && (
                              <span className="text-xs leading-none shrink-0" title={dayEmotionsList.map(id => EMOTIONS.find(e => e.id === id)?.label).join(', ')}>
                                {dayEmotionsList.slice(0, 2).map(id => EMOTIONS.find(e => e.id === id)?.emoji).join('')}
                              </span>
                            )}
                          </div>

                          {/* Indicators for note or money */}
                          <div className="flex flex-col gap-0.5 w-full mt-1">
                            {dayIncome > 0 && (
                              <span className={`text-[9px] font-mono leading-none font-semibold text-emerald-500 truncate ${isSelected ? 'text-emerald-700' : ''}`}>
                                +{dayIncome}€
                              </span>
                            )}
                            {dayExpense > 0 && (
                              <span className={`text-[9px] font-mono leading-none font-semibold text-rose-500 truncate ${isSelected ? 'text-rose-700' : ''}`}>
                                -{dayExpense}€
                              </span>
                            )}
                          </div>

                          {/* Blue small indicator dot for diary note */}
                          {dayHasNote && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Calendar Footer Info */}
                  <div className="mt-4 pt-3 border-t border-stone-150 dark:border-zinc-800 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Nota Diario Scritta
                    </span>
                    <span>Seleziona un giorno per pianificare entrate, uscite e scrivere appunti.</span>
                  </div>

                </div>

                {/* CONSUNTIVO E STIMA FINE MESE */}
                <div className={`rounded-xl border shadow-xs p-5 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-150 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold tracking-tight font-mono uppercase flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-500" /> CONSUNTIVO FINE MESE ({monthNames[month].toUpperCase()})
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                      {year}
                    </span>
                  </div>

                  {/* Primary Totals Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                    <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-stone-400 dark:text-zinc-500 uppercase font-bold leading-tight">TOTALE SPESO</span>
                      <span className="text-xs font-bold font-mono text-red-500 block mt-1">
                        {monthlyTotalSpent.toFixed(2)} €
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-stone-400 dark:text-zinc-500 uppercase font-bold leading-tight">IN CONTANTI</span>
                      <span className="text-xs font-bold font-mono text-emerald-500 block mt-1">
                        {monthlyCashSpent.toFixed(2)} €
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-stone-400 dark:text-zinc-500 uppercase font-bold leading-tight">SU CARTA</span>
                      <span className="text-xs font-bold font-mono text-blue-500 block mt-1">
                        {monthlyCardSpent.toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <span className="block text-[10px] font-mono text-stone-400 dark:text-zinc-500 uppercase font-bold tracking-wider mb-3">
                    📈 DETTAGLIO PER CATEGORIA:
                  </span>
                  <div className="space-y-2.5">
                    {monthlyCategoryStats.map(cat => {
                      const percentage = monthlyTotalSpent > 0 ? (cat.amount / monthlyTotalSpent) * 100 : 0;

                      return (
                        <div key={cat.id} className="text-xs">
                          <div className="flex justify-between items-center mb-1 font-mono">
                            <span className="font-semibold text-stone-600 dark:text-zinc-300 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                              {cat.label}
                            </span>
                            <span className="text-stone-900 dark:text-white font-bold">
                              {cat.amount.toFixed(2)} € <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-normal">({percentage.toFixed(0)}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-stone-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DYNAMIC CATEGORIES MANAGER */}
                <div className={`rounded-xl border shadow-xs p-5 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-150 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold tracking-tight font-mono uppercase flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" /> 🛠️ Gestione Categorie
                    </h3>
                  </div>

                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 font-mono mb-3 leading-relaxed">
                    Personalizza l'elenco delle tue categorie per entrate e uscite. Si rifletterà istantaneamente nei moduli di inserimento e nei report.
                  </p>

                  {/* Category Pill List */}
                  <div className="flex flex-wrap gap-1.5 mb-4 max-h-36 overflow-y-auto pr-1">
                    {categories.map(cat => {
                      const isStipendio = cat.id === 'STIPENDIO';
                      return (
                        <div 
                          key={cat.id} 
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                            isDarkMode 
                              ? 'bg-zinc-950 border-zinc-800 text-zinc-300' 
                              : 'bg-stone-50 border-stone-200 text-stone-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                          <span className="font-medium">{cat.label}</span>
                          <span className="text-[9px] opacity-60 font-sans">
                            ({cat.isIncome ? 'Entrata' : 'Uscita'})
                          </span>
                          {!isStipendio && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="ml-1 text-stone-400 hover:text-red-500 hover:bg-red-500/10 p-0.5 rounded transition cursor-pointer"
                              title={`Elimina "${cat.label}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Create New Category Inline Form */}
                  <form onSubmit={handleAddCategory} className="space-y-3 pt-3 border-t border-dashed border-stone-150 dark:border-zinc-800">
                    <span className="block text-[10px] font-mono text-stone-400 dark:text-zinc-500 uppercase font-bold tracking-wider">
                      Nuova Categoria Personalizzata:
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Nome</label>
                        <input
                          type="text"
                          required
                          placeholder="es. Libri, Cane..."
                          value={newCatLabel}
                          onChange={(e) => setNewCatLabel(e.target.value)}
                          className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Tipo</label>
                        <select
                          value={newCatType}
                          onChange={(e) => setNewCatType(e.target.value as 'ENTRATA' | 'USCITA')}
                          className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                        >
                          <option value="USCITA">Uscita (Spesa)</option>
                          <option value="ENTRATA">Entrata (Guadagno)</option>
                        </select>
                      </div>
                    </div>

                    {/* Beautiful circle color options selector */}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1.5 font-mono">Colore Icona</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'bg-red-500', 'bg-emerald-500', 'bg-blue-500', 
                          'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 
                          'bg-cyan-500', 'bg-teal-500', 'bg-indigo-500', 
                          'bg-orange-500', 'bg-gray-500', 'bg-zinc-800'
                        ].map(col => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setNewCatColor(col)}
                            className={`w-5 h-5 rounded-full ${col} transition-transform relative cursor-pointer hover:scale-110 flex items-center justify-center`}
                            title={col.replace('bg-', '')}
                          >
                            {newCatColor === col && (
                              <Check className="w-3 h-3 text-white drop-shadow-xs font-bold" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-black text-white dark:bg-zinc-100 dark:text-black font-semibold transition hover:opacity-90 cursor-pointer text-center text-xs flex items-center justify-center gap-1 font-mono"
                    >
                      <Plus className="w-3.5 h-3.5" /> Salva Categoria
                    </button>
                  </form>
                </div>

              </div>

              {/* RIGHT COLUMN: Day Planner Drawer (Diary + Finance Transactions Manager) */}
              <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
                
                {/* Profile Editor Modal Overlay Trigger inside app */}
                {isEditingProfile ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-xl border p-5 shadow-xs transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-stone-150 dark:border-zinc-800 mb-4">
                      <h3 className="text-sm font-mono font-bold uppercase">Profilo di {profile.name}</h3>
                      <button onClick={() => setIsEditingProfile(false)} className="text-xs text-stone-400 hover:text-black dark:hover:text-white">Chiudi</button>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
                      <div>
                        <label className="block text-gray-400 uppercase mb-1">Nome Utente</label>
                        <input 
                          type="text" 
                          required
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 uppercase mb-1">Email</label>
                        <input 
                          type="email" 
                          required
                          value={tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 uppercase mb-1">Immagine Profilo URL</label>
                        <input 
                          type="url" 
                          value={tempAvatarUrl}
                          onChange={(e) => setTempAvatarUrl(e.target.value)}
                          className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-gray-400 uppercase mb-1">💳 Partenza Carta (€)</label>
                          <input 
                            type="number" 
                            step="any"
                            value={tempInitialCard}
                            onChange={(e) => setTempInitialCard(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 uppercase mb-1">💵 Partenza Contanti (€)</label>
                          <input 
                            type="number" 
                            step="any"
                            value={tempInitialCash}
                            onChange={(e) => setTempInitialCash(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-emerald-600 text-white font-bold transition hover:opacity-90 cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" /> Salva Profilo
                      </button>
                    </form>
                  </motion.div>
                ) : null}

                {/* SELECTED DAY PANEL */}
                <div className={`rounded-xl border shadow-xs p-5 flex flex-col transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}>
                  
                  {/* Selected Date Header Banner */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-150 dark:border-zinc-800 mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-amber-500 uppercase font-bold tracking-wider">PIANIFICAZIONE GIORNALIERA</span>
                      <span className="text-sm font-bold font-mono text-stone-900 dark:text-white mt-0.5">
                        {selectedDateStr}
                      </span>
                    </div>
                    <span className="text-xs font-mono bg-stone-100 dark:bg-zinc-800 text-stone-500 px-2 py-0.5 rounded-full">
                      {transactions.filter(t => t.date === selectedDateStr).length} Transazioni
                    </span>
                  </div>

                  {/* 1. JOURNAL DIARY NOTES & EMOTIONS FOR THE DAY */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
                        ✍️ Note Personali & Emozioni
                      </label>
                      {isNotesChanged && (
                        <button
                          onClick={handleSaveNote}
                          className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded font-mono font-medium flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Save className="w-3 h-3" /> Salva Modifiche
                        </button>
                      )}
                    </div>

                    {/* Selectable Emotions Section */}
                    <div className="mb-3">
                      <span className="block text-[10px] text-gray-400 uppercase font-mono mb-1.5 font-bold">EMOZIONI DEL GIORNO:</span>
                      <div className="flex flex-wrap gap-1">
                        {EMOTIONS.map(emotion => {
                          const isSelected = dayEmotions.includes(emotion.id);
                           return (
                             <button
                               key={emotion.id}
                               type="button"
                               onClick={() => handleToggleEmotion(emotion.id)}
                               className={`px-2 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                                 isSelected
                                   ? 'bg-blue-500/10 text-blue-500 border-blue-500/40 font-bold scale-[1.02]'
                                   : isDarkMode
                                     ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                                     : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                               }`}
                               title={emotion.label}
                             >
                               <span>{emotion.emoji}</span>
                               <span className="text-[10px]">{emotion.label}</span>
                             </button>
                           );
                         })}
                       </div>
                     </div>

                    <textarea
                      value={dayNotesContent}
                      onChange={(e) => setDayNotesContent(e.target.value)}
                      placeholder="Scrivi qui i tuoi pensieri personali o note sulla giornata..."
                      rows={3}
                      className={`w-full rounded-lg p-3 text-xs transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400 focus:ring-stone-400'}`}
                    />
                  </div>

                  {/* 2. TRANSACTIONS LIST FOR TODAY */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono mb-2">
                      💸 Entrate & Uscite del Giorno
                    </label>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {transactions.filter(t => t.date === selectedDateStr).length === 0 ? (
                        <div className="p-3 text-center text-xs font-mono text-gray-400 dark:text-zinc-500 bg-stone-50 dark:bg-zinc-950/40 rounded-lg border border-dashed border-stone-200 dark:border-zinc-800">
                          Nessun movimento registrato.
                        </div>
                      ) : (
                        transactions.filter(t => t.date === selectedDateStr).map(tx => {
                          const catInfo = categories.find(c => c.id === tx.category);
                          return (
                            <div 
                              key={tx.id} 
                              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono transition-colors ${isDarkMode ? 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900' : 'bg-white border-stone-150 hover:bg-stone-50'}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-1.5 h-7 rounded-full shrink-0 ${tx.type === 'ENTRATA' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-stone-900 dark:text-white truncate">
                                      {tx.notes || catInfo?.label}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans border shrink-0 ${tx.method === 'CARTA' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                      {tx.method === 'CARTA' ? '💳 CARTA' : '💵 CONTANTI'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-400 block truncate">{catInfo?.label}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className={`font-bold ${tx.type === 'ENTRATA' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {tx.type === 'ENTRATA' ? '+' : '-'}{tx.amount.toFixed(2)} €
                                </span>
                                <button 
                                  onClick={() => handleDeleteTransaction(tx.id)}
                                  className="p-1 rounded text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                                  title="Rimuovi"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* 3. ADD TRANSACTION QUICK FORM */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-stone-50 border-stone-150'}`}>
                    <span className="block text-xs font-mono font-bold uppercase mb-3 text-stone-500 dark:text-zinc-400">
                      ➕ Aggiungi Movimento
                    </span>

                    <form onSubmit={handleAddTransaction} className="space-y-3.5 text-xs font-mono">
                      
                      {/* Amount and Type Switch */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Importo (€)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={txAmount}
                            onChange={(e) => setTxAmount(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-800'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Tipo</label>
                          <select
                            value={txType}
                            onChange={(e) => setTxType(e.target.value as 'ENTRATA' | 'USCITA')}
                            className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-800'}`}
                          >
                            <option value="USCITA">Uscita (Spesa)</option>
                            <option value="ENTRATA">Entrata (Guadagno)</option>
                          </select>
                        </div>
                      </div>

                      {/* Payment Method and Category */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Metodo</label>
                          <select
                            value={txMethod}
                            onChange={(e) => setTxMethod(e.target.value as 'CARTA' | 'CONTANTI')}
                            className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-800'}`}
                          >
                            <option value="CARTA">💳 Carta</option>
                            <option value="CONTANTI">💵 Contanti</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Categoria</label>
                          <select
                            value={txCategory}
                            onChange={(e) => setTxCategory(e.target.value)}
                            disabled={txType === 'ENTRATA'}
                            className={`w-full p-2 rounded-lg border text-xs focus:outline-none disabled:opacity-50 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-800'}`}
                          >
                            {categories.filter(c => !c.isIncome).map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Notes description */}
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Note / Causale</label>
                        <input
                          type="text"
                          placeholder="es. Benzina Eni, Spesa Lidl..."
                          value={txNotes}
                          onChange={(e) => setTxNotes(e.target.value)}
                          className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-800'}`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-black text-white dark:bg-zinc-100 dark:text-black font-semibold transition hover:opacity-90 cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Registra Movimento
                      </button>

                    </form>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SPRING BOOT CODE EXPLORER & PROJECT STRUCT */}
          {activeTab === 'backend' && (
            <div className="flex-1 flex flex-col md:flex-row gap-6 min-w-0">
              
              {/* FILE EXPLORER SIDEBAR */}
              <div className={`w-full md:w-72 rounded-xl border p-4 flex flex-col shrink-0 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}>
                <div className="pb-3 border-b border-stone-150 dark:border-zinc-800 mb-4">
                  <span className="text-[10px] font-mono text-amber-500 uppercase font-bold tracking-wider block">PROGETTO BACKEND</span>
                  <span className="text-xs text-stone-500 dark:text-zinc-400 font-mono block mt-0.5">Struttura per STS / VSCode</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  {renderFolderNode(javaProjectStructure)}
                </div>

                <div className="pt-3 border-t border-stone-150 dark:border-zinc-800 text-[10px] font-mono text-stone-400 dark:text-zinc-500 leading-normal space-y-1">
                  <p>💡 <strong>Note per Lavinia:</strong></p>
                  <p>Questa è la struttura classica a pacchetti standard raccomandata a livello enterprise per progetti Spring Boot in Java 21.</p>
                </div>
              </div>

              {/* CODE DISPLAY WINDOW */}
              <div className="flex-1 flex flex-col min-w-0">
                {selectedJavaFile ? (
                  <div className={`flex-1 flex flex-col rounded-xl border overflow-hidden shadow-xs transition-colors ${isDarkMode ? 'bg-zinc-950 border-zinc-850' : 'bg-[#1e1e1e] border-stone-900'}`}>
                    
                    {/* Top bar */}
                    <div className="h-11 bg-[#181818] border-b border-[#252525] px-4 flex items-center justify-between text-xs font-mono shrink-0">
                      <div className="flex items-center gap-2 text-zinc-400 truncate">
                        <FileCode className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-semibold text-zinc-200 truncate">{selectedJavaFile.name}</span>
                        <span className="text-[10px] text-zinc-600 hidden sm:inline">{selectedJavaFile.path}</span>
                      </div>

                      <button
                        onClick={() => copyCodeToClipboard(selectedJavaFile.code)}
                        className="px-2.5 py-1 rounded bg-[#2a2a2a] hover:bg-[#353535] text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copiato!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copia Codice</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pre Code Viewer */}
                    <div className="flex-1 overflow-auto p-4 md:p-6 text-xs md:text-sm font-mono text-zinc-200 leading-relaxed selection:bg-zinc-800 selection:text-white">
                      <pre className="whitespace-pre">
                        <code>{selectedJavaFile.code}</code>
                      </pre>
                    </div>

                    {/* Highlighted Java 21 Tip Panel at the bottom */}
                    <div className="bg-[#141414] border-t border-[#252525] p-3.5 text-xs text-zinc-400 font-mono flex items-start gap-2.5 shrink-0">
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold tracking-wider shrink-0 mt-0.5">Java 21</span>
                      <p className="leading-normal text-[11px]">
                        {selectedJavaFile.name.endsWith('Dto.java') 
                          ? "Utilizziamo i Record introdotti stabilmente per dichiarare DTO compatti, immutabili e thread-safe senza Boilerplate code."
                          : selectedJavaFile.name.includes('Service') 
                          ? "Usa le Sequenced Collections di Java 21 (es. .toList() diretto) per una gestione più chiara degli ordini di inserimento."
                          : "Compatibile al 100% con Spring Boot 3.x, Hibernate 6.x e la specifica Jakarta Persistence (JPA)."}
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 rounded-xl border border-dashed border-stone-300 dark:border-zinc-800 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                    <Terminal className="w-10 h-10 text-stone-300 mb-2" />
                    <p className="text-sm font-mono">Seleziona un file Java a sinistra per aprirlo ed esaminarne il codice sorgente ordinato.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* FOOTER */}
      <footer className={`py-4 px-6 md:px-8 border-t text-center text-[11px] font-mono tracking-widest transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
        <span>AURA CALENDARIO & FINANZA</span>
      </footer>

    </div>
  );
}
