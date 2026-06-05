"use client";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import styles from './FormularioCompras.module.scss';
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { api } from '@/services/api';
import { getCookieClient } from '@/lib/cookieClient';

interface ComprasProps {
  id: string;
  name: string;
}

export default function FormularioCompras() {
  const [compras, setCompras] = useState<ComprasProps[]>([]);
  const router = useRouter();

  function handleBackCardCompras() {
    router.push('/dashboard/compras');
  }

  useEffect(() => {
    async function fetchStatusCompras() {
      try {
        const token = await getCookieClient();
        const response = await api.get("/liststatuscompras", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCompras(response.data);
      } catch (err) {
        console.error("Erro ao buscar status Compras: ", err);
      }
    }

    fetchStatusCompras();
  }, []);

  async function handleFormularioCompras(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const itemSolicitado = formData.get("itemSolicitado");
    const solicitante = formData.get("solicitante");
    const motivoDaSolicitacao = formData.get("motivoDaSolicitacao");
    const preco = Number(formData.get("preco"));
    const linkDeCompra = formData.get("linkDeCompra");
    const statusCompras_id = formData.get("statusCompras_id");

    try {
      const token = await getCookieClient();
      await api.post("/solicitacaodecompras", {
        itemSolicitado,
        solicitante,
        motivoDaSolicitacao,
        preco,
        linkDeCompra,
        statusCompras_id,
      },
        {
          headers:{
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push("/dashboard/compras");
    } catch (err) {
      console.error("Erro ao enviar solicitação de compra: ", err);
    }
  }

  return (
    <section>
      <div className={styles.headerClient}>
        <h1 className={styles.titleClient}>FORMULÁRIO COMPRAS</h1>
        <IoArrowBackCircleOutline size={30} color="#4E3182" onClick={handleBackCardCompras}/>
        <button className={styles.button} onClick={handleBackCardCompras}>
          Voltar para Lista de Compras
        </button>
      </div>

      <div className={styles.container}>
        <section className={styles.login}>
          <form onSubmit={handleFormularioCompras}>
            <input
              type="text"
              required
              name="itemSolicitado"
              placeholder="Digite o Item a ser Solicitado"
              className={styles.input}
            />

            <input
              type="text"
              required
              name="solicitante"
              placeholder="Digite seu Nome"
              className={styles.input}
            />

            <input
              type="text"
              required
              name="motivoDaSolicitacao"
              placeholder="Digite o Motivo da Solicitação"
              className={styles.input}
            />

            <input
              type="number"
              required
              step="0.01"
              name="preco"
              placeholder="Digite o preço do Produto"
              className={styles.input}
            />

            <input
              type="text"
              required
              name="linkDeCompra"
              placeholder="Cole aqui o link de compra"
              className={styles.input}
            />

            <select name="statusCompras_id" className={styles.input} required>
              {compras.length === 0 ? (
                <option disabled>Carregando...</option>
              ) : (
                compras.map((compra) => (
                  <option key={compra.id} value={compra.id}>
                    {compra.name}
                  </option>
                ))
              )}
            </select>

            <button className={styles.button} type="submit">
              Enviar Solicitação
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}
