'use client';

import { ComponentType } from "react";
import { useGlobalModal, ModalType } from "@/provider/GlobalModalProvider";
import type { EntityModalProps } from "@/features/modalTypes";
import { AssistenciaTecnicaModal } from "@/features/assistenciaTecnica/AssistenciaTecnicaModal";
import { ClienteModal } from "@/features/clientes/ClienteModal";
import { ClienteMunicipalModal } from "@/features/clientesMunicipais/ClienteMunicipalModal";
import { ComprasModal } from "@/features/compras/ComprasModal";
import { DocumentacaoTecnicaModal } from "@/features/documentacaoTecnica/DocumentacaoTecnicaModal";
import { EquipamentoModal } from "@/features/equipamentos/EquipamentoModal";
import { EstabilizadoresModal } from "@/features/estabilizadores/EstabilizadoresModal";
import { LaboratorioModal } from "@/features/laboratorio/LaboratorioModal";
import { LaudoTecnicoModal } from "@/features/laudoTecnico/LaudoTecnicoModal";
import { MaquinasPendentesLabModal } from "@/features/maquinasPendentesLab/MaquinasPendentesLabModal";
import { MaquinasPendentesOroModal } from "@/features/maquinasPendentesOro/MaquinasPendentesOroModal";
import { RamalSetorModal } from "@/features/ramaisSetores/RamalSetorModal";
import { TecnicoModal } from "@/features/tecnicos/TecnicoModal";
import { UsuarioModal } from "@/features/usuarios/UsuarioModal";
import { OrdemModal } from "@/features/ordens/OrdemModal";

const modals: Partial<Record<NonNullable<ModalType>, ComponentType<EntityModalProps<any>>>> = {
  assistencia: AssistenciaTecnicaModal,
  cliente: ClienteModal,
  clienteMunicipal: ClienteMunicipalModal,
  compras: ComprasModal,
  documentacaoTecnica: DocumentacaoTecnicaModal,
  equipamento: EquipamentoModal,
  Estabilizadores: EstabilizadoresModal,
  laboratorio: LaboratorioModal,
  laudotecnico: LaudoTecnicoModal,
  maquinasPendentesLab: MaquinasPendentesLabModal,
  maquinasPendentesOro: MaquinasPendentesOroModal,
  OrdemdeServico: OrdemModal,
  ramaisSetores: RamalSetorModal,
  tecnico: TecnicoModal,
  usuarios: UsuarioModal,
};

/** Renders the modal currently opened through `useGlobalModal().openModal`. */
export default function GlobalModal() {
  const { isOpen, modalType, modalData, closeModal } = useGlobalModal();
  if (!isOpen || !modalType) return null;

  const item = Array.isArray(modalData) ? modalData[0] : modalData;
  const Modal = modals[modalType];
  if (!Modal || !item) return null;
  return <Modal data={item} onClose={closeModal} />;
}
