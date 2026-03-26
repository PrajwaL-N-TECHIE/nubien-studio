import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePerformance } from "@/context/PerformanceContext";

interface MagneticProps {
    children: React.ReactNode;
    strength?: number;
    scale?: number;
    className?: string;
    onClick?: () => void;
}

const Magnetic = ({
    children,
    strength = 0.4,
    scale = 1.05,
    className = "",
    onClick
}: MagneticProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { isLowEnd } = usePerformance();

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const mouseX = useSpring(x, springConfig);
    const mouseY = useSpring(y, springConfig);

    const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
    const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current || isLowEnd) return;
        const { clientX, clientY } = e;
        const { width, height, left, top } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        x.set((clientX - centerX) * strength);
        y.set((clientY - centerY) * strength);
    };

    const handleMouseLeave = () => {
        if (isLowEnd) return;
        x.set(0);
        y.set(0);
    };

    // If low end, just return basic motion div with hover scale
    if (isLowEnd) {
        return (
            <motion.div
                ref={ref}
                onClick={onClick}
                whileHover={{ scale }}
                whileTap={{ scale: 0.95 }}
                className={`inline-block cursor-pointer transition-colors ${className}`}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                x: mouseX,
                y: mouseY,
                rotateX,
                rotateY,
                transformPerspective: 1000,
            }}
            whileHover={{ scale }}
            whileTap={{ scale: 0.95 }}
            className={`inline-block cursor-pointer transition-colors ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default Magnetic;
