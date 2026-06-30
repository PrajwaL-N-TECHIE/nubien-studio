import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Calendar, Target, Activity } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

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
  debit: ['Software Subscriptions', 'Salaries', 'Marketing', 'Hosting/AWS', 'Legal/Taxes', 'Other Expense']
};

const FinanceTracker = () => {
  const [status, setStatus] = useState<'login' | 'dashboard'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
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
    if (!amount || !description || !source) return;

    try {
      await addDoc(collection(db, "finance_transactions"), {
        type,
        amount: parseFloat(amount),
        category,
        description,
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

  // Calculations
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // "YYYY-MM"

  const { totalBalance, monthlyCredit, monthlyDebit, chartData } = useMemo(() => {
    let balance = 0;
    let mCredit = 0;
    let mDebit = 0;
    
    // Group for charts
    const monthlyMap: Record<string, { name: string, Income: number, Expenses: number }> = {};

    transactions.forEach(t => {
      const isCredit = t.type === 'credit';
      const val = t.amount;
      const monthStr = t.date.substring(0, 7);

      // Aggregates
      if (isCredit) balance += val;
      else balance -= val;

      if (monthStr === currentMonthPrefix) {
        if (isCredit) mCredit += val;
        else mDebit += val;
      }

      // Chart Data
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { name: monthStr, Income: 0, Expenses: 0 };
      }
      if (isCredit) monthlyMap[monthStr].Income += val;
      else monthlyMap[monthStr].Expenses += val;
    });

    // Sort chart data chronologically
    const sortedChart = Object.values(monthlyMap).sort((a, b) => a.name.localeCompare(b.name));

    return { totalBalance: balance, monthlyCredit: mCredit, monthlyDebit: mDebit, chartData: sortedChart };
  }, [transactions, currentMonthPrefix]);


  if (status === 'login') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-md w-full relative z-10 shadow-[0_0_50px_rgba(34,197,94,0.15)]"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <Lock className="text-green-400" size={32} />
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
                className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50 transition-colors"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50 transition-colors"
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
              className="w-full py-4 mt-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
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
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                <Activity className="text-green-400" size={20} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Finance Ops</h1>
            </div>
            <p className="text-zinc-400">High-level enterprise expenditure and revenue tracking.</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-2"
          >
            <Plus size={20} /> New Transaction
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-green-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[40px]" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <DollarSign className="text-green-400" size={24} />
              </div>
              <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Net Balance</h3>
            </div>
            <p className="text-5xl font-black text-white tracking-tight">${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          
          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Monthly Revenue</h3>
                <p className="text-xs text-purple-400 font-mono mt-0.5">Current Month</p>
              </div>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">${monthlyCredit.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>

          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-red-500/50 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                <TrendingDown className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Monthly Burn</h3>
                <p className="text-xs text-red-400 font-mono mt-0.5">Current Month</p>
              </div>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">${monthlyDebit.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        {/* Chart & Table Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="xl:col-span-2 bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Cash Flow Analytics</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" tick={{fill: '#ffffff50'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" tick={{fill: '#ffffff50'}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0C0C12', borderColor: '#ffffff20', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Income" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ledger */}
          <div className="bg-[#0C0C12]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col h-[500px] xl:h-auto">
            <h3 className="text-xl font-bold text-white mb-6">Recent Ledger</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-zinc-500">No transactions recorded yet.</p>
                </div>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 group relative overflow-hidden">
                    {/* Delete overlay on hover */}
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-2 bg-red-500/20 text-red-400 rounded-lg transition-all hover:bg-red-500/40 z-10"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-bold">{t.description}</p>
                        <p className="text-zinc-400 text-sm mt-0.5">{t.source_destination}</p>
                      </div>
                      <p className={`font-black text-lg ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'credit' ? '+' : '-'}${t.amount.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider truncate max-w-[150px]">
                        {t.category}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                        <Calendar size={12} /> {t.date}
                      </span>
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
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Amount (USD)</label>
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
                      className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 appearance-none"
                    >
                      {CATEGORIES[type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">{type === 'credit' ? 'Received From' : 'Paid To'}</label>
                  <input
                    type="text"
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder={type === 'credit' ? "e.g. Client X" : "e.g. AWS"}
                    className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

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
