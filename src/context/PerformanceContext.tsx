import { useState, useEffect, createContext, useContext } from "react";

type PerformanceLevel = "potato" | "standard" | "ultra";

interface PerformanceContextType {
    level: PerformanceLevel;
    isLowEnd: boolean;
    batterySaver: boolean;
    dpr: [number, number];
}

const PerformanceContext = createContext<PerformanceContextType>({
    level: "standard",
    isLowEnd: false,
    batterySaver: false,
    dpr: [1, 2],
});

export const usePerformance = () => useContext(PerformanceContext);

export const PerformanceProvider = ({ children }: { children: React.ReactNode }) => {
    const [level, setLevel] = useState<PerformanceLevel>("standard");
    const [batterySaver, setBatterySaver] = useState<boolean>(false);
    const [dpr, setDpr] = useState<[number, number]>([1, 2]);

    useEffect(() => {
        let isMounted = true;

        const detectPerformance = async () => {
            // 1. Check Hardware Concurrency (CPU Cores)
            const cores = navigator.hardwareConcurrency || 4;

            // 2. Check Device Memory (if available in Chrome/Edge)
            const memory = (navigator as any).deviceMemory || 4;

            // 3. Check for low-end indicators
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            // 4. Data Saver Detection
            const connection = (navigator as any).connection;
            const isDataSaver = connection?.saveData === true;
            const isSlowNetwork = connection?.effectiveType === '2g' || connection?.effectiveType === '3g';

            // 5. Battery Saver Detection
            let isBatterySaver = false;
            try {
                if ('getBattery' in navigator) {
                    const battery: any = await (navigator as any).getBattery();
                    if (!battery.charging && battery.level <= 0.20) {
                        isBatterySaver = true;
                    }
                }
            } catch (e) {
                // Ignore battery API errors
            }

            if (!isMounted) return;

            let detectedLevel: PerformanceLevel = "standard";
            
            // Aggressive fallback to potato for mobile, slow networks, or battery saver
            if (cores <= 4 || memory <= 4 || isMobile || isDataSaver || isSlowNetwork || isBatterySaver) {
                detectedLevel = "potato";
            } else if (cores >= 8 && memory >= 8) {
                detectedLevel = "ultra";
            }

            const finalDpr: [number, number] = detectedLevel === "potato" ? [0.5, 1] : [1, 2];

            console.log(`[PerformanceGuard] Tier: ${detectedLevel} | BatterySaver: ${isBatterySaver} | DPR: ${finalDpr}`);
            setLevel(detectedLevel);
            setBatterySaver(isBatterySaver);
            setDpr(finalDpr);
        };

        detectPerformance();
        
        return () => { isMounted = false; };
    }, []);

    return (
        <PerformanceContext.Provider value={{ 
            level, 
            isLowEnd: level === "potato",
            batterySaver,
            dpr
        }}>
            {children}
        </PerformanceContext.Provider>
    );
};
