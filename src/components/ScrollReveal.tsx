"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.02, rootMargin: "0px 0px 180px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`scroll-reveal ${visible ? "scroll-reveal-visible" : ""} ${className}`} style={{ "--reveal-delay": `${Math.min(delay, 100)}ms` } as CSSProperties}>{children}</div>;
}
