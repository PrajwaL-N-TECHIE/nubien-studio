import React, { useState, useEffect } from "react";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Edit2, Trash2, Plus, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { QUESTIONS as SEED_QUESTIONS } from "@/data/questions";

interface Question {
  id: string;
  topic: string;
  difficulty: string;
  question: string;
  options: string[];
  answer: number;
}

const AdminCrucible = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Question>>({
    topic: "",
    difficulty: "Medium",
    question: "",
    options: ["", "", "", ""],
    answer: 0
  });

  const fetchQuestions = async () => {
    try {
      const q = query(collection(db, "crucible_questions"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      const data: Question[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Question));
      setQuestions(data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSeed = async () => {
    if (!window.confirm("This will migrate the 100 hardcoded questions into the database. Are you sure?")) return;
    setIsSeeding(true);
    try {
      for (const q of SEED_QUESTIONS) {
        await addDoc(collection(db, "crucible_questions"), {
          ...q,
          created_at: serverTimestamp()
        });
      }
      alert("Seeding complete! 100 questions added.");
      fetchQuestions();
    } catch (err) {
      console.error("Failed to seed", err);
      alert("Failed to seed database.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteDoc(doc(db, "crucible_questions", id));
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error("Error deleting", err);
      alert("Failed to delete.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || formData.options?.some(o => !o) || !formData.topic) {
      alert("Please fill all fields.");
      return;
    }

    try {
      if (isEditing) {
        await updateDoc(doc(db, "crucible_questions", isEditing), {
          ...formData
        });
        setIsEditing(null);
      } else {
        await addDoc(collection(db, "crucible_questions"), {
          ...formData,
          created_at: serverTimestamp()
        });
      }
      setFormData({ topic: "", difficulty: "Medium", question: "", options: ["", "", "", ""], answer: 0 });
      fetchQuestions();
    } catch (err) {
      console.error("Error saving", err);
      alert("Failed to save question.");
    }
  };

  const handleEdit = (q: Question) => {
    setIsEditing(q.id);
    setFormData({
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: [...q.options],
      answer: q.answer
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = val;
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) return <div className="text-center text-zinc-500 py-20 font-mono animate-pulse">Loading Crucible Data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Form Section */}
      <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="text-red-500" /> {isEditing ? "Edit Question" : "Add New Question"}
          </h2>
          {isEditing && (
            <button 
              onClick={() => {
                setIsEditing(null);
                setFormData({ topic: "", difficulty: "Medium", question: "", options: ["", "", "", ""], answer: 0 });
              }}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Topic</label>
              <input 
                type="text" 
                value={formData.topic} 
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. AI Architect, Full Stack, React..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Difficulty</label>
              <select 
                value={formData.difficulty} 
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 appearance-none"
              >
                <option value="Easy" className="bg-[#0a0a0f]">Easy</option>
                <option value="Medium" className="bg-[#0a0a0f]">Medium</option>
                <option value="Hard" className="bg-[#0a0a0f]">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Question Text</label>
            <textarea 
              value={formData.question} 
              onChange={e => setFormData({ ...formData, question: e.target.value })}
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              placeholder="Enter the question here..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Options (Select the correct one)</label>
            {formData.options?.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="correct_answer" 
                  checked={formData.answer === idx}
                  onChange={() => setFormData({ ...formData, answer: idx })}
                  className="w-5 h-5 accent-red-500 cursor-pointer"
                />
                <input 
                  type="text" 
                  value={opt} 
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${['A','B','C','D'][idx]}`}
                  className={`flex-1 bg-white/5 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 ${formData.answer === idx ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                />
              </div>
            ))}
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)]"
          >
            {isEditing ? <CheckCircle2 size={18} /> : <Plus size={18} />}
            {isEditing ? "Update Question" : "Add Question"}
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white mb-1">Question Bank ({questions.length})</h3>
            <p className="text-xs text-zinc-500">Manage all questions that appear in The Crucible.</p>
          </div>
          {questions.length === 0 && (
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold hover:bg-purple-600/30 transition-colors"
            >
              {isSeeding ? "Seeding..." : "Seed Initial 100 Questions"}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Topic</th>
                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Question</th>
                <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 bg-white/5 rounded text-xs font-mono text-zinc-300">
                      {q.topic}
                    </span>
                    <div className="text-[10px] uppercase text-zinc-500 mt-1 font-bold">{q.difficulty}</div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-white line-clamp-2">{q.question}</p>
                    <p className="text-xs text-green-400 mt-1 line-clamp-1">Answer: {q.options[q.answer]}</p>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => handleEdit(q)}
                      className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors inline-flex"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors inline-flex"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-zinc-500">
                    <AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No questions in database.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminCrucible;
