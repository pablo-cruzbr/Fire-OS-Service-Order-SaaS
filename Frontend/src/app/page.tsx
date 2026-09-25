import Image from "next/image";
import Link from "next/link";
import {
  TbArrowRight,
  TbBuildingWarehouse,
  TbCalendarEvent,
  TbCalendarTime,
  TbChartBar,
  TbCheck,
  TbClipboardCheck,
  TbFileSpreadsheet,
  TbFileText,
  TbFlask,
  TbInbox,
  TbMoon,
  TbPhotoCheck,
  TbReportAnalytics,
  TbRoute,
  TbShieldLock,
  TbShoppingCart,
  TbSignature,
  TbTicket,
  TbTool,
  TbUserCheck,
  TbUsersGroup,
} from "react-icons/tb";
import { ButtonLink } from "@/components/ui";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SegmentCarousel } from "@/features/landing/SegmentCarousel";
import { SegmentShowcase } from "@/features/landing/SegmentShowcase";
import { segments } from "@/features/landing/segments";
import logo from "../../public/Fire-os-fundo-branco.svg";

const workflow = [
  { icon: <TbInbox />, title: "Receba chamados", text: "Clientes abrem chamados pela Área do Usuário, já identificados por empresa e setor." },
  { icon: <TbCalendarTime />, title: "Agende e despache", text: "Defina técnico, prioridade e data. Arraste no calendário para reagendar." },
  { icon: <TbRoute />, title: "Atenda em campo", text: "Acompanhe cada OS: aberta, em deslocamento, em andamento, pausada ou concluída." },
  { icon: <TbTool />, title: "Registre o serviço", text: "Atividades, peças, equipamentos e solução aplicada ficam no histórico." },
  { icon: <TbSignature />, title: "Colete a assinatura", text: "Fotos do atendimento e assinatura do responsável na OS digital." },
  { icon: <TbChartBar />, title: "Analise e exporte", text: "Relatórios por período, cliente ou status, direto para o Excel." },
];

const highlights = [
  { value: "3 perfis", label: "Administrador, técnico e cliente, cada um com o seu acesso" },
  { value: "1 clique", label: "Para exportar as ordens de serviço filtradas em Excel" },
  { value: "100% digital", label: "OS com fotos, atividades e assinatura, pronta para imprimir" },
];

const features = [
  { icon: <TbTicket />, title: "Chamados e tickets", text: "Abertura pelo cliente ou pela equipe, com prioridade e tipo." },
  { icon: <TbClipboardCheck />, title: "Ordens de serviço", text: "Status, técnico, atividades padrão e tempo de atendimento." },
  { icon: <TbCalendarEvent />, title: "Calendário técnico", text: "Agenda mensal e semanal com reagendamento por arrastar." },
  { icon: <TbPhotoCheck />, title: "Fotos e assinatura", text: "Comprovação do serviço anexada à própria OS." },
  { icon: <TbBuildingWarehouse />, title: "Controle de equipamentos", text: "Patrimônio, estabilizadores e máquinas pendentes." },
  { icon: <TbFlask />, title: "Laboratório e laudos", text: "Bancada, assistência autorizada e laudos técnicos." },
  { icon: <TbShoppingCart />, title: "Compras", text: "Solicitações de peças com status de compra e entrega." },
  { icon: <TbFileSpreadsheet />, title: "Relatórios", text: "Exportação em Excel e relatórios por secretaria." },
  { icon: <TbFileText />, title: "Documentação técnica", text: "Procedimentos e informações de cada cliente." },
  { icon: <TbUsersGroup />, title: "Clientes e setores", text: "Empresas, instituições, setores e ramais." },
  { icon: <TbShieldLock />, title: "Perfis de acesso", text: "Cada perfil vê só o que precisa, validado no servidor." },
  { icon: <TbMoon />, title: "Tema claro e escuro", text: "Interface moderna, confortável de dia e de noite." },
];

const steps = [
  { icon: <TbTicket />, title: "O cliente abre o chamado", text: "Pela Área do Usuário, com o patrimônio e a descrição do problema." },
  { icon: <TbUserCheck />, title: "A equipe atende", text: "O técnico é designado, se desloca e registra atividades, fotos e solução." },
  { icon: <TbReportAnalytics />, title: "A OS é concluída", text: "O responsável assina, a OS digital fica disponível e entra nos relatórios." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="rounded-md bg-white px-1 py-1">
            <Image src={logo} alt="Fire OS" width={140} height={32} priority />
          </Link>
          <nav aria-label="Seções" className="hidden items-center gap-7 text-sm font-medium text-link lg:flex">
            <a href="#recursos" className="hover:text-primary">Recursos</a>
            <a href="#segmentos" className="hover:text-primary">Segmentos</a>
            <a href="#como-funciona" className="hover:text-primary">Como funciona</a>
            <Link href="/AreadeUsuario" className="hover:text-primary">Área do usuário</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <ButtonLink href="/login" variant="ghost" className="hidden sm:inline-flex">
              Entrar
            </ButtonLink>
            <ButtonLink href="/login" icon={<TbArrowRight className="h-4 w-4" />}>
              Acessar o portal
            </ButtonLink>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pb-16 pt-16 sm:pt-20">
          <div aria-hidden className="absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-lightprimary px-3 py-1.5 text-xs font-semibold text-primary">
              Software de ordens de serviço e chamados
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] text-link sm:text-6xl">
              Tudo para organizar e fazer crescer o seu <span className="text-primary">negócio de serviços</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-bodytext sm:text-lg">
              Do chamado aberto pelo cliente à OS assinada no local: agenda da equipe, controle de equipamentos,
              laboratório, compras e relatórios em um só sistema.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/login" size="lg" icon={<TbArrowRight className="h-5 w-5" />}>
                Acessar o portal
              </ButtonLink>
              <ButtonLink href="/AreadeUsuario" size="lg" variant="outline">
                Sou cliente, quero abrir um chamado
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-bodytext">
              {["Área do cliente inclusa", "OS digital com assinatura", "Relatórios em Excel"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <TbCheck className="text-successtext" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-14">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
              Usado para organizar serviços de
            </p>
            <SegmentCarousel />
          </div>
        </section>

        {/* Workflow */}
        <section id="recursos" className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Do começo ao fim</p>
              <h2 className="mt-2 text-3xl font-bold text-link sm:text-4xl">Um fluxo para cada etapa do atendimento</h2>
            </div>
            <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {workflow.map((item, index) => (
                <li
                  key={item.title}
                  className="rounded-xl bg-card p-6 shadow-md transition-transform duration-200 hover:-translate-y-1 dark:shadow-dark-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-lightprimary text-2xl text-primary">
                      {item.icon}
                    </span>
                    <span className="text-sm font-bold text-primary/30">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 font-semibold text-link">{item.title}</h3>
                  <p className="mt-2 text-sm text-bodytext">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Highlights */}
        <section className="border-y border-border py-14">
          <dl className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 text-center sm:px-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.value}>
                <dt className="text-4xl font-bold text-primary">{item.value}</dt>
                <dd className="mx-auto mt-2 max-w-xs text-bodytext">{item.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Segments */}
        <section id="segmentos" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Segmentos</p>
              <h2 className="mt-2 text-3xl font-bold text-link sm:text-4xl">Feito para quem vive de prestar serviço</h2>
              <p className="mt-3 text-bodytext">
                Veja como a ordem de serviço do Fire OS se adapta ao dia a dia de cada tipo de negócio.
              </p>
            </div>
            <div className="mt-12">
              <SegmentShowcase />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Recursos</p>
              <h2 className="mt-2 text-3xl font-bold text-link sm:text-4xl">Tudo o que a sua operação precisa</h2>
            </div>
            <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-card text-xl text-primary shadow-md dark:shadow-dark-md">
                    {feature.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-link">{feature.title}</h3>
                    <p className="mt-1 text-sm text-bodytext">{feature.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Como funciona</p>
              <h2 className="mt-2 text-3xl font-bold text-link sm:text-4xl">Do chamado à OS assinada em três passos</h2>
            </div>
            <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="relative rounded-xl border border-border p-6">
                  <span className="absolute right-6 top-6 text-4xl font-bold text-primary/15">{index + 1}</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl text-white">
                    {step.icon}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-link">{step.title}</h3>
                  <p className="mt-2 text-bodytext">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center">
            <div aria-hidden className="absolute -left-10 -top-16 h-52 w-52 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-20 -right-10 h-60 w-60 rounded-full bg-white/10" />
            <h2 className="relative text-3xl font-bold text-white">Pronto para organizar seus atendimentos?</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/80">
              Entre no portal administrativo ou abra um chamado pela Área do Usuário.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 font-medium text-primary transition-opacity hover:opacity-90"
              >
                Acessar o portal <TbArrowRight />
              </Link>
              <Link
                href="/AreadeUsuario"
                className="inline-flex h-12 items-center gap-2 rounded-md border border-white/40 px-6 font-medium text-white transition-colors hover:bg-white/10"
              >
                <TbTicket /> Abrir um chamado
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <span className="inline-block rounded-md bg-white px-1 py-1">
              <Image src={logo} alt="Fire OS" width={130} height={30} />
            </span>
            <p className="mt-4 max-w-xs text-sm text-bodytext">
              Software de ordens de serviço e chamados para empresas de assistência técnica e manutenção.
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-link">Produto</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-bodytext">
              <li><a href="#recursos" className="hover:text-primary">Recursos</a></li>
              <li><a href="#como-funciona" className="hover:text-primary">Como funciona</a></li>
              <li><a href="#segmentos" className="hover:text-primary">Segmentos</a></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold text-link">Segmentos</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-bodytext">
              {segments.map((segment) => (
                <li key={segment.id}>
                  <a href="#segmentos" className="hover:text-primary">{segment.short}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-link">Acesso</h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-bodytext">
              <li><Link href="/login" className="hover:text-primary">Portal administrativo</Link></li>
              <li><Link href="/AreadeUsuario" className="hover:text-primary">Área do usuário</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <p className="mx-auto max-w-7xl px-4 py-5 text-sm text-bodytext sm:px-6">
            © {new Date().getFullYear()} Fire OS. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
