'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './cardListLaboratorio.module.scss';
import { FaRegTrashAlt } from "react-icons/fa";
import { useGlobalModal } from '@/provider/GlobalModalProvider';
import { LaboratorioProps, LaboratorioResponse } from '@/lib/getLaboratorio.type';
import { getCookieClient } from '@/lib/cookieClient';
import { api } from '@/services/api';

interface Props {
  laboratorioData: LaboratorioResponse;
}

export default function LaboratorioList({ laboratorioData }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchOS, setSearchOS] = useState<string>(""); 
  const [searchAbertura, setSearchAbertura] = useState<string>("");

  const {
    controles = [],
    total = 0,
    totalAguardandoConserto = 0,
    totalAguardandoDevolucao = 0,
    totalAguardandoOSdeLaboratorio = 0,
  } = laboratorioData || {};

  const { openModal } = useGlobalModal();
  const router = useRouter();

  async function handleDetailLaudoTecnico(laboratorio: LaboratorioProps) {
    openModal('laboratorio', laboratorio);
  }

  async function handleAddCardLaboratorio() {
    router.push('/dashboard/formulariosadd/formularioLaboratorio');
  }

  // Filtro combinado
const statusOptions = [
  { id: "648c9f76-9593-4b4a-bc22-38e1ed2221e7", name: "AGUARDANDO CONSERTO" },
  { id: "2d4f6a66-72d9-4668-bfad-7a756694c8de", name: "AGUARDANDO O.S DE LABORATÓRIO" },
  { id: "e30817fa-51c3-4823-ae6c-c748d7f04d72", name: "CONCLUIDO" },
  { id: "2f77a1bd-3ad1-4be9-b218-6269f17a603b", name: "AGUARDANDO DEVOLUÇÃO" }
];

const filteredControles = controles.filter(ticket => {
  const matchStatus = selectedStatus ? ticket.statusControledeLaboratorio?.id === selectedStatus : true;
  const matchPatrimonio = searchOS ? ticket.equipamento?.patrimonio?.toString().includes(searchOS) : true;
  const matchAbertura = searchAbertura ? ticket.osDeAbertura?.toString().includes(searchAbertura) : true;
  return matchStatus && matchPatrimonio && matchAbertura;
});

  async function handleDeleteCardLaboratorio(controle_id: string) {
    try {
      const token = getCookieClient();

      await api.delete(`/deletecontroledelaboratorio/${controle_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { controle_id },
      });

      router.refresh();
    } catch (error) {
      console.error("Erro ao deletar a compra:", error);
    }
  }

  return (
    <section>
      <div className={styles.headerClient}>
        <h1 className={styles.titleClient}>Controle de Laboratório</h1>
        <div className={styles.actions}>
          {/* Filtros */}
         <div className={styles.searchContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Pesquisar por patrimônio / OS"
              value={searchOS}
              onChange={(e) => setSearchOS(e.target.value)}
              className={styles.searchInput}
            />

              <input
                type="text"
                placeholder="Pesquisar por OS de abertura"
                value={searchAbertura}
                onChange={(e) => setSearchAbertura(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <select
              className={styles.select}
              value={selectedStatus || ""}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
            >
              <option value="">Todos os Status</option>
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>



          <button className={styles.button} onClick={handleAddCardLaboratorio}>
            Novo Registro
          </button>
        </div>
      </div>

      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Total</p>
          <strong className={styles.cardNumber}>{total}</strong>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Aguardando Conserto</p>
          <strong className={styles.cardNumber}>{totalAguardandoConserto}</strong>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Aguardando Devolução</p>
          <strong className={styles.cardNumber}>{totalAguardandoDevolucao}</strong>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Aguardando OS <br /> de Laboratório</p>
          <strong className={styles.cardNumber}>{totalAguardandoOSdeLaboratorio}</strong>
        </div>
      </div>

      <div className={styles.listContainer}>
        {filteredControles.map((laboratorio) => (
          <div
            key={laboratorio.id}
            onClick={() => handleDetailLaudoTecnico(laboratorio)}
            className={styles.list}
          >
            <div className={styles.clientDetail}>
              <p className={`${styles.field} ${styles.name}`}>
                <strong>OS de Abertura:</strong> {laboratorio.osDeAbertura}
              </p>
              <p className={`${styles.field} ${styles.name}`}>
                <strong>Patrimônio:</strong> {laboratorio.equipamento.patrimonio}
              </p>
              <p className={`${styles.field} ${styles.name}`}>
                <strong>Instituição Unidade:</strong> {laboratorio.instituicaoUnidade.name}
              </p>
              <p className={`${styles.field} ${styles.name}`}>
                <strong>Status:</strong> {laboratorio.statusControledeLaboratorio.name}
              </p>
              <p className={`${styles.field} ${styles.data}`}>
                <strong>Data:</strong>{" "}
                {laboratorio.created_at
                  ? new Date(laboratorio.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Não informado"}
              </p>
              <FaRegTrashAlt
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCardLaboratorio(laboratorio.id);
                }}
                className={styles.iconTrash}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
