'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './carListCompras.module.scss';
import { FaRegTrashAlt } from "react-icons/fa";
import { useGlobalModal } from '@/provider/GlobalModalProvider';
import { ComprasProps, ComprasResponse } from '@/lib/getCompras.type';
import { getCookieClient } from '@/lib/cookieClient';
import { api } from '@/services/api';
import { LuRefreshCcw } from "react-icons/lu";

interface Props {
  comprasData?: ComprasResponse;
}
export default function ComprasList({ comprasData }: Props) {
  const { openModal } = useGlobalModal();
  const router = useRouter();

  const {
    controles = [],
    total = 0,
    totalAguardandoCompra = 0,
    totalAguardandoEntrega = 0,
    totalCompraFinalizada = 0,
  } = comprasData || {};

  function handleDetailCompra(compra: ComprasProps) {
    openModal('compras', [compra]); 
  }

  function getStatusName(status: string | { name: string }): string {
    return typeof status === 'string' ? status : status.name;
  }

  function handleAddCardCompras() {
    router.push('/dashboard/compras/formularioCompras');
  }

  async function handleDeleteCardCompras(compra_id: string) {
    try {
      const token = getCookieClient();

      await api.delete(`/deletedesolicitacaodecompras/${compra_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          compra_id,
        },
      });
      alert("Card Deletado com sucesso!");

      router.refresh();
    } catch (error) {
      console.error("Erro ao deletar a compra:", error);
    }
  }

  
function handlerefresh(){
    router.refresh();
  }

  return (
    <section>
      <div className={styles.headerClient}>
        <h1 className={styles.titleClient}>Lista de Compras</h1>

        <div className={styles.actions}>
          <button className={styles.button} onClick={handleAddCardCompras}>
            Fazer um Pedido
          </button>
          <LuRefreshCcw onClick={handlerefresh} className={styles.refresh}/>
        </div>
      </div>

      <div className={styles.cardsContainer}>
              <div className={styles.card}>
                <p className={styles.cardTitle}>Total</p>
                <strong className={styles.cardNumber}>{total}</strong>
              </div>
      
              <div className={styles.card}>
                <p className={styles.cardTitle}>Aguardando Compra</p>
                <strong className={styles.cardNumber}>{totalAguardandoCompra}</strong>
              </div>
      
              <div className={styles.card}>
                <p className={styles.cardTitle}>Aguardando Entrega</p>
                <strong className={styles.cardNumber}>{totalAguardandoEntrega}</strong>
              </div>

              <div className={styles.card}>
                <p className={styles.cardTitle}>Compra Finalizada</p>
                <strong className={styles.cardNumber}>{totalCompraFinalizada}</strong>
              </div>
            </div>

      <div className={styles.listContainer}>
        {controles.map((compra, index) => (
          <div
            key={compra.id}
            className={styles.list}
            onClick={() => handleDetailCompra(compra)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.clientDetail}>
              <p className={`${styles.field} ${styles.name}`}>
                <strong>{index + 1} - Item Solicitado:</strong> {compra.itemSolicitado}
              </p>
              <p className={`${styles.field} ${styles.ticket}`}>
                <strong>Solicitante:</strong> {compra.solicitante}
              </p>
              <p className={`${styles.field} ${styles.tecnico}`}>
                <strong>Status:</strong> {getStatusName(compra.statusCompras)}
              </p>
              <p className={`${styles.field} ${styles.data}`}>
                <strong>Data:</strong>{' '}
                {compra.created_at
                  ? new Date(compra.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Não informado'}
              </p>
              <FaRegTrashAlt
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCardCompras(compra.id);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
