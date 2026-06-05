'use client';

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './cardListPendentesLab.module.scss';
import { FaRegTrashAlt } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import { useGlobalModal } from '@/provider/GlobalModalProvider';
import { getCookieClient } from '@/lib/cookieClient';
import { api } from '@/services/api';
import { ModalContext } from '@/provider/compras';
import { EstabilizadoresProps, EstabilizadoresResponse } from '@/lib/getEstabilizadores.type';

interface Props {
  EstabilizadoresData: EstabilizadoresResponse;
}

export default function EstabilizadoresList({ EstabilizadoresData }: Props): React.ReactElement {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchOS, setSearchOS] = useState<string>("");

  const router = useRouter();
  const { openModal } = useGlobalModal();
  const { isOpen, onRequestOpen } = useContext(ModalContext);

  const {
    controles = [],
    total = 0,
    totalAguardandoReparo = 0,
    totalFinalizado = 0,
  } = EstabilizadoresData || {};

  /** 🔹 Abre modal de detalhes */
  const handleDetail = (estabilizador: EstabilizadoresProps) => {
    openModal('Estabilizadores', [estabilizador]);
  };

  const handleAdd = () => {
    router.push('/dashboard/formulariosadd/formularioControledeEstabilizadores');
  };

  const handleAddEstabilizador = () => {
    router.push('/dashboard/formulariosadd/formularioEstabilizadorAdd')
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const statusOption = [
    { id: "193382c6-cc13-4984-92d5-7629130e87b2", name: "AGUARDANDO REPARO" },
    { id: "3e17537f-df5f-4948-bc5d-280936131871", name: "REPARO FINALIZADO" },
  ];

  /** 🔹 Filtro */
  const filteredControles = controles.filter((est) => {
    const searchLower = searchOS.toLowerCase();
    const patrimonio = est.estabilizadores?.patrimonio ?? "";
    const osAssistencia = est.osdaAssistencia ?? "";

    const matchesSearch = searchLower
      ? patrimonio.toLowerCase().includes(searchLower) ||
        osAssistencia.toLowerCase().includes(searchLower)
      : true;

    const matchesStatus = selectedStatus
      ? est.statusEstabilizadores?.id === selectedStatus
      : true;

    return matchesSearch && matchesStatus;
  });

  /** 🔹 Deletar */
  const handleDelete = async (id: string) => {
    try {
      const token = getCookieClient();

      await api.delete(`/deletecontroldeestabilizadores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { controle_id: id },
      });

      router.refresh();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  return (
    <section>
      <div className={styles.headerClient}>
        <h1 className={styles.titleClient}>Controle de Estabilizadores</h1>

        <div className={styles.actions}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Pesquisar por patrimônio ou OS da assistência..."
              value={searchOS}
              onChange={(e) => setSearchOS(e.target.value)}
              className={styles.searchInput}
            />

            <select
              className={styles.select}
              value={selectedStatus ?? ""}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
            >
              <option value="">Todos os Status</option>
              {statusOption.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <button className={styles.button} onClick={handleAdd}>
            Novo Registro
          </button>

          <button className={styles.button} onClick={handleAddEstabilizador}>
            Registrar Estabilizador
          </button>
          <LuRefreshCcw onClick={handleRefresh} className={styles.refresh} />
        </div>
      </div>

      {/* 🔹 Cards resumo */}
      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Total</p>
          <strong className={styles.cardNumber}>{total}</strong>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Aguardando Reparo</p>
          <strong className={styles.cardNumber}>{totalAguardandoReparo}</strong>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Finalizado</p>
          <strong className={styles.cardNumber}>{totalFinalizado}</strong>
        </div>
      </div>

      <div className={styles.listContainer}>
        {filteredControles.map((est) => (
          <div
            key={est.id}
            className={styles.list}
            onClick={() => handleDetail(est)}
          >
            <div className={styles.clientDetail}>
              <p className={`${styles.field} ${styles.name}`}>
                <strong>Estabilizador:</strong> {est.estabilizadores.name}
              </p>
              <p className={`${styles.field} ${styles.name}`}>
                <strong>Patrimônio:</strong> {est.estabilizadores.patrimonio}
              </p>
              <p className={`${styles.field} ${styles.tecnico}`}>
                <strong>Status:</strong> {est.statusEstabilizadores.name}
              </p>
              <p className={`${styles.field} ${styles.data}`}>
                <strong>Data:</strong>{" "}
                {est.created_at
                  ? new Date(est.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Não informado"}
              </p>

              <FaRegTrashAlt
                className={styles.iconTrash}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(est.id);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
