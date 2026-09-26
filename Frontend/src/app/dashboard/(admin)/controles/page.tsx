import Link from "next/link";
import { TbChevronRight } from "react-icons/tb";
import { PageHeader } from "@/components/ui";
import { navigation, type NavLink } from "@/components/layout/navigation";

const controles: NavLink[] =
  navigation.flatMap((section) => section.items).find((item) => item.label === "Controles")?.children ?? [];

export default function ControlesPage() {
  return (
    <section>
      <PageHeader title="Controles" breadcrumbs={[{ label: "Painel", href: "/dashboard" }, { label: "Controles" }]} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {controles.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center justify-between rounded-xl bg-card p-5 shadow-md transition-colors hover:bg-lightprimary dark:shadow-dark-md"
          >
            <span className="font-semibold text-link group-hover:text-primary">{link.label}</span>
            <TbChevronRight className="h-5 w-5 text-muted group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  );
}
