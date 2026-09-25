"use client";

import { ComponentProps, ReactNode, useState } from "react";
import { TbEye, TbEyeOff, TbLock, TbMail } from "react-icons/tb";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui";

function IconInput({ icon, className, ...props }: ComponentProps<"input"> & { icon: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-muted">{icon}</span>
      <Input className={cn("h-12 pl-11", className)} {...props} />
    </div>
  );
}

export function EmailInput(props: ComponentProps<"input">) {
  return <IconInput icon={<TbMail />} type="email" autoComplete="email" placeholder="voce@empresa.com" {...props} />;
}

/** Password field with a lock icon and a show/hide toggle. */
export function PasswordInput(props: ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <IconInput icon={<TbLock />} type={visible ? "text" : "password"} className="pr-11" {...props} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-lightprimary hover:text-primary"
      >
        {visible ? <TbEyeOff /> : <TbEye />}
      </button>
    </div>
  );
}
