"use client";

import ReactSelect from "react-select";
import { cn } from "@/lib/cn";
import type { Option } from "@/components/data/useLookups";

type SearchableSelectProps = {
  inputId?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  noOptionsMessage?: string;
};

/**
 * react-select with the design-system look (token classes only, so dark mode
 * follows automatically). Value in/out is the option id as a string.
 */
export function SearchableSelect({
  inputId,
  options,
  value,
  onChange,
  placeholder = "Selecione",
  loading,
  clearable = true,
  disabled,
  noOptionsMessage = "Nenhuma opção encontrada",
}: SearchableSelectProps) {
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <ReactSelect<Option, false>
      inputId={inputId}
      instanceId={inputId}
      unstyled
      options={options}
      value={selected}
      onChange={(option) => onChange(option?.value ?? "")}
      placeholder={loading ? "Carregando..." : placeholder}
      isLoading={loading}
      isDisabled={disabled || loading}
      isClearable={clearable}
      isSearchable
      noOptionsMessage={() => noOptionsMessage}
      loadingMessage={() => "Carregando..."}
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      menuPlacement="auto"
      styles={{
        // react-select sets min-height inline even when unstyled; match the 44px inputs
        control: (base) => ({ ...base, minHeight: 44 }),
        menuPortal: (base) => ({ ...base, zIndex: 1100 }),
      }}
      classNames={{
        control: ({ isFocused, isDisabled }) =>
          cn(
            "min-h-11 rounded-md border bg-transparent px-3.5 text-sm transition-colors",
            isFocused ? "border-primary ring-2 ring-lightprimary" : "border-border hover:border-primary",
            isDisabled && "cursor-not-allowed opacity-60",
          ),
        valueContainer: () => "gap-1 py-1",
        placeholder: () => "text-muted",
        singleValue: () => "text-link",
        input: () => "text-link",
        indicatorsContainer: () => "gap-1 text-muted",
        clearIndicator: () => "p-1 rounded hover:text-errortext",
        dropdownIndicator: () => "p-1 hover:text-primary",
        loadingIndicator: () => "p-1",
        menu: () => "mt-1 overflow-hidden rounded-md border border-border bg-card py-1 shadow-md dark:shadow-dark-md",
        menuList: () => "max-h-64",
        option: ({ isFocused, isSelected }) =>
          cn(
            "cursor-pointer px-3.5 py-2 text-sm",
            isSelected ? "bg-primary text-white" : isFocused ? "bg-lightprimary text-primary" : "text-link",
          ),
        noOptionsMessage: () => "px-3.5 py-2 text-sm text-muted",
        loadingMessage: () => "px-3.5 py-2 text-sm text-muted",
      }}
    />
  );
}
