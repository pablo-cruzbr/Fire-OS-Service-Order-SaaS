'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { LuRefreshCcw } from "react-icons/lu";
import styles from './ticketsLit.module.scss';
import { OrdemdeServicoResponseData } from '@/lib/getOrdemdeServico.type';

const Calendar = dynamic(() => import('../../components/calendar/calendar'), {
  ssr: false
});

interface Props {
  ticketsData: OrdemdeServicoResponseData;
  tokenDoServidor?: string;
}

export default function TicketsList({ ticketsData, tokenDoServidor }: Props) {
  const router = useRouter();

  const subtitle = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <h1 className={styles.pageTitle}>Calendário Técnico</h1>
          <span className={styles.pageSubtitle}>{subtitle}</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.button} onClick={() => router.push('/dashboard/tickets')}>
            Lista de Chamados
          </button>
          <LuRefreshCcw onClick={() => router.refresh()} className={styles.refresh} />
        </div>
      </div>

      <div className={styles.calendarCard}>
        <Calendar
          initialToken={tokenDoServidor}
          events={ticketsData.controles}
        />
      </div>
    </div>
  );
}
