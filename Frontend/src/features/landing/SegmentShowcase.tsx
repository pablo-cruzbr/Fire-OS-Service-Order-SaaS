"use client";

import Image from "next/image";
import { useState } from "react";
import { TbCheck, TbClipboardText } from "react-icons/tb";
import { cn } from "@/lib/cn";
import { StatusBadge } from "@/components/ui";
import { segments } from "./segments";

/** Tabs of service segments: pick one on the left, see how Ordem Next fits it on the right. */
export function SegmentShowcase() {
  const [activeId, setActiveId] = useState(segments[0].id);
  const activeIndex = Math.max(0, segments.findIndex((segment) => segment.id === activeId));
  const active = segments[activeIndex];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div
        role="tablist"
        aria-label="Segmentos"
        aria-orientation="vertical"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:col-span-5 lg:mx-0 lg:grid lg:grid-cols-2 lg:content-start lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {segments.map((segment) => {
          const selected = segment.id === active.id;
          return (
            <button
              key={segment.id}
              role="tab"
              id={`tab-${segment.id}`}
              aria-selected={selected}
              aria-controls="segment-panel"
              onClick={() => setActiveId(segment.id)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all",
                selected
                  ? "border-primary bg-card text-primary shadow-md dark:shadow-dark-md"
                  : "border-transparent text-link hover:bg-card hover:text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-lg",
                  selected ? "bg-primary text-white" : "bg-lightprimary text-primary",
                )}
              >
                {segment.icon}
              </span>
              <span className="whitespace-nowrap lg:whitespace-normal">{segment.short}</span>
            </button>
          );
        })}
      </div>

      <div
        id="segment-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active.id}`}
        className="grid grid-cols-1 items-start gap-8 self-start rounded-2xl bg-card p-6 shadow-md sm:p-8 lg:col-span-7 xl:grid-cols-2 dark:shadow-dark-md"
      >
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-lightprimary text-2xl text-primary">
            {active.icon}
          </span>
          <h3 className="mt-5 text-xl font-semibold text-link">{active.name}</h3>
          <p className="mt-3 text-bodytext">{active.description}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">O que você registra na OS</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {active.records.map((record) => (
              <li key={record} className="flex items-start gap-2.5 text-sm text-link">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lightsuccess text-successtext">
                  <TbCheck className="h-3.5 w-3.5" />
                </span>
                {record}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden className="relative">
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          {active.image ? (
            <div className="relative mb-[-3rem] h-44 overflow-hidden rounded-xl">
              <Image key={active.id} src={active.image} alt="" fill sizes="(min-width: 1024px) 360px, 90vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          ) : null}
          <div className="relative mx-3 rounded-xl border border-border bg-background p-5 shadow-md dark:shadow-dark-md">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <TbClipboardText className="h-4 w-4 text-primary" /> OS #{48210 + activeIndex * 17}
              </div>
              <StatusBadge status={active.example.status} />
            </div>
            <p className="mt-4 text-base font-semibold text-link">{active.example.title}</p>
            <p className="text-xs text-bodytext">{active.example.client}</p>
            <dl className="mt-4 flex flex-col gap-2">
              {active.example.lines.map((line) => (
                <div key={line.label} className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2.5">
                  <dt className="text-xs text-muted">{line.label}</dt>
                  <dd className="text-right text-xs font-medium text-link">{line.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <span className="h-7 flex-1 rounded-md bg-primary/90" />
              <span className="h-7 w-20 rounded-md border border-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
