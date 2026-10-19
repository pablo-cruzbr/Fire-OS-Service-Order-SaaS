import {
  TbAlertTriangle,
  TbBulb,
  TbCalendarEvent,
  TbClipboardCheck,
  TbClockHour4,
  TbSparkles,
  TbTool,
  TbTrendingDown,
  TbTrendingUp,
} from "react-icons/tb";
import { Badge, Card, CardHeader, StatGrid } from "@/components/ui";

export const metadata = {
  title: "Relatório Mensal com IA — Fire OS",
};

const stats = [
  { label: "OS abertas no mês", value: 142, tone: "primary" as const, icon: <TbClipboardCheck /> },
  { label: "Variação vs. mês anterior", value: "+18%", tone: "success" as const, icon: <TbTrendingUp /> },
  { label: "Tempo médio por OS", value: "1h52", tone: "warning" as const, icon: <TbClockHour4 /> },
  { label: "Equipamentos recorrentes", value: 4, tone: "error" as const, icon: <TbAlertTriangle /> },
];

const highlights = [
  "A Secretaria de Educação concentrou 38% das ordens de serviço do mês, puxada pelas EMEFs Monteiro Lobato e Paulo Freire.",
  "O tempo médio de atendimento caiu de 2h10 para 1h52 (-14%), principalmente nos chamados de informática.",
  "4 equipamentos voltaram com o mesmo defeito mais de uma vez — ver seção “Pontos de atenção” abaixo.",
];

const attention = [
  {
    title: "Impressora HP LaserJet (patrimônio 00245)",
    text: "Retornou 3 vezes em 30 dias com o mesmo defeito de rolete. Recomenda-se avaliar troca em vez de novo reparo.",
  },
  {
    title: "Técnico Carlos Souza sobrecarregado",
    text: "28 atendimentos no mês, 40% acima da média da equipe (20). Considerar redistribuir chamados da UBS Jardim das Flores.",
  },
];

const recommendations = [
  "Priorizar a troca (não o conserto) da impressora de patrimônio 00245 no próximo chamado.",
  "Redistribuir parte da carteira de Carlos Souza para Juliana Rocha, que está com 35% de capacidade ociosa.",
  "Agendar manutenção preventiva nas EMEFs com mais chamados recorrentes antes do próximo bimestre.",
];

export default function MonthlyInsightsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden bg-lightprimary shadow-none dark:shadow-none">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="primary" className="bg-card">
              <TbSparkles className="mr-1 inline h-3.5 w-3.5" /> Gerado por IA
            </Badge>
            <h1 className="mt-3 text-2xl font-semibold text-link">Relatório de Setembro/2026</h1>
            <p className="mt-1 text-sm text-bodytext">Comparado com agosto/2026 · gerado automaticamente todo dia 1º</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-xs text-bodytext shadow-md dark:shadow-dark-md">
            <TbCalendarEvent className="h-4 w-4 text-primary" />
            Próximo relatório: 01/11/2026
          </div>
        </div>
        <div aria-hidden className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-primary/15" />
      </Card>

      <div className="rounded-lg border border-warning/30 bg-lightwarning px-4 py-3 text-sm text-warningtext">
        <strong className="font-semibold">Protótipo de interface:</strong> os números e o texto abaixo são fixos, só
        para visualizar o layout. A geração real por IA (job agendado, cálculo dos fatos e redação do texto) ainda
        não foi implementada — ver <code className="rounded bg-card px-1 py-0.5">GUIA-IA-FIRE-OS.md</code>.
      </div>

      <StatGrid stats={stats} />

      <Card>
        <CardHeader
          title="Resumo do mês"
          subtitle="Escrito a partir dos números acima — a IA não calcula nada, só redige"
        />
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-bodytext">
          <p>
            Setembro teve <strong className="text-link">142 ordens de serviço</strong>, 18% a mais que agosto. O
            destaque foi a <strong className="text-link">Secretaria de Educação</strong>, que concentrou mais de um
            terço dos chamados do mês — um volume puxado principalmente por duas unidades escolares.
          </p>
          <p>
            Apesar do aumento de volume, o <strong className="text-link">tempo médio de atendimento melhorou</strong>,
            caindo para 1h52 por OS. Isso sugere que a equipe está absorvendo a demanda extra sem perder eficiência,
            mas vale observar a carga por técnico (ver pontos de atenção).
          </p>
        </div>

        <h6 className="mt-6 mb-3 flex items-center gap-2 text-sm font-semibold text-link">
          <TbTrendingUp className="h-4 w-4 text-success" /> Destaques
        </h6>
        <ul className="flex flex-col gap-2">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-bodytext">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Pontos de atenção"
          subtitle="Equipamentos recorrentes e carga de trabalho fora do padrão"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {attention.map((item) => (
            <div key={item.title} className="flex gap-3 rounded-lg bg-lighterror p-4">
              <TbAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-errortext" />
              <div>
                <p className="text-sm font-semibold text-link">{item.title}</p>
                <p className="mt-1 text-sm text-bodytext">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Recomendações" subtitle="Sugestões de ação para o gestor — ninguém é executado sozinho" />
        <ul className="flex flex-col gap-3">
          {recommendations.map((item, index) => (
            <li key={item} className="flex items-start gap-3 text-sm text-bodytext">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lightprimary text-xs font-semibold text-primary">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted">
        <TbTool className="h-4 w-4" /> <TbBulb className="h-4 w-4" />
        Todo número acima tem origem numa consulta ao banco — a IA só escreve o texto em volta deles.
      </div>
    </div>
  );
}
