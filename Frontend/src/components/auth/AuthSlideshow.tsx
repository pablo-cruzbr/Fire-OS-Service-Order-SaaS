"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type AuthSlide = { src: string; label: string };

/**
 * Cross-fading photos of service professionals for the auth side panel.
 * Advances every few seconds; stays on the first photo with reduced motion.
 */
export function AuthSlideshow({ slides, interval = 6000 }: { slides: AuthSlide[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), interval);
    return () => window.clearInterval(timer);
  }, [slides.length, interval]);

  return (
    <>
      <div aria-hidden className="absolute inset-0 -z-20">
        {slides.map((slide, slideIndex) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="(min-width: 1024px) 60vw, 0px"
            className={cn(
              "object-cover transition-opacity duration-[1200ms] ease-in-out",
              slideIndex === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {slides[index]?.label}
        </span>
        <div className="flex gap-1.5" role="tablist" aria-label="Fotos">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={slide.label}
              onClick={() => setIndex(slideIndex)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                slideIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}
