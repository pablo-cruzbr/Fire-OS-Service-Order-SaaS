import Image from "next/image";
import { segments } from "./segments";

const withPhoto = segments.filter((segment) => segment.image);

/**
 * Endless, CSS-only carousel of segment photos (the list is rendered twice and
 * shifted by -50%). Pauses on hover; with reduced motion it becomes a plain
 * horizontally scrollable row.
 */
export function SegmentCarousel() {
  return (
    <div
      className="group relative overflow-hidden motion-reduce:overflow-x-auto"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <ul className="flex w-max animate-marquee gap-5 py-2 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[...withPhoto, ...withPhoto].map((segment, index) => {
          const clone = index >= withPhoto.length;
          return (
            <li
              key={`${segment.id}-${index}`}
              aria-hidden={clone || undefined}
              className="relative h-64 w-[240px] shrink-0 overflow-hidden rounded-2xl shadow-md sm:h-72 sm:w-[280px] dark:shadow-dark-md"
            >
              <Image
                src={segment.image!}
                alt={clone ? "" : segment.name}
                fill
                sizes="280px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140d2b]/85 via-[#140d2b]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xl text-white backdrop-blur">
                  {segment.icon}
                </span>
                <span className="text-sm font-semibold leading-snug text-white">{segment.short}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
