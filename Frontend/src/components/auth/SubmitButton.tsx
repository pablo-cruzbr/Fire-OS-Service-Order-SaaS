"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

/** Submit button for server-action forms: shows a spinner while pending. */
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} className="w-full">
      {children}
    </Button>
  );
}
