import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Calendar, Activity, Filter, ArrowUpRight, ArrowDownRight, Hash } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

const CATEGORIES = {
  credit: ['Client Payment', 'Investment', 'SaaS Subscription', 'Internship', 'Other Income'],
  debit: ['Software Subscriptions', 'Salaries', 'Marketing', 'Hosting/AWS', 'Legal/Taxes', 'Internship Works', 'Other Expense']
};
const ALL_CATEGORIES = [...CATEGORIES.credit, ...CATEGORIES.debit];

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

  // Filters
  const [timeframe, setTimeframe] = useState<'all' | 'year' | 'month'>('month');
  const [filterCategory, setFilterCategory] = useState<string>('All');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus('dashboard');
      setLoginError('');
    } catch (err) {
      setLoginError('Invalid secure credentials');
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const hideDescription = category === 'Internship' && type === 'credit';
    if (!amount || (!description && !hideDescription) || !source) return;

    try {
      const baseAmount = currency === 'USD' ? parseFloat(amount) * 83.5 : parseFloat(amount);

      await addDoc(collection(db, "finance_transactions"), {
        type,
        amount: baseAmount,
        category,
        description: hideDescription ? 'Internship Income' : description,
        source_destination: source,
        date,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setAmount('');
      setDescription('');
      setSource('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error("Failed to add transaction", err);
      alert("Failed to add transaction. Check Firebase permissions.");
    }
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

  // Calculations & Filtering
  const { totalRevenue, totalExpenses, netBalance, chartData, filteredTransactions } = useMemo(() => {
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

    // Sort chart data chronologically
    const sortedChart = Object.values(monthlyMap).sort((a, b) => a.name.localeCompare(b.name));

    return { totalRevenue: rev, totalExpenses: exp, netBalance: bal, chartData: sortedChart, filteredTransactions: filteredTx };
  }, [transactions, timeframe, filterCategory]);

  const formatCurrency = (amount: number) => {
    const val = currency === 'USD' ? amount / 83.5 : amount;
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  };


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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Activity className="text-purple-400" size={20} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Finance Ops</h1>
            </div>
            <p className="text-zinc-400">High-level enterprise expenditure and revenue tracking.</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
          >
            <Plus size={20} /> New Transaction
          </button>
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
            <h3 className="text-xl font-bold text-white mb-6">Ledger</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-zinc-500">No transactions match your filters.</p>
                </div>
              ) : (
                filteredTransactions.map((t) => (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 group relative overflow-hidden hover:bg-white/10 transition-colors">
                    {/* Delete overlay on hover */}
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2.5 bg-red-500 text-white rounded-xl transition-all hover:bg-red-600 shadow-lg z-10 translate-x-4 group-hover:translate-x-0"
                    >
                      <Trash2 size={16} />
                    </button>

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

      </div>

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
              <h2 className="text-2xl font-black text-white mb-6">Log Transaction</h2>
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
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FinanceTracker;
