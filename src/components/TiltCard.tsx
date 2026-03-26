import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    tiltReverse?: boolean;
}

/**
 * TiltCard
 * A premium 3D tilt component that responds to mouse movement.
 */
const TiltCard = ({ children, className = "", tiltReverse = false }: TiltCardProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], tiltReverse ? ["15deg", "-15deg"] : ["-15deg", "15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], tiltReverse ? ["-15deg", "15deg"] : ["15deg", "-15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = (mouseX / width) - 0.5;
        const yPct = (mouseY / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className={`relative ${className}`}
        >
            <div
                style={{
                    transform: isHovered ? "translateZ(50px)" : "translateZ(0px)",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.3s ease-out"
                }}
                className="h-full w-full"
            >
                {children}
            </div>

            {/* Dynamic Shine Effect */}
            <motion.div
                style={{
                    background: useTransform(
                        [mouseXSpring, mouseYSpring],
                        ([xm, ym]: any) => `radial-gradient(circle at ${50 + xm * 100}% ${50 + ym * 100}%, rgba(255,255,255,0.1) 0%, transparent 80%)`
                    ),
                    opacity: isHovered ? 1 : 0,
                }}
                className="absolute inset-0 pointer-events-none rounded-[32px] overflow-hidden"
            />
        </motion.div>
    );
};

export default TiltCard;
