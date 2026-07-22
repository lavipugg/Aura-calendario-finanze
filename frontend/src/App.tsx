import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, Heart, Coffee, Code, Sparkles, Cpu, Layers, 
  Check, Copy, User, Sun, Moon, Save, Plus, Trash2, Calendar as CalendarIcon,
  TrendingUp, TrendingDown, CreditCard, DollarSign, BookOpen, ChevronLeft, ChevronRight,
  Folder, FolderOpen, FileCode, CheckCircle, HelpCircle, Activity, PiggyBank, Briefcase, LogOut, Wifi, Cloud
} from 'lucide-react';
import { javaProjectStructure, JavaFile, JavaFolder } from './data/javaStructure';
import { collection, doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

// Standard Interfaces
interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  method: 'CARTA' | 'CONTANTI';
  category: string;
  notes: string;
}

interface DailyNote {
  date: string; // YYYY-MM-DD
  content: string;
  emotions: string[];
}

interface UserProfile {
  id: string;
  name: string;
  password?: string;
  email?: string;
  avatarUrl: string;
  preferredLang: string;
}

interface Category {
  id: string;
  label: string;
  color: string; // Tailwind color class or hex string
  isIncome: boolean;
}

// Preset Categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'STIPENDIO', label: 'Stipendio / Entrate', color: 'emerald', isIncome: true },
  { id: 'SPESA', label: 'Spesa Alimentare', color: 'indigo', isIncome: false },
  { id: 'VITA', label: 'Vita Sociale & Svago', color: 'purple', isIncome: false },
  { id: 'ALTRO', label: 'Altre Uscite', color: 'amber', isIncome: false }
];

// Presets for Avatar Picker
const AVATAR_PRESETS = ['😊', '👩‍💻', '☕', '🌸', '✨', '💻', '🎨', '🚀'];

// Preset Colors for Custom Categories
const CATEGORY_COLOR_PRESETS = [
  { label: 'Viola', value: 'purple' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Azzurro', value: 'cyan' },
  { label: 'Verde', value: 'teal' },
  { label: 'Arancione', value: 'orange' },
  { label: 'Rosso', value: 'rose' }
];

// Emotion Badges
const EMOTIONS = [
  { label: 'Produttiva', icon: '🚀' },
  { label: 'Serena', icon: '🍃' },
  { label: 'Stanca', icon: '😴' },
  { label: 'Ispirata', icon: '💡' },
  { label: 'Focalizzata', icon: '🎯' }
];

export function App() {
  // Application / Development Console Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lavinia_devconsole_theme');
    return saved ? saved === 'dark' : true;
  });

  // Current active main workspace tab
  const [activeTab, setActiveTab] = useState<'app' | 'backend'>('app');

  // Active user ID for Firestore data isolation
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    return localStorage.getItem('lavinia_active_user_id') || '';
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lavinia_finance_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed;
      } catch (e) { /* ignore */ }
    }
    return {
      id: '',
      name: '',
      password: '',
      email: '',
      avatarUrl: '😊',
      preferredLang: 'Italiano'
    };
  });

  // Editing profile fields
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempPassword, setTempPassword] = useState(profile.password || '');
  const [tempEmail, setTempEmail] = useState(profile.email || '');
  const [tempAvatarUrl, setTempAvatarUrl] = useState(profile.avatarUrl);

  // Auth screen state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authAvatarUrl, setAuthAvatarUrl] = useState('😊');
  const [authInitialCard, setAuthInitialCard] = useState('0');
  const [authInitialCash, setAuthInitialCash] = useState('0');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('lavinia_finance_logged_in') === 'true' && !!localStorage.getItem('lavinia_active_user_id');
  });

  // Starting balances
  const [initialCard, setInitialCard] = useState<number>(0);
  const [initialCash, setInitialCash] = useState<number>(0);
  const [tempInitialCard, setTempInitialCard] = useState<string>('0');
  const [tempInitialCash, setTempInitialCash] = useState<string>('0');

  // App core data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Transaction form states
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [txMethod, setTxMethod] = useState<'CARTA' | 'CONTANTI'>('CARTA');
  const [txCategory, setTxCategory] = useState<string>('SPESA');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txNotes, setTxNotes] = useState<string>('');

  // Dynamic categories state
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // New category creation form state
  const [newCatLabel, setNewCatLabel] = useState<string>('');
  const [newCatColor, setNewCatColor] = useState<string>('purple');

  // Daily note form state
  const [dayNotesContent, setDayNotesContent] = useState<string>('');
  const [dayEmotions, setDayEmotions] = useState<string[]>([]);

  // Java Backend Project Explorer State
  const [selectedJavaFile, setSelectedJavaFile] = useState<JavaFile>(
    javaProjectStructure[0].children?.[0]?.children?.[0] as JavaFile
  );
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'src/main': true,
    'src/main/java': true,
    'src/main/java/com/aura/finance': true,
    'src/main/java/com/aura/finance/controller': true,
    'src/main/java/com/aura/finance/model': true,
    'src/main/java/com/aura/finance/repository': true,
    'src/main/java/com/aura/finance/service': true,
  });

  const [copiedCode, setCopiedCode] = useState(false);

  // Theme effect
  useEffect(() => {
    localStorage.setItem('lavinia_devconsole_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Real-time Cloud Sync per Active User across PC & Mobile
  useEffect(() => {
    if (!isLoggedIn || !activeUserId) return;

    // 1. Real-time Transactions Listener
    const unsubTxs = onSnapshot(collection(db, 'users', activeUserId, 'transactions'), (snapshot) => {
      const txList: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        txList.push(docSnap.data() as Transaction);
      });
      setTransactions(txList);
    }, (err) => console.error('Firestore Txs Sync:', err));

    // 2. Real-time Daily Notes Listener
    const unsubNotes = onSnapshot(collection(db, 'users', activeUserId, 'dailyNotes'), (snapshot) => {
      const notesList: DailyNote[] = [];
      snapshot.forEach((docSnap) => {
        notesList.push(docSnap.data() as DailyNote);
      });
      setDailyNotes(notesList);
    }, (err) => console.error('Firestore Notes Sync:', err));

    // 3. Real-time Categories Listener
    const unsubCats = onSnapshot(collection(db, 'users', activeUserId, 'categories'), (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_CATEGORIES.forEach(cat => {
          setDoc(doc(db, 'users', activeUserId, 'categories', cat.id), cat).catch(console.error);
        });
      } else {
        const catList: Category[] = [];
        snapshot.forEach((docSnap) => {
          catList.push(docSnap.data() as Category);
        });
        const stipendio = catList.find(c => c.id === 'STIPENDIO');
        const otherExpenses = catList.filter(c => c.id !== 'STIPENDIO');
        otherExpenses.sort((a, b) => a.label.localeCompare(b.label));
        setCategories(stipendio ? [stipendio, ...otherExpenses] : otherExpenses);
      }
    }, (err) => console.error('Firestore Cats Sync:', err));

    // 4. Real-time Profile & Starting Balances Listener
    const unsubProfile = onSnapshot(doc(db, 'users', activeUserId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          id: activeUserId,
          name: data.name || activeUserId,
          password: data.password || '',
          email: data.email || '',
          avatarUrl: data.avatarUrl || '😊',
          preferredLang: 'Italiano'
        });
        if (typeof data.initialCard === 'number') {
          setInitialCard(data.initialCard);
          setTempInitialCard(data.initialCard.toString());
        }
        if (typeof data.initialCash === 'number') {
          setInitialCash(data.initialCash);
          setTempInitialCash(data.initialCash.toString());
        }
      }
    }, (err) => console.error('Firestore Profile Sync:', err));

    return () => {
      unsubTxs();
      unsubNotes();
      unsubCats();
      unsubProfile();
    };
  }, [isLoggedIn, activeUserId]);

  // Ensure selected transaction category is always valid
  useEffect(() => {
    const expenseCats = categories.filter(c => !c.isIncome);
    if (txType === 'EXPENSE' && expenseCats.length > 0) {
      if (!expenseCats.some(c => c.id === txCategory)) {
        setTxCategory(expenseCats[0].id);
      }
    } else if (txType === 'INCOME') {
      setTxCategory('STIPENDIO');
    }
  }, [txType, categories, txCategory]);

  // Toggle Theme Function
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Register new user handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('Inserisci nome utente e password.');
      return;
    }

    const uid = authUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    setAuthLoading(true);

    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setAuthError(`Il nome utente "${authUsername.trim()}" è già registrato! Passa a "Accedi" per entrare o scegli un altro nome.`);
        setAuthLoading(false);
        return;
      }

      const cardVal = parseFloat(authInitialCard) || 0;
      const cashVal = parseFloat(authInitialCash) || 0;
      const userData = {
        id: uid,
        name: authUsername.trim(),
        password: authPassword.trim(),
        avatarUrl: authAvatarUrl || '😊',
        initialCard: cardVal,
        initialCash: cashVal,
        createdAt: new Date().toISOString()
      };

      await setDoc(userRef, userData);

      // Seed categories for new user
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'users', uid, 'categories', cat.id), cat);
      }

      setActiveUserId(uid);
      setProfile({
        id: uid,
        name: authUsername.trim(),
        password: authPassword.trim(),
        avatarUrl: authAvatarUrl || '😊',
        preferredLang: 'Italiano'
      });
      setInitialCard(cardVal);
      setInitialCash(cashVal);
      setIsLoggedIn(true);

      localStorage.setItem('lavinia_active_user_id', uid);
      localStorage.setItem('lavinia_finance_logged_in', 'true');
    } catch (err) {
      console.error('Register error:', err);
      setAuthError('Errore durante la registrazione. Verificare la connessione.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Login existing user handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('Inserisci nome utente e password.');
      return;
    }

    const uid = authUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    setAuthLoading(true);

    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setAuthError(`Utente "${authUsername.trim()}" non trovato! Verifica il nome utente o passa a "Registrati".`);
        setAuthLoading(false);
        return;
      }

      const userData = userSnap.data();
      if (userData.password && userData.password !== authPassword.trim()) {
        setAuthError('Password errata! Verifica la password e riprova.');
        setAuthLoading(false);
        return;
      }

      const cardVal = userData.initialCard || 0;
      const cashVal = userData.initialCash || 0;

      setActiveUserId(uid);
      setProfile({
        id: uid,
        name: userData.name || authUsername.trim(),
        password: userData.password || '',
        avatarUrl: userData.avatarUrl || '😊',
        preferredLang: 'Italiano'
      });
      setInitialCard(cardVal);
      setInitialCash(cashVal);
      setIsLoggedIn(true);

      localStorage.setItem('lavinia_active_user_id', uid);
      localStorage.setItem('lavinia_finance_logged_in', 'true');
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('Errore durante l\'accesso. Verificare la connessione.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick Demo Access (Lavinia)
  const handleQuickDemoLavinia = async () => {
    setAuthError(null);
    setAuthLoading(true);
    const uid = 'lavinia';

    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      let cardVal = 500;
      let cashVal = 100;
      let laviniaProfile = {
        id: uid,
        name: 'Lavinia',
        password: 'password123',
        avatarUrl: '😊',
        preferredLang: 'Italiano'
      };

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          ...laviniaProfile,
          initialCard: cardVal,
          initialCash: cashVal,
          createdAt: new Date().toISOString()
        });
        for (const cat of DEFAULT_CATEGORIES) {
          await setDoc(doc(db, 'users', uid, 'categories', cat.id), cat);
        }
      } else {
        const data = userSnap.data();
        cardVal = data.initialCard ?? 500;
        cashVal = data.initialCash ?? 100;
        laviniaProfile.name = data.name || 'Lavinia';
        laviniaProfile.avatarUrl = data.avatarUrl || '😊';
      }

      setActiveUserId(uid);
      setProfile(laviniaProfile);
      setInitialCard(cardVal);
      setInitialCash(cashVal);
      setIsLoggedIn(true);

      localStorage.setItem('lavinia_active_user_id', uid);
      localStorage.setItem('lavinia_finance_logged_in', 'true');
    } catch (err) {
      console.error('Demo error:', err);
      setAuthError('Errore durante l\'accesso rapido demo.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveUserId('');
    setIsEditingProfile(false);
    localStorage.removeItem('lavinia_active_user_id');
    localStorage.setItem('lavinia_finance_logged_in', 'false');
    setTransactions([]);
    setDailyNotes([]);
    setCategories(DEFAULT_CATEGORIES);
    setAuthTab('login');
  };

  // Sync edit profile form fields
  useEffect(() => {
    if (isEditingProfile) {
      setTempName(profile.name);
      setTempPassword(profile.password || '');
      setTempEmail(profile.email || '');
      setTempAvatarUrl(profile.avatarUrl);
      setTempInitialCard(initialCard.toString());
      setTempInitialCash(initialCash.toString());
    }
  }, [isEditingProfile, profile, initialCard, initialCash]);

  // Save updated profile to Firestore
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserId) return;

    const updated = {
      ...profile,
      name: tempName,
      password: tempPassword,
      email: tempEmail,
      avatarUrl: tempAvatarUrl
    };
    const cardVal = parseFloat(tempInitialCard) || 0;
    const cashVal = parseFloat(tempInitialCash) || 0;
    setProfile(updated);
    setInitialCard(cardVal);
    setInitialCash(cashVal);
    setIsEditingProfile(false);

    // Sync to Cloud under active user doc
    setDoc(doc(db, 'users', activeUserId), {
      name: tempName,
      password: tempPassword,
      email: tempEmail,
      avatarUrl: tempAvatarUrl,
      initialCard: cardVal,
      initialCash: cashVal
    }, { merge: true }).catch(console.error);
  };

  // Format Helper: date string from Date object
  const formatDateStr = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const selectedDateStr = formatDateStr(selectedDate);

  // Sync selected day's note form with saved data
  useEffect(() => {
    const existing = dailyNotes.find(n => n.date === selectedDateStr);
    if (existing) {
      setDayNotesContent(existing.content);
      setDayEmotions(existing.emotions || []);
    } else {
      setDayNotesContent('');
      setDayEmotions([]);
    }
  }, [selectedDateStr, dailyNotes]);

  // Save note and emotions for currently selected day
  const handleSaveNote = () => {
    if (!activeUserId) return;
    const noteObj = { date: selectedDateStr, content: dayNotesContent, emotions: dayEmotions };
    
    const existingIndex = dailyNotes.findIndex(n => n.date === selectedDateStr);
    if (existingIndex >= 0) {
      const updated = [...dailyNotes];
      updated[existingIndex] = noteObj;
      setDailyNotes(updated);
    } else {
      setDailyNotes([...dailyNotes, noteObj]);
    }

    // Sync to Cloud
    setDoc(doc(db, 'users', activeUserId, 'dailyNotes', selectedDateStr), noteObj).catch(console.error);
  };

  // Toggle emotion helper
  const toggleEmotion = (emotionLabel: string) => {
    if (dayEmotions.includes(emotionLabel)) {
      setDayEmotions(dayEmotions.filter(e => e !== emotionLabel));
    } else {
      setDayEmotions([...dayEmotions, emotionLabel]);
    }
  };

  // Add a financial transaction to current selected day
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserId) return;
    const val = parseFloat(txAmount);
    if (isNaN(val) || val <= 0) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      date: selectedDateStr,
      amount: val,
      type: txType,
      method: txMethod,
      category: txCategory,
      notes: txNotes.trim()
    };

    setTransactions(prev => [...prev, newTx]);
    setTxAmount('');
    setTxNotes('');

    // Sync to Cloud
    setDoc(doc(db, 'users', activeUserId, 'transactions', newTx.id), newTx).catch(console.error);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    if (!activeUserId) return;
    setTransactions(prev => prev.filter(t => t.id !== id));

    // Delete from Cloud
    deleteDoc(doc(db, 'users', activeUserId, 'transactions', id)).catch(console.error);
  };

  // Add a dynamic custom category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserId || !newCatLabel.trim()) return;

    const labelUpper = newCatLabel.trim();
    const id = labelUpper.toUpperCase().replace(/\s+/g, '_');

    // Check duplicate
    if (categories.some(c => c.id === id || c.label.toLowerCase() === labelUpper.toLowerCase())) {
      setNewCatLabel('');
      return;
    }

    const newCategory: Category = {
      id,
      label: labelUpper,
      color: newCatColor,
      isIncome: false
    };

    setCategories(prev => {
      const updated = [...prev, newCategory];
      const stipendio = updated.find(c => c.id === 'STIPENDIO');
      const otherExpenses = updated.filter(c => c.id !== 'STIPENDIO');
      otherExpenses.sort((a, b) => a.label.localeCompare(b.label));
      return stipendio ? [stipendio, ...otherExpenses] : otherExpenses;
    });

    setNewCatLabel('');

    // Sync to Cloud
    setDoc(doc(db, 'users', activeUserId, 'categories', newCategory.id), newCategory).catch(console.error);
  };

  // Delete a custom category
  const handleDeleteCategory = (catId: string) => {
    if (!activeUserId || catId === 'STIPENDIO') return;
    setCategories(prev => prev.filter(c => c.id !== catId));

    // Delete from Cloud
    deleteDoc(doc(db, 'users', activeUserId, 'categories', catId)).catch(console.error);
  };

  // Finance calculations
  const calculateTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Card specific calculations
  const calculateCardIncome = () => {
    return transactions
      .filter(t => t.type === 'INCOME' && t.method === 'CARTA')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateCardExpenses = () => {
    return transactions
      .filter(t => t.type === 'EXPENSE' && t.method === 'CARTA')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Cash specific calculations
  const calculateCashIncome = () => {
    return transactions
      .filter(t => t.type === 'INCOME' && t.method === 'CONTANTI')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateCashExpenses = () => {
    return transactions
      .filter(t => t.type === 'EXPENSE' && t.method === 'CONTANTI')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Final Balances
  const currentCardBalance = initialCard + calculateCardIncome() - calculateCardExpenses();
  const currentCashBalance = initialCash + calculateCashIncome() - calculateCashExpenses();
  const totalBalance = currentCardBalance + currentCashBalance;

  // Selected date transactions
  const selectedDayTransactions = transactions.filter(t => t.date === selectedDateStr);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Copy code snippet helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Folder toggle helper for Java explorer
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Helper to resolve category badge styling
  const getCategoryBadgeStyle = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

    switch (cat.color) {
      case 'emerald': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'indigo': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'purple': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'amber': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'pink': return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'cyan': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'teal': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'orange': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'rose': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getCategoryLabel = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.label : catId;
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-stone-50 text-stone-900'}`}>
      
      {/* GLOBAL NAVIGATION HEADER */}
      <nav className={`px-4 py-3 border-b flex items-center justify-between sticky top-0 z-50 backdrop-blur-md ${isDarkMode ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-stone-50/80 border-stone-200/80'}`}>
        <div className="flex items-center space-x-3">
          <AppLogo />
          <span className="font-mono text-sm tracking-tight font-semibold bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
            Aura • Calendario & Finanza
          </span>
        </div>

        {/* Workspace Switcher */}
        {isLoggedIn && (
          <div className="flex rounded-lg p-0.5 bg-stone-200/60 dark:bg-zinc-900 border border-stone-300/50 dark:border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('app')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'app' ? (isDarkMode ? 'bg-zinc-800 text-amber-400 shadow-xs' : 'bg-white text-amber-600 shadow-xs') : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'}`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Applicazione</span>
            </button>
            <button
              onClick={() => setActiveTab('backend')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'backend' ? (isDarkMode ? 'bg-zinc-800 text-cyan-400 shadow-xs' : 'bg-white text-cyan-600 shadow-xs') : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'}`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Sviluppo Backend (Java)</span>
            </button>
          </div>
        )}

        {isLoggedIn && (
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Live Cloud Sync Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-medium shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="w-3 h-3 text-emerald-500" />
              <span className="hidden sm:inline">Cloud Sincronizzato</span>
            </div>

            {/* Theme selector */}
            <button 
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${isDarkMode ? 'border-zinc-800 bg-zinc-900 text-amber-400 hover:bg-zinc-800' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'}`}
              title="Cambia Tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile trigger */}
            <div 
              onClick={() => setIsEditingProfile(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800' : 'border-stone-200 bg-stone-100/60 hover:bg-stone-200/60'}`}
            >
              <span className="text-base">{profile.avatarUrl}</span>
              <span className="text-xs font-semibold">{profile.name}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center text-rose-500 hover:bg-rose-500/10 ${isDarkMode ? 'border-zinc-800' : 'border-stone-200'}`}
              title="Disconnetti / Esci"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </nav>

      {/* LOGIN & REGISTRATION SCREEN */}
      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-md p-6 rounded-2xl border shadow-xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}
          >
            <div className="text-center mb-6">
              <div className="inline-block p-3 rounded-2xl bg-amber-500/10 mb-3">
                <AppLogo />
              </div>
              <h1 className="text-2.5xl font-semibold tracking-tight">Aura Calendario & Finanza</h1>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">Sincronizzazione Cloud in tempo reale tra PC e Smartphone.</p>
            </div>

            {/* Prominent Quick Access Demo Button */}
            <button
              type="button"
              onClick={handleQuickDemoLavinia}
              disabled={authLoading}
              className="w-full mb-5 py-3 px-4 rounded-xl border border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2 font-mono ring-2 ring-amber-500/20 disabled:opacity-50"
            >
              <span>✨</span> ACCESSO RAPIDO DEMO (LAVINIA)
            </button>

            {/* Auth Mode Toggle Tabs (Accedi / Registrati) */}
            <div className="flex rounded-xl p-1 mb-5 bg-stone-100 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${authTab === 'login' ? (isDarkMode ? 'bg-zinc-800 text-amber-400 shadow-xs' : 'bg-white text-amber-600 shadow-xs') : 'text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300'}`}
              >
                Accedi
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${authTab === 'register' ? (isDarkMode ? 'bg-zinc-800 text-amber-400 shadow-xs' : 'bg-white text-amber-600 shadow-xs') : 'text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300'}`}
              >
                Registrati
              </button>
            </div>

            {/* Error Message Alert */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-mono flex items-start gap-2">
                <span className="shrink-0 text-sm">⚠️</span>
                <span>{authError}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {authTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">Nome Utente</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Es. Lavinia, Marco..."
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700 focus:ring-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400 focus:ring-stone-400'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Inserisci la tua password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700 focus:ring-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400 focus:ring-stone-400'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 mt-2 rounded-lg bg-black text-white dark:bg-zinc-100 dark:text-black font-semibold text-sm transition hover:opacity-90 cursor-pointer disabled:opacity-50 font-mono"
                >
                  {authLoading ? 'Accesso in corso...' : 'Accedi al Tuo Profilo'}
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">Nome Utente</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Scegli un nome utente"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700 focus:ring-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400 focus:ring-stone-400'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">Crea Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Scegli la tua password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700 focus:ring-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400 focus:ring-stone-400'}`}
                  />
                </div>

                <AvatarSelector 
                  selectedUrl={authAvatarUrl} 
                  onSelect={(url) => setAuthAvatarUrl(url)} 
                  isDarkMode={isDarkMode} 
                />

                {/* Starting Balances */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">💳 Partenza Carta (€)</label>
                    <input 
                      type="number" 
                      step="any"
                      value={authInitialCard}
                      onChange={(e) => setAuthInitialCard(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">💵 Partenza Contanti (€)</label>
                    <input 
                      type="number" 
                      step="any"
                      value={authInitialCash}
                      onChange={(e) => setAuthInitialCash(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2 text-sm transition focus:outline-none focus:ring-1 ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700' : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400'}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 mt-2 rounded-lg bg-black text-white dark:bg-zinc-100 dark:text-black font-semibold text-sm transition hover:opacity-90 cursor-pointer disabled:opacity-50 font-mono"
                >
                  {authLoading ? 'Registrazione in corso...' : 'Crea Account & Inizia'}
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-zinc-800 text-center">
              <span className="text-[11px] font-mono text-stone-400 dark:text-zinc-500">
                Aura Calendario & Finanza • Sincronizzazione Cloud Istantanea
              </span>
            </div>
          </motion.div>
        </div>
      ) : activeTab === 'app' ? (
        
        /* MAIN APPLICATION VIEW (CALENDAR & FINANCE DASHBOARD) */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
          
          {/* TOP OVERVIEW & BALANCE SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Net Balance Card */}
            <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 dark:text-zinc-400 mb-2">
                <span>BILANCIO TOTALE NETTO</span>
                <PiggyBank className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight">
                € {totalBalance.toFixed(2)}
              </div>
              <div className="mt-2 text-[11px] text-stone-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
                <span>Saldo complessivo aggiornato</span>
              </div>
            </div>

            {/* Card Balance */}
            <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 dark:text-zinc-400 mb-2">
                <span>DISPONIBILITÀ CARTA</span>
                <CreditCard className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-indigo-600 dark:text-indigo-400">
                € {currentCardBalance.toFixed(2)}
              </div>
              <div className="mt-2 text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
                Partenza: € {initialCard.toFixed(2)}
              </div>
            </div>

            {/* Cash Balance */}
            <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 dark:text-zinc-400 mb-2">
                <span>CONTANTI IN TASCA</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                € {currentCashBalance.toFixed(2)}
              </div>
              <div className="mt-2 text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
                Partenza: € {initialCash.toFixed(2)}
              </div>
            </div>

            {/* Monthly Inflow/Outflow summary */}
            <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 dark:text-zinc-400 mb-2">
                <span>MOVIMENTI REGISTRATI</span>
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Entrate:</span>
                  <span className="font-bold">+€ {calculateTotalIncome().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-rose-500">
                  <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Uscite:</span>
                  <span className="font-bold">-€ {calculateTotalExpenses().toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* MAIN GRID: CALENDAR & DAY DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT 7 COLS: MONTHLY INTERACTIVE CALENDAR */}
            <div className={`lg:col-span-7 p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight capitalize">
                    {monthNames[month]} {year}
                  </h2>
                  <p className="text-xs text-stone-400 dark:text-zinc-400 mt-0.5">Seleziona un giorno per registrare spese o note private.</p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button 
                    onClick={prevMonth}
                    className={`p-2 rounded-lg border transition cursor-pointer ${isDarkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-stone-200 hover:bg-stone-100'}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${isDarkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-stone-200 hover:bg-stone-100'}`}
                  >
                    Oggi
                  </button>
                  <button 
                    onClick={nextMonth}
                    className={`p-2 rounded-lg border transition cursor-pointer ${isDarkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-stone-200 hover:bg-stone-100'}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-stone-400 dark:text-zinc-500 mb-2 font-semibold">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
                <span>Gio</span>
                <span>Ven</span>
                <span>Sab</span>
                <span>Dom</span>
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Blank offset cells for month alignment */}
                {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                  <div key={`blank-${i}`} className="h-20 md:h-24 rounded-xl border border-transparent opacity-20" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateObj = new Date(year, month, dayNum);
                  const dateStr = formatDateStr(dateObj);
                  const isSelected = dateStr === selectedDateStr;
                  const isToday = formatDateStr(new Date()) === dateStr;

                  // Find daily note
                  const dayNote = dailyNotes.find(n => n.date === dateStr);
                  // Find day transactions
                  const dayTxs = transactions.filter(t => t.date === dateStr);
                  const dayExpenseSum = dayTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
                  const dayIncomeSum = dayTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);

                  return (
                    <div
                      key={dayNum}
                      onClick={() => setSelectedDate(dateObj)}
                      className={`h-20 md:h-24 p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group ${
                        isSelected 
                          ? (isDarkMode ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30' : 'border-amber-500 bg-amber-50 ring-1 ring-amber-500/30') 
                          : isToday
                          ? (isDarkMode ? 'border-zinc-700 bg-zinc-800/40' : 'border-stone-300 bg-stone-100/60')
                          : (isDarkMode ? 'border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/40' : 'border-stone-200/80 bg-stone-50/50 hover:border-stone-300 hover:bg-white')
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-semibold ${isToday ? 'px-1.5 py-0.5 rounded-md bg-amber-500 text-black' : ''}`}>
                          {dayNum}
                        </span>
                        {dayNote && dayNote.content && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Nota presente" />
                        )}
                      </div>

                      {/* Daily Finance Badges in Cell */}
                      <div className="space-y-0.5 font-mono text-[10px] overflow-hidden">
                        {dayIncomeSum > 0 && (
                          <div className="text-emerald-600 dark:text-emerald-400 truncate font-semibold">
                            +€{dayIncomeSum.toFixed(0)}
                          </div>
                        )}
                        {dayExpenseSum > 0 && (
                          <div className="text-rose-500 truncate font-semibold">
                            -€{dayExpenseSum.toFixed(0)}
                          </div>
                        )}
                      </div>

                      {/* Emotions indicator */}
                      {dayNote && dayNote.emotions && dayNote.emotions.length > 0 && (
                        <div className="flex items-center gap-0.5 text-[10px] overflow-hidden">
                          {dayNote.emotions.map(e => {
                            const found = EMOTIONS.find(em => em.label === e);
                            return <span key={e}>{found?.icon || '•'}</span>;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* RIGHT 5 COLS: SELECTED DAY MANAGEMENT */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* PANEL A: DAY DIARY & EMOTIONAL JOURNAL */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold text-sm">
                      Diario del Giorno • <span className="font-mono text-amber-500">{selectedDateStr}</span>
                    </h3>
                  </div>
                  <button 
                    onClick={handleSaveNote}
                    className="px-3 py-1 rounded-lg bg-black text-white dark:bg-zinc-100 dark:text-black font-semibold text-xs flex items-center gap-1.5 transition hover:opacity-90 cursor-pointer"
                  >
                    <Save className="w-3 h-3" /> Salva Note
                  </button>
                </div>

                {/* Mood Badges Selector */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {EMOTIONS.map(e => {
                    const isSelected = dayEmotions.includes(e.label);
                    return (
                      <button
                        key={e.label}
                        type="button"
                        onClick={() => toggleEmotion(e.label)}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1 border transition cursor-pointer ${
                          isSelected
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                            : (isDarkMode ? 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700' : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200')
                        }`}
                      >
                        <span>{e.icon}</span>
                        <span>{e.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Daily Notes Textarea */}
                <textarea
                  rows={3}
                  placeholder="Scrivi qui i tuoi pensieri, impegni o note personali della giornata..."
                  value={dayNotesContent}
                  onChange={(e) => setDayNotesContent(e.target.value)}
                  className={`w-full rounded-xl p-3 text-xs transition focus:outline-none focus:ring-1 resize-none ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700 focus:ring-zinc-700' 
                      : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-stone-400 focus:ring-stone-400'
                  }`}
                />
              </div>

              {/* PANEL B: DAY TRANSACTIONS & ADD MOVIMENTO */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-semibold text-sm">
                      Movimenti di <span className="font-mono text-emerald-500">{selectedDateStr}</span>
                    </h3>
                  </div>
                </div>

                {/* FORM FOR ADDING TRANSACTION */}
                <form onSubmit={handleAddTransaction} className="space-y-3 mb-5 p-3.5 rounded-xl border border-dashed border-stone-200 dark:border-zinc-800">
                  
                  {/* Type Selector (Entrata / Uscita) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType('EXPENSE')}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
                        txType === 'EXPENSE'
                          ? 'border-rose-500/50 bg-rose-500/10 text-rose-500'
                          : (isDarkMode ? 'border-zinc-800 bg-zinc-950 text-zinc-400' : 'border-stone-200 bg-stone-100 text-stone-600')
                      }`}
                    >
                      - Uscita / Spesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('INCOME')}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
                        txType === 'INCOME'
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : (isDarkMode ? 'border-zinc-800 bg-zinc-950 text-zinc-400' : 'border-stone-200 bg-stone-100 text-stone-600')
                      }`}
                    >
                      + Entrata / Stipendio
                    </button>
                  </div>

                  {/* Method & Amount */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1">Metodo</label>
                      <select
                        value={txMethod}
                        onChange={(e) => setTxMethod(e.target.value as any)}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                      >
                        <option value="CARTA">💳 Carta</option>
                        <option value="CONTANTI">💵 Contanti</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1">Importo (€)</label>
                      <input 
                        type="number"
                        step="any"
                        placeholder="0.00"
                        required
                        value={txAmount}
                        onChange={(e) => setTxAmount(e.target.value)}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                      />
                    </div>
                  </div>

                  {/* Category & Notes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1">Categoria</label>
                      <select
                        value={txCategory}
                        onChange={(e) => setTxCategory(e.target.value)}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                      >
                        {txType === 'INCOME' ? (
                          <option value="STIPENDIO">Stipendio / Entrate</option>
                        ) : (
                          categories.filter(c => !c.isIncome).map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1">Note (Opzionale)</label>
                      <input 
                        type="text"
                        placeholder="Es. Pranzo, Benzina..."
                        value={txNotes}
                        onChange={(e) => setTxNotes(e.target.value)}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-black text-white dark:bg-zinc-100 dark:text-black font-semibold text-xs flex items-center justify-center gap-1 transition hover:opacity-90 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registra Movimento
                  </button>
                </form>

                {/* LIST OF TRANSACTIONS FOR SELECTED DAY */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedDayTransactions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-stone-400 dark:text-zinc-500 font-mono">
                      Nessun movimento registrato per questa data.
                    </div>
                  ) : (
                    selectedDayTransactions.map(t => (
                      <div 
                        key={t.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-stone-50 border-stone-200'}`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${getCategoryBadgeStyle(t.category)}`}>
                            {getCategoryLabel(t.category)}
                          </span>
                          <div>
                            <div className="font-semibold flex items-center gap-1">
                              <span>{t.method === 'CARTA' ? '💳 Carta' : '💵 Contanti'}</span>
                              {t.notes && <span className="text-stone-400 dark:text-zinc-500 font-normal">({t.notes})</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`font-mono font-bold ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                            {t.type === 'INCOME' ? '+' : '-'}€{t.amount.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="p-1 rounded-md text-stone-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* PANEL C: CUSTOM CATEGORIES MANAGEMENT */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Gestione Categorie Personali</h3>
                </div>

                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-3">
                  <input 
                    type="text"
                    placeholder="Nuova categoria (es. Abbigliamento)"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                  />
                  <select
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className={`rounded-lg px-2 py-1.5 text-xs transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                  >
                    {CATEGORY_COLOR_PRESETS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-zinc-100 dark:text-black font-semibold text-xs flex items-center gap-1 transition hover:opacity-90 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Aggiungi
                  </button>
                </form>

                {/* Active Category Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(c => (
                    <span 
                      key={c.id}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono border flex items-center gap-1.5 ${getCategoryBadgeStyle(c.id)}`}
                    >
                      <span>{c.label}</span>
                      {c.id !== 'STIPENDIO' && (
                        <button 
                          onClick={() => handleDeleteCategory(c.id)}
                          className="hover:text-rose-500 transition cursor-pointer"
                          title="Elimina Categoria"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </main>

      ) : (

        /* BACKEND JAVA DEVELOPER EXPLORER VIEW */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">
          
          {/* LEFT: JAVA PROJECT DIRECTORY TREE */}
          <div className={`w-full lg:w-80 p-4 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-zinc-800 font-mono text-xs">
              <span className="font-semibold text-cyan-500 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4" /> Aura Backend Architecture
              </span>
              <span className="text-[10px] text-stone-400 dark:text-zinc-500">Java 21 / Spring</span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1">
              <TreeRenderer 
                items={javaProjectStructure} 
                selectedFile={selectedJavaFile} 
                onSelectFile={setSelectedJavaFile}
                expandedFolders={expandedFolders}
                onToggleFolder={toggleFolder}
              />
            </div>
          </div>

          {/* RIGHT: CODE VIEWER & ARCHITECTURE EXPLANATION */}
          <div className={`flex-1 p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-xs'}`}>
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-cyan-500" />
                  <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    {selectedJavaFile.name}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyCode(selectedJavaFile.content)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1 transition cursor-pointer ${isDarkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-stone-200 hover:bg-stone-100'}`}
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copiato!' : 'Copia Codice'}</span>
                </button>
              </div>

              {/* Code Display */}
              <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-stone-900 border-stone-800 text-stone-200'}`}>
                <pre>{selectedJavaFile.content}</pre>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between text-xs text-stone-400 dark:text-zinc-500 font-mono">
              <span>Architettura Spring Boot 3.2 • REST API & JPA Persistence</span>
              <span>Aura Backend Console</span>
            </div>
          </div>

        </main>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Modifica Profilo & Saldi Iniziali</h3>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1">Nome Utente</label>
                <input 
                  type="text" 
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1">Password</label>
                <input 
                  type="password" 
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                />
              </div>

              <AvatarSelector 
                selectedUrl={tempAvatarUrl} 
                onSelect={(url) => setTempAvatarUrl(url)} 
                isDarkMode={isDarkMode} 
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1">💳 Partenza Carta (€)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={tempInitialCard}
                    onChange={(e) => setTempInitialCard(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1">💵 Partenza Contanti (€)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={tempInitialCash}
                    onChange={(e) => setTempInitialCash(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm transition focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200 text-stone-800'}`}
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-black text-white dark:bg-zinc-100 dark:text-black font-semibold text-xs transition hover:opacity-90 cursor-pointer"
                >
                  Salva Modifiche Profilo
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 font-semibold transition hover:bg-rose-500/20 cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Esci / Disconnetti
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

// Subcomponent: App Logo SVG Icon
function AppLogo() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-bold font-mono text-sm shadow-sm">
      A
    </div>
  );
}

// Subcomponent: Avatar Preset Selector Grid
function AvatarSelector({ selectedUrl, onSelect, isDarkMode }: { selectedUrl: string; onSelect: (url: string) => void; isDarkMode: boolean }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase text-stone-400 dark:text-zinc-500 mb-1.5 font-semibold">Scegli Avatar</label>
      <div className="flex flex-wrap gap-2">
        {AVATAR_PRESETS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition cursor-pointer ${
              selectedUrl === emoji
                ? 'border-amber-500 bg-amber-500/20 scale-105 ring-2 ring-amber-500/30'
                : (isDarkMode ? 'border-zinc-800 bg-zinc-950 hover:border-zinc-700' : 'border-stone-200 bg-stone-50 hover:bg-stone-100')
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// Subcomponent: Recursive Tree Item Renderer for Java Project Structure
function TreeRenderer({ items, selectedFile, onSelectFile, expandedFolders, onToggleFolder }: {
  items: (JavaFolder | JavaFile)[];
  selectedFile: JavaFile;
  onSelectFile: (file: JavaFile) => void;
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (path: string) => void;
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        if (item.type === 'folder') {
          const isExpanded = !!expandedFolders[item.path];
          return (
            <div key={item.path} className="space-y-1">
              <div 
                onClick={() => onToggleFolder(item.path)}
                className="flex items-center space-x-1.5 py-1 px-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer text-stone-600 dark:text-zinc-400"
              >
                {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-amber-500" /> : <Folder className="w-3.5 h-3.5 text-amber-500" />}
                <span className="truncate">{item.name}</span>
              </div>
              {isExpanded && item.children && (
                <div className="pl-3 border-l border-stone-200 dark:border-zinc-800 ml-2">
                  <TreeRenderer 
                    items={item.children} 
                    selectedFile={selectedFile} 
                    onSelectFile={onSelectFile}
                    expandedFolders={expandedFolders}
                    onToggleFolder={onToggleFolder}
                  />
                </div>
              )}
            </div>
          );
        } else {
          const isSelected = selectedFile.path === item.path;
          return (
            <div
              key={item.path}
              onClick={() => onSelectFile(item)}
              className={`flex items-center space-x-1.5 py-1 px-1.5 rounded-md cursor-pointer transition ${
                isSelected 
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold' 
                  : 'hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 dark:text-zinc-400'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-500" />
              <span className="truncate">{item.name}</span>
            </div>
          );
        }
      })}
    </div>
  );
}