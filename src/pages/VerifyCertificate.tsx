import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, ShieldCheck, ArrowLeft, ArrowRight, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { audio } from "@/utils/audio";
import SEO from "@/components/SEO";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

interface VerificationData {
  name: string;
  track: string;
  registration_id: string;
}

const normalizeRegistrationId = (id: string): string => {
  let clean = id.trim().toUpperCase().replace(/\s+/g, "");
  
  // Extract number from the end of ID if present
  const match = clean.match(/\d+$/);
  const num = match ? match[0] : "";
  
  if (clean.includes("AI-A") || clean.includes("AIA") || clean.includes("AI_A") || clean.includes("AI-ARCH") || clean.includes("AI_ARCH") || clean.includes("AIARCH")) {
    return num ? `BLDCY-AI_A-${num}` : clean;
  }
  
  if (clean.includes("FULL") || clean.includes("STACK")) {
    return num ? `BLDCY-FULL-${num}` : clean;
  }

  if (clean.includes("UIUX") || clean.includes("UI-UX") || clean.includes("UI_UX")) {
    return num ? `BLDCY-UIUX-${num}` : clean;
  }

  if (clean.includes("BLOC") || clean.includes("BLOCK") || clean.includes("CHAIN")) {
    return num ? `BLDCY-BLOC-${num}` : clean;
  }

  return clean;
};

const VerifyCertificate = () => {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState(false);
  const [pdfExists, setPdfExists] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [renderingPdf, setRenderingPdf] = useState(false);
  const [renderStatus, setRenderStatus] = useState("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();

  const renderPdfToCanvas = async (url: string) => {
    setRenderingPdf(true);
    setRenderError(null);
    setRenderStatus("Initializing PDF worker...");
    try {
      // Initialize PDF worker
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      }

      setRenderStatus("Fetching E-Certificate PDF...");
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch certificate: HTTP status ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();

      setRenderStatus("Loading document...");
      let loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      let pdf;
      try {
        pdf = await loadingTask.promise;
      } catch (err: any) {
        console.warn("Primary PDF worker failed, trying CDN fallback...", err);
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdf = await loadingTask.promise;
      }
      const page = await pdf.getPage(1);

      setRenderStatus("Rendering page onto preview canvas...");
      const viewport = page.getViewport({ scale: 1.8 });
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const canvasContext = canvas.getContext("2d");
        if (canvasContext) {
          canvasContext.clearRect(0, 0, canvas.width, canvas.height);
          await page.render({
            canvasContext,
            viewport
          }).promise;
          setRenderStatus("Render complete!");
        } else {
          throw new Error("Could not acquire 2D canvas context.");
        }
      } else {
        throw new Error("Canvas element is not loaded in DOM.");
      }
    } catch (err: any) {
      console.error("PDF canvas render error:", err);
      setRenderError(err.message || String(err));
    } finally {
      setRenderingPdf(false);
    }
  };

  useEffect(() => {
    if (pdfExists && pdfUrl && canvasRef.current) {
      renderPdfToCanvas(pdfUrl);
    }
  }, [pdfExists, pdfUrl]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedId = normalizeRegistrationId(searchId);
    if (!normalizedId) return;

    setLoading(true);
    setError(false);
    setResult(null);
    setPdfExists(false);
    setPdfUrl("");
    setRenderError(null);
    setRenderStatus("");

    let dbData: VerificationData | null = null;
    let localPdfFound = false;
    let targetPdfUrl = "";

    // 1. Check static PDF in public directory
    const encodedFolder = "/images/e%20-certificate%20(batch2%20)";
    const pdfPath = `${encodedFolder}/${encodeURIComponent(normalizedId)}.pdf`;

    try {
      const pdfRes = await fetch(pdfPath);
      // Vite dev server and production hosting redirect missing assets (404) to index.html fallback.
      // A valid PDF resource response URL must end with '.pdf'.
      if (pdfRes.ok && pdfRes.url.toLowerCase().endsWith(".pdf")) {
        localPdfFound = true;
        targetPdfUrl = pdfPath;
      }
    } catch (err) {
      console.warn("Static PDF fetch error:", err);
    }

    // 2. Fetch student info directly from Firebase Firestore ("internships" and "internships_temp")
    try {
      let snap = await getDocs(query(collection(db, "internships"), where("registration_id", "==", normalizedId)));
      if (snap.empty) {
        snap = await getDocs(query(collection(db, "internships_temp"), where("registration_id", "==", normalizedId)));
      }

      if (!snap.empty) {
        const docData = snap.docs[0].data();
        dbData = {
          name: docData.name || "Buildicy Graduate",
          track: "AI Architect", // ALL STUDENTS ARE AI ARCHITECT
          registration_id: docData.registration_id || normalizedId
        };
      }
    } catch (err) {
      console.warn("Firestore lookup failed:", err);
    }

    if (localPdfFound || dbData) {
      if (localPdfFound) {
        setPdfExists(true);
        setPdfUrl(targetPdfUrl);
      }

      if (dbData) {
        setResult(dbData);
      } else {
        // PDF exists in static files, but no Firestore record exists (Batch 2 historical)
        setResult({
          name: "Buildicy Graduate (Batch 2)",
          track: "AI Architect", // ALL STUDENTS ARE AI ARCHITECT
          registration_id: normalizedId
        });
      }

      audio.playSuccess();
    } else {
      setError(true);
      audio.playError();
    }

    setLoading(false);
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${result?.registration_id || "certificate"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Direct download failed", err);
      window.open(pdfUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Verify Certificate | Buildicy Internships"
        description="Verify the authenticity of a Buildicy Internship Certificate. Enter the unique ID to confirm the graduate's credentials and program track."
        canonicalUrl="/verify"
      />
      <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden bg-[#050507]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-xl mx-auto relative z-10">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-purple-900/30 rounded-full border border-purple-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <ShieldCheck size={40} className="text-purple-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Credential Verification & E-Certificate</h1>
          <p className="text-white/60">Enter your Buildicy Registration ID to verify your credentials and download your E-Certificate.</p>
        </div>

        <form onSubmit={handleVerify} className="relative mb-12 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors" size={24} />
          <input 
            type="text"
            placeholder="e.g. BLDCY-UIUX-4921"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            className="w-full bg-[#0a0a0f] border-2 border-white/10 rounded-2xl py-6 pl-16 pr-40 text-white text-lg placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors uppercase font-['DM_Mono']"
          />
          <button 
            type="submit"
            disabled={loading || !searchId.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Verify <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-green-900/10 border-2 border-green-500/30 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0" />
              
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Verified Authentic</h2>
              <p className="text-green-400 font-medium mb-8">This registration ID is valid.</p>
              
              <div className="bg-[#050507]/50 rounded-2xl p-6 text-left border border-white/5 space-y-4">
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold mb-1">Intern Name</p>
                  <p className="text-lg font-bold text-white">{result.name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold mb-1">Program Track</p>
                  <p className="text-white/90">AI Architect</p>
                </div>
              </div>

              {pdfExists ? (
                <div className="mt-8 space-y-6 text-left">
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">E-Certificate Preview</p>
                      <a 
                        href={pdfUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors font-medium"
                      >
                        Open Fullscreen <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0f] p-2 min-h-[250px] shadow-2xl flex flex-col items-center justify-center">
                      {renderingPdf && (
                        <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                          <Loader2 size={28} className="animate-spin text-purple-400" />
                          <p className="text-xs font-medium text-white/60">{renderStatus}</p>
                        </div>
                      )}
                      
                      {renderError && (
                        <div className="p-6 text-center text-red-400 flex flex-col items-center gap-3 bg-red-950/20 rounded-xl border border-red-500/20 w-full">
                          <AlertCircle size={32} />
                          <p className="font-semibold">Certificate Preview Error</p>
                          <p className="text-xs text-red-300/80">{renderError}</p>
                          <a 
                            href={pdfUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-4 py-2 bg-purple-600/30 text-purple-300 hover:bg-purple-600/40 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors mt-2"
                          >
                            Open Certificate PDF Directly <ExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      <canvas 
                        ref={canvasRef} 
                        className={`w-full h-auto rounded-xl border border-white/10 shadow-lg bg-white ${renderError ? "hidden" : "block"}`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95 duration-200"
                  >
                    {downloading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download size={20} className="group-hover:translate-y-0.5 transition-transform duration-200" />
                        Download E-Certificate (PDF)
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="mt-6 p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-left">
                  <p className="text-sm text-purple-300">
                    💡 <strong>Note:</strong> Your internship credentials are verified! The downloadable E-Certificate is currently being processed and will be available here shortly.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-900/10 border-2 border-red-500/30 rounded-3xl p-8 backdrop-blur-xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Record Not Found</h2>
              <p className="text-red-400 font-medium">No internship registration exists with this ID.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
    </>
  );
};

export default VerifyCertificate;
