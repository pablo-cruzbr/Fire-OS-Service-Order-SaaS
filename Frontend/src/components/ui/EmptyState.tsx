import { ReactNode } from "react";
import { TbInbox } from "react-icons/tb";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lightprimary text-2xl text-primary">
        <TbInbox />
      </span>
      <h6 className="text-base font-semibold text-link">{title}</h6>
      {description && <p className="mt-1 max-w-sm text-sm text-bodytext">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
