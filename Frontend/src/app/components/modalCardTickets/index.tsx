"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { SiGoogledocs } from "react-icons/si";
import { FaUserPlus } from "react-icons/fa6";
import { BsImages } from "react-icons/bs";
import { FaSignature } from "react-icons/fa";
import { FaComputer } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";
import { UsuariosProps } from '@/lib/getUsuario.type';
import EditCardOrdemdeServico from "./EditCardOrdemdeServico";
import ViewCardFoto from "./ViewCardFoto";
import DetailTecnico from "./DetailTecnico";
import Assinatura from "./Assinatura";

interface ModalOrdemdeServicoProps {
  data: OrdemdeServicoProps[];
}

export function ModalOrdemdeServico({ data }: ModalOrdemdeServicoProps) {
  const { closeModal, modalData, modalType, isOpen } = useGlobalModal();
  const OrdemdeServico: OrdemdeServicoProps | undefined = modalData?.[0] || modalData;
  const [usuario, setUsuario] = useState<UsuariosProps | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFotos, setIsFotos] = useState(false);
  const [isDetailTecnico, setDetailTecnico] = useState(false);
  const [isAssinatura, setAssinatura] = useState(false)

  const router = useRouter();

  function handleRefresh() {
    router.refresh();
    closeModal();
  }

  useEffect(() => {
    if (modalType === "OrdemdeServico" && !OrdemdeServico) {
      closeModal();
    }
  }, [OrdemdeServico, modalType, closeModal]);

  if (modalType !== "OrdemdeServico" || !isOpen || !OrdemdeServico) return null;

   async function handleAddCard() {
    router.push('/dashboard/formulariosadd/formularioMaquinas');

    const url = '/dashboard/formulariosadd/formularioMaquinas';
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  return (
    <div className={styles.dialogContainer} open>
      <section className={styles.dialogContent}>
        <button onClick={closeModal} className={styles.dialogBack}>
          <IoIosCloseCircleOutline size={36} color="#4E3182" />
        </button>

        <h2>Detalhes da Ordem de Serviço</h2>

        {isFotos && (
          <ViewCardFoto
            ordemdeServico={OrdemdeServico}
            onClose={() => setIsFotos(false)}
          />
        )}

        {isAssinatura && (
          <Assinatura
            ordemdeServico={OrdemdeServico}
            onClose={() => setAssinatura(false)}
          />
        )}

        {/* Se estiver em modo Edição */}
        {isEditing && (
          <EditCardOrdemdeServico
            ordemdeServico={OrdemdeServico}
            onClose={() => setIsEditing(false)}
          />
        )}

        {/* Se estiver em modo Detalhe Técnico */}
        {isDetailTecnico && (
          <DetailTecnico
            ordemdeServico={OrdemdeServico}
            onClose={() => setDetailTecnico(false)}
          />
        )}

        {/* Conteúdo padrão */}
        {!isFotos && !isEditing && !isDetailTecnico && !isAssinatura && (
          <>
            {/* DADOS DO USUÁRIO */}
            <p className={styles.sectionTitle}>Dados do Usuário</p>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Número da OS e Tipo:</label>
                <span>{OrdemdeServico.numeroOS} - {OrdemdeServico.tipodeOrdemdeServico?.name ?? "Tipo de Ordem de Serviço Não Informado"}</span>
              </div>
   
              <div className={styles.infoItem}>
                <label>Quem abriu a OS: </label>
                <span>{OrdemdeServico.name ?? "Nome de Usuário Não Informado no Formulário"}</span>

                <label>Nome de cadastro do usuário: </label>
                <span>{OrdemdeServico.user.name}</span>
               
              </div>
            </div>

            <p className={styles.sectionTitle}>Problema: </p>
               <p>
                  {OrdemdeServico.descricaodoProblemaouSolicitacao || "Não informada"}
            </p>

           <p className={styles.sectionTitle}>Dados de Localização</p>
            <div className={styles.infoItem}>

              {OrdemdeServico.instituicaoUnidade || OrdemdeServico.cliente ? (
                <div className={styles.locationBlock} style={{ marginBottom: '12px' }}>
                  <strong style={{ display: 'block' }}>
                    {OrdemdeServico.instituicaoUnidade?.name || OrdemdeServico.cliente?.name}
                  </strong>
                  <span style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>
                    {OrdemdeServico.instituicaoUnidade?.endereco || OrdemdeServico.cliente?.endereco || "Endereço não disponível"}
                  </span>
                </div>
              ) : (OrdemdeServico.user?.instituicaoUnidade || OrdemdeServico.user?.cliente) && (
                <div className={styles.locationBlock} style={{ marginBottom: '12px' }}>
                  <label>Local de Abertura (Usuário):</label>
                  <strong style={{ display: 'block' }}>
                    {OrdemdeServico.user?.instituicaoUnidade?.name || OrdemdeServico.user?.cliente?.name}
                  </strong>
                  <span style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>
                    {OrdemdeServico.user?.instituicaoUnidade?.endereco || OrdemdeServico.user?.cliente?.endereco || "Endereço não disponível"}
                  </span>
                </div>
              )}

              {((OrdemdeServico.user?.instituicaoUnidade || OrdemdeServico.user?.cliente) && 
                (OrdemdeServico.instituicaoUnidade || OrdemdeServico.cliente) &&
                (OrdemdeServico.user?.instituicaoUnidade?.name !== OrdemdeServico.instituicaoUnidade?.name)) && (
                <div className={styles.locationBlock} style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                  <label>Origem da abertura (Usuário):</label>
                  <span style={{ display: 'block', fontSize: '0.85rem' }}>
                    {OrdemdeServico.user?.instituicaoUnidade?.name || OrdemdeServico.user?.cliente?.name}
                  </span>
                </div>
              )}

              {!(OrdemdeServico.instituicaoUnidade || OrdemdeServico.cliente || OrdemdeServico.user?.instituicaoUnidade || OrdemdeServico.user?.cliente) && (
                <span>Localização não informada</span>
              )}
            </div>

            {/* DADOS DA SOLICITAÇÃO */}
            <p className={styles.sectionTitle}>Dados da Solicitação</p>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Tipo de Serviço:</label>
                <span>{OrdemdeServico.tipodeChamado.name}</span>
              </div>

             
              <div className={styles.infoItem}>
                <label>Pessoa a ser procurada no local:</label>
                <span>{OrdemdeServico.nomedoContatoaserProcuradonoLocal}</span>
              </div>

              <div className={styles.infoItem}>
                <label>Status da OS:</label>
                <span>{OrdemdeServico.statusOrdemdeServico?.name ?? "-"}</span>
              </div>

               <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span>{OrdemdeServico.equipamento?.name}</span> 
                <span> {OrdemdeServico.equipamento?.patrimonio}</span>
                <label>Patrimônio:</label>
                {OrdemdeServico.patrimoniodoequipamento || "Não informada"}
              </div>
            </div>


              <div className={styles.infoItem}>
                <label>Técnico Responsável:</label>
                <span>{OrdemdeServico.tecnico?.name ?? "Não informado"}</span>
              </div>

              <div className={styles.infoItem}>
                <label>Tarefa:</label>
                  <span>{OrdemdeServico.tarefa?.name ?? "Não informado"}</span>
              </div>

        
          
              <div className={styles.infoItem}>
                <label>Data de Criação:</label>
                <span>
                  {OrdemdeServico.created_at
                    ? new Date(OrdemdeServico.created_at).toLocaleDateString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "-"}
                </span>
              </div>

            </div>
            

            {/* BOTÕES */}
            <div className={styles.areaButton}>


              <button className={styles.buttonBuy} onClick={() => setAssinatura(true)}>
                <FaSignature size={20} />
              </button>
              
               <button className={styles.buttonBuy} onClick={() => setIsFotos(true)}>
                <BsImages size={18} />
                Ver Fotos
              </button>

              <button className={styles.buttonBuy} onClick={() => setDetailTecnico(true)}>
                <SiGoogledocs  size={18}/>               
              </button>

              <button className={styles.buttonBuy} onClick={() => setIsEditing(true)}>
                <FaUserPlus size={18} />
                Atribuir OS a um Técnico ou Alterar Status
              </button>

              <button className={styles.buttonBuy} onClick={handleAddCard}>
                <FaComputer size={21} />
                Cadastrar nova Máquina
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
