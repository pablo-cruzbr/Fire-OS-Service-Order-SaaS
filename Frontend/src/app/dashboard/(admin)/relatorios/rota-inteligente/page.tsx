import {
  TbBolt,
  TbBrandGoogleMaps,
  TbClock,
  TbCode,
  TbGasStation,
  TbMapPin,
  TbRoute,
  TbSparkles,
} from "react-icons/tb";
import { Badge, Card, CardHeader, StatGrid } from "@/components/ui";

export const metadata = {
  title: "Roteiro Inteligente — Fire OS",
};

const stats = [
  { label: "Paradas no dia", value: 6, tone: "primary" as const, icon: <TbMapPin /> },
  { label: "Distância otimizada", value: "32 km", tone: "secondary" as const, icon: <TbRoute /> },
  { label: "Economia de combustível", value: "-12%", tone: "success" as const, icon: <TbGasStation /> },
  { label: "Tempo total estimado", value: "4h40", tone: "warning" as const, icon: <TbClock /> },
];

const stops = [
  {
    os: "#48224",
    local: "Secretaria de Educação",
    endereco: "Rua Sete de Setembro, 194",
    prioridade: "URGENTE" as const,
    chegada: "08:00",
    nota: "Primeira parada: prioridade urgente e mais próxima do ponto de partida do técnico.",
  },
  {
    os: "#48210",
    local: "EMEF Monteiro Lobato",
    endereco: "Rua das Palmeiras, 120",
    prioridade: "ALTA" as const,
    chegada: "09:10",
    nota: "A 1,8 km da parada anterior — fica no caminho antes de seguir para a zona norte.",
  },
  {
    os: "#48238",
    local: "CEU Parque Verde",
    endereco: "Av. Paulista, 910",
    prioridade: "MEDIA" as const,
    chegada: "10:20",
  },
  {
    os: "#48231",
    local: "EMEI Cecília Meireles",
    endereco: "Rua XV de Novembro, 268",
    prioridade: "MEDIA" as const,
    chegada: "11:30",
  },
  {
    os: "#48217",
    local: "UBS Jardim das Flores",
    endereco: "Rua dos Andradas, 342",
    prioridade: "BAIXA" as const,
    chegada: "13:15",
    nota: "Deixada para depois do almoço por ser a parada mais distante do grupo da manhã.",
  },
  {
    os: "#48245",
    local: "UBS Vila Nova",
    endereco: "Av. Brasil, 855",
    prioridade: "BAIXA" as const,
    chegada: "14:20",
  },
];

const prioridadeTone = {
  URGENTE: "error",
  ALTA: "warning",
  MEDIA: "info",
  BAIXA: "neutral",
} as const;

export default function RotaInteligentePage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden bg-lightprimary shadow-none dark:shadow-none">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="primary" className="bg-card">
              <TbSparkles className="mr-1 inline h-3.5 w-3.5" /> Roteiro sugerido por IA
            </Badge>
            <h1 className="mt-3 text-2xl font-semibold text-link">Carlos Souza — hoje, 19/10/2026</h1>
            <p className="mt-1 text-sm text-bodytext">6 chamados reorganizados por urgência e proximidade</p>
          </div>
          <div className="flex gap-2">
            <button className="flex h-10 items-center gap-2 rounded-md bg-card px-4 text-sm font-medium text-link shadow-md dark:shadow-dark-md">
              <TbBrandGoogleMaps className="h-4 w-4 text-primary" /> Abrir no Google Maps
            </button>
          </div>
        </div>
        <div aria-hidden className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-primary/15" />
      </Card>

      <div className="rounded-lg border border-warning/30 bg-lightwarning px-4 py-3 text-sm text-warningtext">
        <strong className="font-semibold">Protótipo de interface:</strong> a ordem das paradas abaixo é fixa, só
        para visualizar o layout. Na implementação real, quem calcula a rota é uma API de mapas (Google
        Directions, com otimização de paradas) e um critério de prioridade em código — a IA só escreve a
        explicação em português, ela não faz essa conta.
      </div>

      <StatGrid stats={stats} />

      <Card>
        <CardHeader
          title="Por que essa ordem?"
          subtitle="O que entrou na conta, e o que não foi a IA quem calculou"
        />
        <ul className="flex flex-col gap-3 text-sm text-bodytext">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lightprimary text-primary">
              <TbCode className="h-4 w-4" />
            </span>
            <span>
              <strong className="text-link">1. Prioridade primeiro:</strong> chamados urgentes e de alta prioridade
              são sempre posicionados antes dos de prioridade média/baixa, não importa a distância.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lightprimary text-primary">
              <TbCode className="h-4 w-4" />
            </span>
            <span>
              <strong className="text-link">2. Dentro de cada faixa de prioridade:</strong> a ordem é a que minimiza
              a distância total percorrida (problema de roteirização — resolvido por uma API de mapas, não pela IA).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lightprimary text-primary">
              <TbSparkles className="h-4 w-4" />
            </span>
            <span>
              <strong className="text-link">3. Só então a IA entra:</strong> ela recebe a lista já ordenada e escreve
              a nota explicando cada escolha em português — ela não decide a ordem, só a traduz em linguagem natural.
            </span>
          </li>
        </ul>
      </Card>

      <Card>
        <CardHeader title="Paradas do dia" subtitle="Na ordem sugerida" />
        <ol className="flex flex-col gap-4">
          {stops.map((stop, index) => (
            <li key={stop.os} className="flex gap-4 rounded-lg border border-border p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-link">
                      {stop.os} · {stop.local}
                    </p>
                    <p className="text-sm text-bodytext">{stop.endereco}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={prioridadeTone[stop.prioridade]}>{stop.prioridade}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <TbClock className="h-3.5 w-3.5" /> {stop.chegada}
                    </span>
                  </div>
                </div>
                {stop.nota && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-primary">
                    <TbBolt className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {stop.nota}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
