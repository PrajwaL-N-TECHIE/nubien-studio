import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Calendar, Activity, Filter, ArrowUpRight, ArrowDownRight, Hash, Edit2, Download, Search, Repeat, ToggleLeft, ToggleRight, AlertTriangle, LineChart } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar, LineChart as ReLineChart, Line, ReferenceLine } from 'recharts';
import confetti from 'canvas-confetti';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  category: string;
  description: string;
  source_destination: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

interface RecurringTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  category: string;
  description: string;
  source_destination: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  next_date: string; // YYYY-MM-DD
  active: boolean;
  createdAt: string;
}

const CATEGORIES = {
  credit: ['Client Payment', 'Investment', 'SaaS Subscription', 'Internship', 'Other Income'],
  debit: ['Software Subscriptions', 'Salaries', 'Marketing', 'Hosting/AWS', 'Legal/Taxes', 'Internship Works', 'Other Expense']
};
const ALL_CATEGORIES = [...CATEGORIES.credit, ...CATEGORIES.debit];
const CHART_COLORS = ['#8b5cf6', '#10b981', '#ec4899', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4'];

const FinanceTracker = () => {
  const [status, setStatus] = useState<'login' | 'dashboard'>('login');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [celebration, setCelebration] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [timeframe, setTimeframe] = useState<'all' | 'year' | 'month'>('month');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Recurring Transactions
  const [recurringTxns, setRecurringTxns] = useState<RecurringTransaction[]>([]);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [rtForm, setRtForm] = useState({
    type: 'credit' as 'credit' | 'debit',
    amount: '',
    category: CATEGORIES.credit[0],
    description: '',
    source_destination: '',
    frequency: 'monthly' as 'monthly' | 'weekly' | 'yearly',
    next_date: new Date().toISOString().split('T')[0]
  });

  // Forecast
  const [forecastMonths, setForecastMonths] = useState(6);

  // New Transaction Form State
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.credit[0]);
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (status === 'dashboard') {
      const q = query(collection(db, "finance_transactions"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transData: Transaction[] = [];
        snapshot.forEach((doc) => {
          transData.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(transData);
      });
      return () => unsubscribe();
    }
  }, [status]);

  // Listen to recurring transactions
  useEffect(() => {
    if (status === 'dashboard') {
      const q = query(collection(db, "recurring_transactions"), orderBy("next_date", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const recData: RecurringTransaction[] = [];
        snapshot.forEach((doc) => {
          recData.push({ id: doc.id, ...doc.data() } as RecurringTransaction);
        });
        setRecurringTxns(recData);
      });
      return () => unsubscribe();
    }
  }, [status]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus('dashboard');
      setLoginError('');
    } catch (err: any) {
      console.error("Login failed:", err);
      setLoginError(`Error: ${err.message || 'Invalid secure credentials'}`);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const hideDescription = category === 'Internship' && type === 'credit';
    if (!amount || (!description && !hideDescription) || !source) return;

    try {
      const baseAmount = currency === 'USD' ? parseFloat(amount) * 83.5 : parseFloat(amount);

      if (editingId) {
        await updateDoc(doc(db, "finance_transactions", editingId), {
          type,
          amount: baseAmount,
          category,
          description: hideDescription ? 'Internship Income' : description,
          source_destination: source,
          date
        });
      } else {
        await addDoc(collection(db, "finance_transactions"), {
          type,
          amount: baseAmount,
          category,
          description: hideDescription ? 'Internship Income' : description,
          source_destination: source,
          date,
          createdAt: new Date().toISOString()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setAmount('');
      setDescription('');
      setSource('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error("Failed to add/update transaction", err);
      alert("Failed to save transaction. Check Firebase permissions.");
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setType(t.type);
    setAmount(currency === 'USD' ? (t.amount / 83.5).toString() : t.amount.toString());
    setCategory(t.category);
    setDescription(t.description);
    setSource(t.source_destination);
    setDate(t.date);
    setIsAdding(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setAmount('');
    setDescription('');
    setSource('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteDoc(doc(db, "finance_transactions", id));
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    
    const headers = ['Date', 'Type', 'Category', 'Description', 'Source/Destination', 'Amount (INR)'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type.toUpperCase(),
      t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.source_destination.replace(/"/g, '""')}"`,
      t.amount
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Finance_Report_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Recurring Transaction Handlers ---
  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtForm.amount || !rtForm.description || !rtForm.source_destination) return;
    try {
      const baseAmount = currency === 'USD' ? parseFloat(rtForm.amount) * 83.5 : parseFloat(rtForm.amount);
      if (editingRecurring) {
        await updateDoc(doc(db, "recurring_transactions", editingRecurring.id), {
          ...rtForm,
          amount: baseAmount,
        });
      } else {
        await addDoc(collection(db, "recurring_transactions"), {
          ...rtForm,
          amount: baseAmount,
          createdAt: new Date().toISOString()
        });
      }
      setShowRecurringModal(false);
      setEditingRecurring(null);
      setRtForm({ type: 'credit', amount: '', category: CATEGORIES.credit[0], description: '', source_destination: '', frequency: 'monthly', next_date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error("Failed to save recurring txn", err);
      alert("Failed to save. Check Firebase permissions.");
    }
  };

  const toggleRecurringActive = async (rt: RecurringTransaction) => {
    try {
      await updateDoc(doc(db, "recurring_transactions", rt.id), { active: !rt.active });
    } catch (err) {
      console.error("Failed to toggle", err);
    }
  };

  const deleteRecurring = async (id: string) => {
    if (window.confirm('Delete this recurring transaction?')) {
      try {
        await deleteDoc(doc(db, "recurring_transactions", id));
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const openEditRecurring = (rt: RecurringTransaction) => {
    setEditingRecurring(rt);
    setRtForm({
      type: rt.type,
      amount: (currency === 'USD' ? rt.amount / 83.5 : rt.amount).toString(),
      category: rt.category,
      description: rt.description,
      source_destination: rt.source_destination,
      frequency: rt.frequency,
      next_date: rt.next_date
    });
    setShowRecurringModal(true);
  };

  // Calculations & Filtering
  const { 
    totalRevenue, 
    totalExpenses, 
    netBalance, 
    chartData, 
    filteredTransactions,
    incomeByCategory,
    expenseByCategory,
    profitMargin,
    forecastData,
    avgMonthlyIncome,
    avgMonthlyExpenses
  } = useMemo(() => {
    let rev = 0;
    let exp = 0;

    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = now.toISOString().substring(0, 7);

    // Group for charts
    const monthlyMap: Record<string, { name: string, Income: number, Expenses: number }> = {};
    const filteredTx: Transaction[] = [];

    transactions.forEach(t => {
      const isCredit = t.type === 'credit';
      const val = t.amount;
      const monthStr = t.date.substring(0, 7);
      const yearStr = t.date.substring(0, 4);

      // Timeframe Filter
      if (timeframe === 'month' && monthStr !== currentMonth) return;
      if (timeframe === 'year' && yearStr !== currentYear) return;

      // Category Filter
      if (filterCategory !== 'All' && t.category !== filterCategory) return;

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !t.description.toLowerCase().includes(query) && 
          !t.source_destination.toLowerCase().includes(query) &&
          !t.category.toLowerCase().includes(query)
        ) {
          return;
        }
      }

      filteredTx.push(t);

      // Aggregates
      if (isCredit) rev += val;
      else exp += val;

      // Chart Data
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { name: monthStr, Income: 0, Expenses: 0 };
      }
      if (isCredit) monthlyMap[monthStr].Income += val;
      else monthlyMap[monthStr].Expenses += val;
    });

    const bal = rev - exp;
    const margin = rev > 0 ? ((rev - exp) / rev) * 100 : 0;

    // Group for pie charts
    const incCategoryMap: Record<string, number> = {};
    const expCategoryMap: Record<string, number> = {};
    
    filteredTx.forEach(t => {
      if (t.type === 'credit') {
        incCategoryMap[t.category] = (incCategoryMap[t.category] || 0) + t.amount;
      } else {
        expCategoryMap[t.category] = (expCategoryMap[t.category] || 0) + t.amount;
      }
    });

    const incomeByCategory = Object.entries(incCategoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const expenseByCategory = Object.entries(expCategoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Sort chart data chronologically
    const sortedChart = Object.values(monthlyMap).sort((a, b) => a.name.localeCompare(b.name));

    // ---- Forecast Calculation ----
    // Compute average monthly income/expenses from all-time data (for non-recurring baseline)
    const allMonthsMap: Record<string, { inc: number; exp: number }> = {};
    transactions.forEach(t => {
      const m = t.date.substring(0, 7);
      if (!allMonthsMap[m]) allMonthsMap[m] = { inc: 0, exp: 0 };
      if (t.type === 'credit') allMonthsMap[m].inc += t.amount;
      else allMonthsMap[m].exp += t.amount;
    });
    const monthCount = Object.keys(allMonthsMap).length || 1;

    // Baseline average from actual data
    const totalInc = Object.values(allMonthsMap).reduce((s, m) => s + m.inc, 0);
    const totalExp = Object.values(allMonthsMap).reduce((s, m) => s + m.exp, 0);
    const avgInc = totalInc / monthCount;
    const avgExp = totalExp / monthCount;

    // Calculate recurring monthly amounts
    let recurringMonthlyInc = 0;
    let recurringMonthlyExp = 0;
    const nowDate = new Date();
    recurringTxns.filter(rt => rt.active).forEach(rt => {
      const monthlyAmount = rt.frequency === 'monthly' ? rt.amount
        : rt.frequency === 'weekly' ? rt.amount * 4.33
        : rt.amount / 12; // yearly
      if (rt.type === 'credit') recurringMonthlyInc += monthlyAmount;
      else recurringMonthlyExp += monthlyAmount;
    });

    // Non-recurring baseline = average minus what recurring already covers
    // This avoids double-counting recurring amounts
    const nonRecurringAvgInc = Math.max(0, avgInc - recurringMonthlyInc);
    const nonRecurringAvgExp = Math.max(0, avgExp - recurringMonthlyExp);

    // Generate forecast for next N months
    const forecast: { name: string; Income: number; Expenses: number; Balance: number }[] = [];
    let runningBalance = bal; // start from current net balance

    // Get current month from actual data as starting point for the forecast
    const lastHistMonth = sortedChart.length > 0 ? sortedChart[sortedChart.length - 1].name : currentMonth;
    
    // Start forecast from the month after the last historical data
    const [lastY, lastM] = lastHistMonth.split('-').map(Number);
    let fy = lastY;
    let fm = lastM;

    for (let i = 0; i < forecastMonths; i++) {
      fm += 1;
      if (fm > 12) { fm = 1; fy += 1; }
      const monthLabel = `${fy}-${String(fm).padStart(2, '0')}`;
      
      const projectedInc = recurringMonthlyInc + nonRecurringAvgInc;
      const projectedExp = recurringMonthlyExp + nonRecurringAvgExp;
      runningBalance += (projectedInc - projectedExp);
      
      forecast.push({
        name: monthLabel,
        Income: projectedInc,
        Expenses: projectedExp,
        Balance: runningBalance
      });
    }

    return { 
      totalRevenue: rev, 
      totalExpenses: exp, 
      netBalance: bal, 
      profitMargin: margin,
      chartData: sortedChart, 
      filteredTransactions: filteredTx,
      incomeByCategory,
      expenseByCategory,
      forecastData: forecast,
      avgMonthlyIncome: avgInc,
      avgMonthlyExpenses: avgExp
    };
  }, [transactions, timeframe, filterCategory, searchQuery, recurringTxns, forecastMonths]);

  const formatCurrency = (amount: number) => {
    const val = currency === 'USD' ? amount / 83.5 : amount;
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Milestone Celebration Check
  useEffect(() => {
    if (totalRevenue > 0) {
      const MILESTONES = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];
      const celebrated = JSON.parse(localStorage.getItem('buildicy_finance_milestones') || '[]');
      
      for (let ms of [...MILESTONES].reverse()) {
        if (totalRevenue >= ms && !celebrated.includes(ms)) {
          setCelebration(ms);
          
          const duration = 5 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
              return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
          }, 250);

          celebrated.push(ms);
          localStorage.setItem('buildicy_finance_milestones', JSON.stringify(celebrated));
          break; 
        }
      }
    }
  }, [totalRevenue]);


  if (status === 'login') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-md w-full relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.15)]"
        >
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
            <Lock className="text-purple-400" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 text-center">Finance Secure Login</h1>
          <p className="text-zinc-400 text-center mb-8 text-sm">Enterprise Level Encrypted Finance Dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                required
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {loginError && <p className="text-red-400 text-sm font-bold text-center">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-4 mt-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              Access Vault
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
              <span className="bg-purple-600/20 p-2 rounded-xl text-purple-400">
                <Activity size={32} />
              </span>
              Finance Ops
            </h1>
            <p className="text-zinc-400 text-lg">High-level enterprise expenditure and revenue tracking.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRecurringModal(true)}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 group"
            >
              <Repeat size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline">Recurring</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 group"
            >
              <Download size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-zinc-400">
              <Filter size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
            </div>
            <div className="h-6 w-px bg-white/10 hidden md:block"></div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-1 flex">
              {(['all', 'year', 'month'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${timeframe === tf ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
                >
                  {tf === 'all' ? 'All Time' : tf === 'year' ? 'This Year' : 'This Month'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full md:w-48 bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 font-medium"
            >
              <option value="All" className="bg-[#0C0C12]">All Categories</option>
              <optgroup label="Income" className="bg-[#0C0C12] text-purple-400">
                {CATEGORIES.credit.map(c => <option key={c} value={c} className="text-white">{c}</option>)}
              </optgroup>
              <optgroup label="Expenses" className="bg-[#0C0C12] text-purple-400">
                {CATEGORIES.debit.map(c => <option key={c} value={c} className="text-white">{c}</option>)}
              </optgroup>
            </select>

            <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${currency === 'INR' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${currency === 'USD' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                USD
              </button>
            </div>
          </div>
        </div>

        {/* 4-Card KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px]" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <DollarSign className="text-purple-400" size={20} />
              </div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-lg">Net Balance</span>
            </div>
            <p className="text-3xl font-black text-white tracking-tight truncate">{formatCurrency(netBalance)}</p>
          </div>

          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gross Revenue</span>
            </div>
            <p className="text-3xl font-black text-white tracking-tight truncate">{formatCurrency(totalRevenue)}</p>
          </div>

          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                <TrendingDown className="text-red-400" size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gross Expenses</span>
            </div>
            <p className="text-3xl font-black text-white tracking-tight truncate">{formatCurrency(totalExpenses)}</p>
          </div>

          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <Hash className="text-blue-400" size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Transaction Vol</span>
            </div>
            <p className="text-3xl font-black text-white tracking-tight">{filteredTransactions.length}</p>
          </div>
        </div>

        {/* Chart & Table Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="xl:col-span-2 bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Cash Flow Trend</h3>
              <div className="flex gap-4 text-xs font-bold tracking-widest uppercase">
                <span className="flex items-center gap-2 text-green-400"><div className="w-2 h-2 rounded-full bg-green-500" /> Income</span>
                <span className="flex items-center gap-2 text-red-400"><div className="w-2 h-2 rounded-full bg-red-500" /> Expenses</span>
              </div>
            </div>

            <div className="h-[400px] w-full mt-auto">
              {chartData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-zinc-500">No data available for the selected filters.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => currency === 'USD' ? `$${(val / 83.5).toFixed(0)}` : `₹${val}`} dx={-10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#ffffff10', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                    />
                    <Area type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Ledger */}
          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col h-[500px] xl:h-[550px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Ledger</h3>
            </div>
            
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-zinc-500">No transactions match your filters.</p>
                </div>
              ) : (
                filteredTransactions.map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => setViewingTransaction(t)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 group relative overflow-hidden hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {/* Action overlay on hover */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-2 transition-all shadow-lg z-10 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(t); }}
                        className="p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                        className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${t.type === 'credit' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {t.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-white font-bold truncate pr-4">{t.description}</p>
                        <p className={`font-black whitespace-nowrap ${t.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                          {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-black/40 border border-white/5 truncate max-w-[120px]">
                          {t.category}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                          {t.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
          </div>
        </div>
        </div>

        {/* Advanced Visualizations Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Income Breakdown */}
          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Income Distribution</h3>
            <div className="h-[250px] w-full relative">
              {incomeByCategory.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-zinc-500">No income data.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomeByCategory} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {incomeByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Expense Breakdown</h3>
            <div className="h-[250px] w-full relative">
              {expenseByCategory.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-zinc-500">No expense data.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseByCategory} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Profit Margin */}
          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] ${profitMargin >= 30 ? 'bg-green-500/20' : profitMargin >= 10 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`} />
            
            <h3 className="text-xl font-bold text-white mb-2 z-10">Net Profit Margin</h3>
            <p className="text-zinc-400 text-sm mb-6 z-10">Health Indicator</p>
            
            <div className="h-[150px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: profitMargin > 0 ? profitMargin : 0 }, { value: profitMargin > 0 ? 100 - profitMargin : 100 }]}
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={profitMargin >= 30 ? '#22c55e' : profitMargin >= 10 ? '#eab308' : '#ef4444'} />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                <span className={`text-5xl font-black ${profitMargin >= 30 ? 'text-green-400' : profitMargin >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="mt-4 z-10 w-full flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
              <span>Critical</span>
              <span>Healthy</span>
            </div>
          </div>
        </div>

        {/* Row 3: Category Bar Comparison */}
        <div className="mt-8 bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-6">Income vs Expenses (Monthly)</h3>
          <div className="h-[400px] w-full">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-zinc-500">No data available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => currency === 'USD' ? `$${val}` : `₹${val}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#0C0C12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} 
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cash Flow Forecast */}
        <div className="mt-8 bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <LineChart size={20} className="text-blue-400" /> Cash Flow Forecast
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                Projected {forecastMonths}-month outlook based on recurring transactions and historical averages
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                {[3, 6, 12].map(n => (
                  <button
                    key={n}
                    onClick={() => setForecastMonths(n)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${forecastMonths === n ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {n}m
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase">
                <span className="flex items-center gap-1.5 text-green-400"><div className="w-2 h-2 rounded-full bg-green-500" /> Income</span>
                <span className="flex items-center gap-1.5 text-red-400"><div className="w-2 h-2 rounded-full bg-red-500" /> Expense</span>
                <span className="flex items-center gap-1.5 text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-500" /> Balance</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Avg Monthly Income</p>
              <p className="text-2xl font-black text-white">{formatCurrency(avgMonthlyIncome)}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Avg Monthly Expenses</p>
              <p className="text-2xl font-black text-white">{formatCurrency(avgMonthlyExpenses)}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
              <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">Monthly Runway</p>
              <p className="text-2xl font-black text-white">{formatCurrency(avgMonthlyIncome - avgMonthlyExpenses)}</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Projected Balance ({forecastMonths}m)</p>
              <p className={`text-2xl font-black ${forecastData.length > 0 && forecastData[forecastData.length - 1].Balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                {forecastData.length > 0 ? formatCurrency(forecastData[forecastData.length - 1].Balance) : '—'}
              </p>
            </div>
          </div>

          <div className="h-[400px] w-full">
            {forecastData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-zinc-500">Add transactions and recurring entries to see a forecast.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={[...chartData.slice(-3), ...forecastData]} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff30" 
                    tick={{ fill: '#ffffff50', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#ffffff30" 
                    tick={{ fill: '#ffffff50', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(val) => currency === 'USD' ? `$${(val / 83.5).toFixed(0)}` : `₹${(val/1000).toFixed(0)}k`}
                    dx={-10}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#ffffff10', borderRadius: '16px' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {/* Dotted separator line for forecast start */}
                  <ReferenceLine x={forecastData[0]?.name} stroke="#ffffff20" strokeDasharray="5 5" label={{ value: 'Forecast →', position: 'top', fill: '#ffffff40', fontSize: 10 }} />
                  <Line type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="Balance" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                </ReLineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Forecast Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-6 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Month</th>
                  <th className="text-right py-3 px-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Projected Income</th>
                  <th className="text-right py-3 px-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Projected Expenses</th>
                  <th className="text-right py-3 px-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Net</th>
                  <th className="text-right py-3 pl-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((row, i) => (
                  <tr key={row.name} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 pr-6 text-white font-bold text-xs">{row.name}</td>
                    <td className="py-3 px-4 text-right text-green-400 font-mono font-bold text-xs">{formatCurrency(row.Income)}</td>
                    <td className="py-3 px-4 text-right text-red-400 font-mono font-bold text-xs">{formatCurrency(row.Expenses)}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold text-xs ${row.Income - row.Expenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(row.Income - row.Expenses)}
                    </td>
                    <td className={`py-3 pl-4 text-right font-mono font-bold text-xs ${row.Balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {formatCurrency(row.Balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Recurring Transactions Modal */}
      <AnimatePresence>
        {showRecurringModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setShowRecurringModal(false); setEditingRecurring(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-2xl bg-[#0C0C12] border border-white/10 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2"><Repeat size={22} className="text-purple-400" /> Recurring Transactions</h2>
              <p className="text-zinc-500 text-sm mb-6">These are auto-included in your cash flow forecast.</p>

              {/* Existing recurring list */}
              <div className="space-y-3 mb-8">
                {recurringTxns.length === 0 && (
                  <p className="text-zinc-600 text-sm text-center py-8 border border-dashed border-white/10 rounded-2xl">No recurring transactions yet. Add your first one below.</p>
                )}
                {recurringTxns.map(rt => (
                  <div key={rt.id} className={`bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 transition-opacity ${!rt.active ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${rt.type === 'credit' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {rt.type === 'credit' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{rt.description}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{rt.source_destination} • {rt.category} • Every {rt.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`font-black text-sm ${rt.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {rt.type === 'credit' ? '+' : '-'}{formatCurrency(rt.amount)}
                      </span>
                      <button onClick={() => toggleRecurringActive(rt)} className={`p-2 rounded-lg transition-colors ${rt.active ? 'text-green-400 hover:bg-green-500/20' : 'text-zinc-500 hover:bg-white/10'}`}>
                        {rt.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button onClick={() => openEditRecurring(rt)} className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteRecurring(rt.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Edit form */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">{editingRecurring ? 'Edit Recurring' : 'Add New Recurring'}</h3>
                <form onSubmit={handleAddRecurring} className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setRtForm({...rtForm, type: 'credit', category: CATEGORIES.credit[0]})}
                      className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm border ${rtForm.type === 'credit' ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-zinc-400'}`}
                    >INCOME</button>
                    <button
                      type="button"
                      onClick={() => setRtForm({...rtForm, type: 'debit', category: CATEGORIES.debit[0]})}
                      className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm border ${rtForm.type === 'debit' ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-zinc-400'}`}
                    >EXPENSE</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Amount ({currency})</label>
                      <input type="number" step="0.01" required value={rtForm.amount} onChange={e => setRtForm({...rtForm, amount: e.target.value})} placeholder="e.g. 5000" className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Frequency</label>
                      <select value={rtForm.frequency} onChange={e => setRtForm({...rtForm, frequency: e.target.value as any})} className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50">
                        <option value="monthly" className="bg-[#0C0C12]">Monthly</option>
                        <option value="weekly" className="bg-[#0C0C12]">Weekly</option>
                        <option value="yearly" className="bg-[#0C0C12]">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Category</label>
                      <select value={rtForm.category} onChange={e => setRtForm({...rtForm, category: e.target.value})} className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50">
                        {(rtForm.type === 'credit' ? CATEGORIES.credit : CATEGORIES.debit).map(c => (
                          <option key={c} value={c} className="bg-[#0C0C12]">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Next Date</label>
                      <input type="date" required value={rtForm.next_date} onChange={e => setRtForm({...rtForm, next_date: e.target.value})} className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</label>
                    <input type="text" required value={rtForm.description} onChange={e => setRtForm({...rtForm, description: e.target.value})} placeholder="e.g. Office Rent" className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">{rtForm.type === 'credit' ? 'Received From' : 'Paid To'}</label>
                    <input type="text" required value={rtForm.source_destination} onChange={e => setRtForm({...rtForm, source_destination: e.target.value})} placeholder="e.g. Landlord" className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => { setShowRecurringModal(false); setEditingRecurring(null); }} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10">
                      Close
                    </button>
                    <button type="submit" className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      {editingRecurring ? 'Update' : 'Add Recurring'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Transaction Modal */}
      <AnimatePresence>
        {viewingTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setViewingTransaction(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-md bg-[#0C0C12] border border-white/10 rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Transaction Details</h2>
                  <p className="text-zinc-500 text-sm mt-1 font-mono">ID: {viewingTransaction.id}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${viewingTransaction.type === 'credit' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {viewingTransaction.type === 'credit' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Description</label>
                  <p className="text-white font-medium text-lg">{viewingTransaction.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Amount</label>
                    <p className={`font-black text-2xl ${viewingTransaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {viewingTransaction.type === 'credit' ? '+' : '-'}{formatCurrency(viewingTransaction.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Date</label>
                    <p className="text-white font-medium text-lg">{viewingTransaction.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Category</label>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase tracking-wider bg-white/10 border border-white/5 inline-block">
                      {viewingTransaction.category}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                      {viewingTransaction.category.includes('Internship') ? 'Intern Name' : viewingTransaction.type === 'credit' ? 'Received From' : 'Paid To'}
                    </label>
                    <p className="text-white font-medium">{viewingTransaction.source_destination}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Recorded On</label>
                  <p className="text-zinc-400 text-sm font-mono">{new Date(viewingTransaction.createdAt).toLocaleString()}</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setViewingTransaction(null)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-[#0C0C12] border border-white/10 rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-black text-white mb-6">{editingId ? 'Edit Transaction' : 'Log Transaction'}</h2>
              <form onSubmit={handleAddTransaction} className="space-y-5">

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => { setType('credit'); setCategory(CATEGORIES.credit[0]); }}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${type === 'credit' ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                  >
                    INCOME
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('debit'); setCategory(CATEGORIES.debit[0]); }}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${type === 'debit' ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                  >
                    EXPENSE
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 text-xl font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                    >
                      {CATEGORIES[type].map(cat => (
                        <option key={cat} value={cat} className="bg-[#0C0C12]">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                    {(category === 'Internship' && type === 'credit') ? 'Intern Name' : type === 'credit' ? 'Received From' : 'Paid To'}
                  </label>
                  <input
                    type="text"
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder={(category === 'Internship' && type === 'credit') ? "e.g. John Doe" : type === 'credit' ? "e.g. Client X" : "e.g. AWS"}
                    className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {!(category === 'Internship' && type === 'credit') && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</label>
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. June Retainer"
                      className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  >
                    {editingId ? 'Update Record' : 'Save Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Milestone Celebration Modal */}
      <AnimatePresence>
        {celebration && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setCelebration(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-md bg-gradient-to-br from-[#0C0C12] to-[#1A1A24] border border-green-500/30 rounded-3xl shadow-[0_0_100px_rgba(34,197,94,0.15)] p-10 text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-[40px]" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-500/10 rounded-full blur-[40px]" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50 rotate-3">
                  <TrendingUp className="text-white" size={40} />
                </div>
                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Milestone Unlocked!</h2>
                <p className="text-zinc-400 text-lg mb-8">
                  Incredible work! You've successfully surpassed <br/>
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mt-3 block">{formatCurrency(celebration)}</span>
                  <span className="text-sm uppercase tracking-widest text-zinc-500 font-bold mt-2 block">in Gross Revenue</span>
                </p>
                
                <button
                  onClick={() => setCelebration(null)}
                  className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-black transition-all text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Keep Grinding
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FinanceTracker;
