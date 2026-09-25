"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { TbChevronLeft, TbChevronRight, TbCircleArrowRight } from "react-icons/tb";
import { cn } from "@/lib/cn";
import { segments } from "./segments";

const withPhoto = segments.filter((segment) => segment.image);
const AUTOPLAY_MS = 3500;

/**
 * Segment photo carousel in the style of housecallpro.com: compact landscape
 * cards, arrows and dots underneath. Scroll-snap based, so it can also be
 * swiped; autoplays (paused on hover/focus and with reduced motion).
 */
export function SegmentCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const step = useCallback(() => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    return card.getBoundingClientRect().width + gap;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const count = withPhoto.length;
      let next = (index + count) % count;
      // moving forward when the track can't scroll any further: wrap to the start
      if (index > active && track.scrollLeft >= maxScroll - 1) next = 0;
      track.scrollTo({ left: Math.min(next * step(), maxScroll), behavior: "smooth" });
      setActive(next);
    },
    [active, step],
  );

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => goTo(active + 1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [active, paused, goTo]);

  function onScroll() {
    const track = trackRef.current;
    const size = step();
    if (!track || !size) return;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    setActive(atEnd ? Math.max(active, Math.round(track.scrollLeft / size)) : Math.round(track.scrollLeft / size));
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul
        ref={trackRef}
        onScroll={onScroll}
        aria-label="Segmentos atendidos"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 [scrollbar-width:none] sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] [&::-webkit-scrollbar]:hidden"
      >
        {withPhoto.map((segment) => (
          <li
            key={segment.id}
            className="group relative h-36 w-60 shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 shadow-lg sm:h-40 sm:w-64"
          >
            <a href="#segmentos" className="relative block h-full w-full" aria-label={segment.name}>
              <Image
                src={segment.image!}
                alt=""
                fill
                sizes="256px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#140d2b]/90 via-[#140d2b]/25 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
                <span className="text-base font-bold leading-tight text-white">{segment.short}</span>
                <TbCircleArrowRight className="h-6 w-6 shrink-0 text-white/90" />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="Segmento anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <TbChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {withPhoto.map((segment, index) => (
            <button
              key={segment.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir para ${segment.short}`}
              aria-current={index === active || undefined}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === active ? "w-2 bg-white ring-2 ring-white/40" : "w-2 bg-white/35 hover:bg-white/70",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="Próximo segmento"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <TbChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
