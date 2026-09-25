import { ReactNode } from "react";
import { TbArrowLeft } from "react-icons/tb";
import { ButtonLink, Card, CardHeader, PageHeader } from "@/components/ui";

type FormPageProps = {
  title: string;
  description?: string;
  backHref: string;
  backLabel: string;
  cardTitle?: string;
  children: ReactNode;
};

/** Page shell for the "new record" forms: header with back link + form card. */
export function FormPage({ title, description, backHref, backLabel, cardTitle, children }: FormPageProps) {
  return (
    <section>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: backLabel, href: backHref }, { label: title }]}
        actions={
          <ButtonLink href={backHref} variant="outline" className="bg-card" icon={<TbArrowLeft className="h-4 w-4" />}>
            Voltar
          </ButtonLink>
        }
      />
      <Card className="mx-auto max-w-4xl">
        <CardHeader title={cardTitle ?? "Informações"} subtitle={description} />
        {children}
      </Card>
    </section>
  );
}
