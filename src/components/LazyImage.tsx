import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string;
}

const LazyImage = ({ src, alt, className = "", aspectRatio = "aspect-video" }: LazyImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showBlur, setShowBlur] = useState(true);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setIsLoaded(true);
            setTimeout(() => setShowBlur(false), 800); // Wait for fade in
        };
    }, [src]);

    return (
        <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
            {/* Tiny Placeholder / Blur Surface */}
            <AnimatePresence>
                {showBlur && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-10 bg-zinc-900 flex items-center justify-center"
                    >
                        {/* Pulsing loading state */}
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent blur-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Image */}
            <motion.img
                src={src}
                alt={alt}
                initial={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
                animate={isLoaded ? {
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)"
                } : {}}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default LazyImage;
