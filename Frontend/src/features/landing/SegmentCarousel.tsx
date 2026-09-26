"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { TbChevronLeft, TbChevronRight, TbCircleArrowRight } from "react-icons/tb";
import { cn } from "@/lib/cn";
import { segments } from "./segments";

const withPhoto = segments.filter((segment) => segment.image);
const loop = [...withPhoto, ...withPhoto];
/** Continuous drift speed, in px per second. */
const SPEED = 45;

/**
 * Segment photo carousel in the style of housecallpro.com: compact landscape
 * cards drifting continuously (seamless loop), arrows and dots underneath.
 * Pauses while hovered; arrows/dots glide to a card and the drift resumes.
 */
export function SegmentCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const offset = useRef(0);
  const target = useRef<number | null>(null);
  const hovered = useRef(false);
  const [active, setActive] = useState(0);

  /** Width of one card plus the gap. */
  const step = useCallback(() => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return 0;
    return card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || "0");
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let current = -1;

    const tick = (now: number) => {
      const track = trackRef.current;
      const size = step();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      if (track && size) {
        const half = size * withPhoto.length;
        if (target.current !== null) {
          offset.current += (target.current - offset.current) * Math.min(1, dt * 8);
          if (Math.abs(target.current - offset.current) < 0.5) {
            offset.current = target.current;
            target.current = null;
          }
        } else if (!hovered.current) {
          offset.current += SPEED * dt;
        }

        // seamless loop: the list is rendered twice
        if (offset.current >= half) {
          offset.current -= half;
          if (target.current !== null) target.current -= half;
        } else if (offset.current < 0) {
          offset.current += half;
          if (target.current !== null) target.current += half;
        }

        track.style.transform = `translate3d(${-offset.current}px, 0, 0)`;

        const index = Math.round(offset.current / size) % withPhoto.length;
        if (index !== current) {
          current = index;
          setActive(index);
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [step]);

  /** Glide to a card: `delta` cards from the current position. */
  function glide(delta: number) {
    const size = step();
    if (!size) return;
    target.current = (Math.round(offset.current / size) + delta) * size;
  }

  function goTo(index: number) {
    const size = step();
    if (!size) return;
    const currentIndex = Math.round(offset.current / size) % withPhoto.length;
    glide(index - currentIndex);
  }

  return (
    <div
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    >
      <div className="overflow-hidden">
        <ul
          ref={trackRef}
          aria-label="Segmentos atendidos"
          className="flex w-max gap-4 px-4 will-change-transform sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
        >
          {loop.map((segment, index) => {
            const clone = index >= withPhoto.length;
            return (
              <li
                key={`${segment.id}-${index}`}
                aria-hidden={clone || undefined}
                className="group relative h-36 w-60 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg sm:h-40 sm:w-64"
              >
                <a
                  href="#segmentos"
                  tabIndex={clone ? -1 : undefined}
                  className="relative block h-full w-full"
                  aria-label={segment.name}
                >
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
            );
          })}
        </ul>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => glide(-1)}
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
                "h-2 w-2 rounded-full transition-all duration-300",
                index === active ? "bg-white ring-2 ring-white/40" : "bg-white/35 hover:bg-white/70",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => glide(1)}
          aria-label="Próximo segmento"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <TbChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
