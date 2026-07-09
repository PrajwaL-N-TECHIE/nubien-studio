import { useLayoutEffect, useRef, useCallback, ReactNode } from 'react';
import './ScrollStack.css';

interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
}

export const ScrollStackItem = ({ children, itemClassName = '' }: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  useNativeScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}: ScrollStackProps) => {
  const cardsRef = useRef<HTMLElement[]>([]);
  const topsRef = useRef<number[]>([]);
  const heightsRef = useRef<number[]>([]);
  const transformsRef = useRef<Map<number, any>>(new Map());
  const stackCompletedRef = useRef(false);
  const rafRef = useRef(0);
  const scrollYRef = useRef(0);

  const update = useCallback(() => {
    const cards = cardsRef.current;
    const tops = topsRef.current;
    const heights = heightsRef.current;
    if (!cards.length) return;

    const scrollY = scrollYRef.current;
    const vh = window.innerHeight;
    const stackPosPx = (parseFloat(stackPosition) / 100) * vh;
    const scaleEndPx = (parseFloat(scaleEndPosition) / 100) * vh;

    const lastCardBottom = tops[tops.length - 1] + heights[heights.length - 1];
    const endZone = lastCardBottom - vh * 0.3;

    let topCardIndex = -1;
    if (blurAmount) {
      for (let j = 0; j < cards.length; j++) {
        if (scrollY >= tops[j] - stackPosPx - itemStackDistance * j) topCardIndex = j;
      }
    }

    for (let i = 0; i < cards.length; i++) {
      const cardTop = tops[i];
      const triggerStart = cardTop - stackPosPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPx;

      const progress = scrollY < triggerStart ? 0 : scrollY > triggerEnd ? 1 : (scrollY - triggerStart) / (triggerEnd - triggerStart);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - progress * (1 - targetScale);
      const blur = blurAmount && i < topCardIndex ? Math.max(0, (topCardIndex - i) * blurAmount) : 0;

      let translateY = 0;
      if (scrollY >= triggerStart) {
        translateY = Math.min(
          scrollY - cardTop + stackPosPx + itemStackDistance * i,
          endZone - cardTop + stackPosPx + itemStackDistance * i
        );
      }

      const newT = {
        translateY: Math.round(translateY),
        scale: Math.round(scale * 1000) / 1000,
        blur: Math.round(blur * 100) / 100,
      };

      const last = transformsRef.current.get(i);
      const changed = !last
        || Math.abs(last.translateY - newT.translateY) >= 2
        || Math.abs(last.scale - newT.scale) > 0.001
        || last.blur !== newT.blur;

      if (changed) {
        cards[i].style.transform = `translate3d(0, ${newT.translateY}px, 0) scale(${newT.scale})`;
        cards[i].style.filter = newT.blur > 0 ? `blur(${newT.blur}px)` : '';
        transformsRef.current.set(i, newT);
      }

      if (i === cards.length - 1) {
        const inView = scrollY >= triggerStart && scrollY <= endZone;
        if (inView && !stackCompletedRef.current) { stackCompletedRef.current = true; onStackComplete?.(); }
        else if (!inView && stackCompletedRef.current) stackCompletedRef.current = false;
      }
    }
  }, [itemScale, itemStackDistance, stackPosition, scaleEndPosition, baseScale, blurAmount, onStackComplete]);

  useLayoutEffect(() => {
    if (!useWindowScroll) return;

    const cardElements = Array.from(
      document.querySelectorAll('.scroll-stack-card')
    ) as HTMLElement[];
    cardsRef.current = cardElements;

    cardElements.forEach((card, i) => {
      if (i < cardElements.length - 1) card.style.marginBottom = `${itemDistance}px`;
    });

    // Cache positions ONCE — never re-read during scroll
    const cache = () => {
      topsRef.current = cardElements.map((c) => c.getBoundingClientRect().top + window.scrollY);
      heightsRef.current = cardElements.map((c) => c.offsetHeight);
    };
    cache();
    update();

    // Persistent RAF loop — reads from scrollYRef
    const loop = () => {
      scrollYRef.current = window.scrollY;
      update();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener('resize', cache);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', cache);
      cardsRef.current = [];
      transformsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWindowScroll]);

  return <>{children}</>;
};

export default ScrollStack;
