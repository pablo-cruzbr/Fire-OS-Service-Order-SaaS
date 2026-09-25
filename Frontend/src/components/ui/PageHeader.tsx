import Link from "next/link";
import { ReactNode } from "react";
import { TbChevronRight } from "react-icons/tb";

type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
};

/** Title banner with breadcrumb, in the style of the Modernize breadcrumb card. */
export function PageHeader({ title, description, breadcrumbs = [], actions }: PageHeaderProps) {
  const crumbs: Crumb[] = [{ label: "Início", href: "/dashboard" }, ...breadcrumbs];

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl bg-lightprimary px-6 py-6 sm:px-8">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-link">{title}</h1>
          <nav aria-label="Trilha" className="mt-1.5 flex flex-wrap items-center gap-1 text-sm">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {crumb.href && !last ? (
                    <Link href={crumb.href} className="text-bodytext hover:text-primary">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={last ? "font-medium text-primary" : "text-bodytext"}>{crumb.label}</span>
                  )}
                  {!last && <TbChevronRight className="h-3.5 w-3.5 text-muted" aria-hidden />}
                </span>
              );
            })}
          </nav>
          {description && <p className="mt-2 max-w-2xl text-sm text-bodytext">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-primary/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-24 h-36 w-36 rounded-full bg-secondary/10"
      />
    </div>
  );
}
