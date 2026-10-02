import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ExternalRedirectProps {
  url: string;
  title: string;
}

export const ExternalRedirect = ({ url, title }: ExternalRedirectProps) => {
  useEffect(() => {
    // Immediate replace so history stack is preserved cleanly
    window.location.replace(url);
  }, [url]);

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center text-white px-4">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
      <h2 className="text-xl font-bold mb-2">Redirecting to {title}...</h2>
      <p className="text-zinc-400 text-sm mb-6">If you are not redirected automatically, click below.</p>
      <a
        href={url}
        className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/25"
      >
        Continue to {title} &rarr;
      </a>
    </div>
  );
};

export default ExternalRedirect;
