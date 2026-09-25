"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import { TbDeviceFloppy } from "react-icons/tb";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";
import { fromDateInput, fromMonthInput } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { Lookup, Option, useLookups } from "./useLookups";

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "tel"
  | "url"
  | "password"
  | "textarea"
  | "date"
  | "month"
  | "select";

export type FormField = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Takes the full row on wide screens. Textareas always do. */
  full?: boolean;
  step?: string;
  /** Static options for a select. */
  options?: Option[];
  /** Options loaded from the API for a select. */
  lookup?: Lookup;
  /** Starting value (edit forms). */
  initial?: string | number | null;
  /** Custom conversion of the raw input value for the payload. */
  serialize?: (value: string) => unknown;
};

export type Payload = Record<string, unknown>;

type EntityFormProps = {
  fields: FormField[];
  /** Where to send the payload. Ignored when `onSubmit` is given. */
  request?: { method: "post" | "patch" | "put"; url: string; params?: Record<string, unknown> };
  onSubmit?: (payload: Payload) => Promise<unknown>;
  /** Last chance to reshape the payload (add ids, rename keys...). */
  transform?: (payload: Payload) => Payload;
  onSuccess?: (response: unknown) => void;
  onCancel?: () => void;
  submitLabel?: string;
  successMessage?: string;
  columns?: 1 | 2;
  footer?: ReactNode;
};

function serialize(field: FormField, raw: string): unknown {
  if (field.serialize) return field.serialize(raw);
  switch (field.type) {
    case "number":
      return raw === "" ? null : Number(raw);
    case "date":
      return fromDateInput(raw);
    case "month":
      return fromMonthInput(raw);
    case "select":
      // an empty foreign key would be rejected by the API — leave it out instead
      return raw === "" ? undefined : raw;
    default:
      return raw;
  }
}

/**
 * Generic create/edit form. Renders the fields, loads select options, converts
 * values (numbers, noon-UTC dates) and sends the request, with loading state,
 * double-submit protection and toast feedback.
 */
export function EntityForm({
  fields,
  request,
  onSubmit,
  transform,
  onSuccess,
  onCancel,
  submitLabel = "Salvar",
  successMessage = "Dados salvos com sucesso!",
  columns = 2,
  footer,
}: EntityFormProps) {
  const lookups = useMemo(() => fields.flatMap((field) => (field.lookup ? [field.lookup] : [])), [fields]);
  const { options, loading, failed } = useLookups(lookups);

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, field.initial == null ? "" : String(field.initial)])),
  );
  const [submitting, setSubmitting] = useState(false);

  function setValue(name: string, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    let payload: Payload = {};
    for (const field of fields) {
      const value = serialize(field, values[field.name] ?? "");
      if (value !== undefined) payload[field.name] = value;
    }
    if (transform) payload = transform(payload);

    setSubmitting(true);
    try {
      let response: unknown;
      if (onSubmit) {
        response = await onSubmit(payload);
      } else if (request) {
        response = await api.request({
          method: request.method,
          url: request.url,
          data: payload,
          params: request.params,
        });
      }
      toast.success(successMessage);
      onSuccess?.(response);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Erro ao salvar os dados."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {failed.length > 0 && (
        <p className="rounded-md bg-lightwarning px-4 py-3 text-sm text-warningtext">
          Algumas listas não puderam ser carregadas. Tente recarregar a página.
        </p>
      )}

      <div className={cn("grid grid-cols-1 gap-5", columns === 2 && "md:grid-cols-2")}>
        {fields.map((field) => {
          const id = `field-${field.name}`;
          const value = values[field.name] ?? "";
          const full = field.full || field.type === "textarea";
          const common = {
            id,
            name: field.name,
            required: field.required,
            value,
          };

          let control: ReactNode;
          if (field.type === "textarea") {
            control = (
              <Textarea
                {...common}
                placeholder={field.placeholder}
                onChange={(event) => setValue(field.name, event.target.value)}
              />
            );
          } else if (field.type === "select") {
            const list = field.lookup ? options[field.lookup.endpoint] ?? [] : field.options ?? [];
            const waiting = Boolean(field.lookup) && loading;
            control = (
              <Select
                {...common}
                disabled={waiting}
                onChange={(event) => setValue(field.name, event.target.value)}
              >
                <option value="">{waiting ? "Carregando..." : field.placeholder ?? "Selecione"}</option>
                {list.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            );
          } else {
            control = (
              <Input
                {...common}
                type={field.type ?? "text"}
                step={field.step}
                placeholder={field.placeholder}
                onChange={(event) => setValue(field.name, event.target.value)}
              />
            );
          }

          return (
            <Field
              key={field.name}
              label={field.label}
              htmlFor={id}
              required={field.required}
              hint={field.hint}
              className={cn(full && "md:col-span-2")}
            >
              {control}
            </Field>
          );
        })}
      </div>

      {footer}

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          loading={submitting}
          disabled={loading}
          icon={<TbDeviceFloppy className="h-4 w-4" />}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
