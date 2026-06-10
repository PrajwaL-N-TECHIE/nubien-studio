const fs = require('fs');
let file = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

// 1. Add imports
file = file.replace(
  'import { usePerformance } from "@/context/PerformanceContext";',
  'import { usePerformance } from "@/context/PerformanceContext";\nimport { useNavigate } from "react-router-dom";\nimport { db } from "@/lib/firebase";\nimport { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";'
);

// 2. Remove const STUDENT = {...}; and VAULT_RESOURCES
file = file.replace(/const STUDENT = \{[\s\S]*?\};\n/, '');
file = file.replace(/const VAULT_RESOURCES = \[(?:[^\]]+|\](?!\;))*\];\n/, '');

// 3. Create global helper for mock fallback
const helpers = `
interface Material {
  id: string;
  title: string;
  type: string;
  url: string;
  cohort: string;
}

const getStudent = () => {
  const auth = sessionStorage.getItem("studentAuth");
  if(auth) return JSON.parse(auth);
  return { name: "Alex Developer", track: "Full Stack Engineer", xp: 4250, progress: 65, nextSession: "Tomorrow, 6:00 PM EST", rank: 3, cohort: "batch-1", id: "demo" };
};
`;

file = file.replace('// --- SUB-COMPONENTS ---', helpers + '\n// --- SUB-COMPONENTS ---');

// 4. Replace STUDENT. with getStudent(). in all sub-components
file = file.replace(/STUDENT\./g, 'getStudent().');

// 5. Rewrite Vault to fetch materials
const newVault = `
const Vault = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const student = getStudent();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        if(!student.cohort) return;
        const q = query(collection(db, "materials"), where("cohort", "==", student.cohort));
        const snap = await getDocs(q);
        const data: Material[] = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Material));
        setMaterials(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMaterials();
  }, []);

  const handleOpenMaterial = async (mat: Material) => {
    try {
      await addDoc(collection(db, "access_logs"), {
        material_id: mat.id,
        material_title: mat.title,
        student_id: student.id || "demo",
        student_name: student.name,
        accessed_at: serverTimestamp()
      });
      window.open(mat.url, "_blank");
    } catch(err) {
      window.open(mat.url, "_blank");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">The Vault</h2>
          <p className="text-zinc-400 text-sm mt-1">Access all your cohort's documents, links, and slides.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {materials.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No materials uploaded yet.</div>
        ) : materials.map((res) => {
          let Icon = FileText;
          if(res.type === 'video') Icon = PlayCircle;
          if(res.type === 'link') Icon = Code2;

          return (
            <div key={res.id} className="flex items-center justify-between p-5 rounded-2xl border bg-[#0C0C12]/80 border-white/10 hover:border-purple-500/30 transition-all cursor-pointer group" onClick={() => handleOpenMaterial(res)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Icon size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{res.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-mono">
                    {res.type}
                  </p>
                </div>
              </div>
              <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
`;

file = file.replace(/const Vault = \(\) => \([\s\S]*?\);\n\nconst Leaderboard = \(\) => \(/, newVault + '\nconst Leaderboard = () => (');

// 6. Fix StudentDashboard component
file = file.replace(
  'export default function StudentDashboard() {\n  const [activeTab, setActiveTab] = useState(\'mission\');',
  'export default function StudentDashboard() {\n  const [activeTab, setActiveTab] = useState(\'mission\');\n  const navigate = useNavigate();\n\n  useEffect(() => {\n    if(!sessionStorage.getItem("studentAuth")) {\n      navigate("/student-login");\n    }\n  }, [navigate]);'
);

file = file.replace(
  'onClick={() => window.location.href = \'/\'}',
  'onClick={() => { sessionStorage.removeItem("studentAuth"); navigate("/student-login"); }}'
);

fs.writeFileSync('src/pages/StudentDashboard.tsx', file);
console.log('Refactored StudentDashboard successfully');
