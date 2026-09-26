"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { TbPencil } from "react-icons/tb";
import { cn } from "@/lib/cn";
import { Button, Modal } from "@/components/ui";

export type DetailField = {
  label: string;
  value: ReactNode;
  /** Takes the full row (long text, links). */
  full?: boolean;
};

/** Label/value grid used by every detail modal. */
export function DetailGrid({ fields }: { fields: DetailField[] }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className={cn("rounded-lg bg-surface px-4 py-3", field.full && "sm:col-span-2")}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">{field.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-link">
            {field.value === null || field.value === undefined || field.value === "" ? "—" : field.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type DetailModalProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  fields: DetailField[];
  onClose: () => void;
  /** Renders the edit form. `done` closes the modal and refreshes the list. */
  renderEdit?: (done: () => void, cancel: () => void) => ReactNode;
  /** Extra content under the fields (photos, history...). */
  children?: ReactNode;
  extraActions?: ReactNode;
  size?: "md" | "lg" | "xl";
};

/**
 * Read-only view of a record with an "Editar" switch. After a successful edit
 * the modal closes and the server list is refreshed, so nothing stale is shown.
 */
export function DetailModal({
  title,
  subtitle,
  fields,
  onClose,
  renderEdit,
  children,
  extraActions,
  size = "lg",
}: DetailModalProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  function done() {
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open
      onClose={onClose}
      size={size}
      title={editing ? "Editar registro" : title}
      subtitle={editing ? (typeof title === "string" ? title : undefined) : subtitle}
      footer={
        editing ? undefined : (
          <>
            {extraActions}
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {renderEdit && (
              <Button onClick={() => setEditing(true)} icon={<TbPencil className="h-4 w-4" />}>
                Editar
              </Button>
            )}
          </>
        )
      }
    >
      {editing && renderEdit ? (
        renderEdit(done, () => setEditing(false))
      ) : (
        <>
          <DetailGrid fields={fields} />
          {children}
        </>
      )}
    </Modal>
  );
}
