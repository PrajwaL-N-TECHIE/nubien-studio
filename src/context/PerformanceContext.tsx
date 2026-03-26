import { useState, useEffect, createContext, useContext } from "react";

type PerformanceLevel = "potato" | "standard" | "ultra";

interface PerformanceContextType {
    level: PerformanceLevel;
    isLowEnd: boolean;
}

const PerformanceContext = createContext<PerformanceContextType>({
    level: "standard",
    isLowEnd: false,
});

export const usePerformance = () => useContext(PerformanceContext);

export const PerformanceProvider = ({ children }: { children: React.ReactNode }) => {
    const [level, setLevel] = useState<PerformanceLevel>("standard");

    useEffect(() => {
        const detectPerformance = () => {
            // 1. Check Hardware Concurrency (CPU Cores)
            const cores = navigator.hardwareConcurrency || 4;

            // 2. Check Device Memory (if available in Chrome/Edge)
            const memory = (navigator as any).deviceMemory || 4;

            // 3. Check for low-end indicators
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            let detectedLevel: PerformanceLevel = "standard";

            if (cores <= 4 || memory <= 4 || isMobile) {
                detectedLevel = "potato";
            } else if (cores >= 8 && memory >= 8) {
                detectedLevel = "ultra";
            }

            console.log(`[PerformanceGuard] Detected Level: ${detectedLevel} (Cores: ${cores}, Memory: ${memory})`);
            setLevel(detectedLevel);
        };

        detectPerformance();
    }, []);

    return (
        <PerformanceContext.Provider value={{ level, isLowEnd: level === "potato" }}>
            {children}
        </PerformanceContext.Provider>
    );
};
