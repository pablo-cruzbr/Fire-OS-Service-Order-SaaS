'use client'

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

/** Every modal GlobalModal knows how to render. */
export type ModalType =
  | 'assistencia'
  | 'cliente'
  | 'clienteMunicipal'
  | 'compras'
  | 'documentacaoTecnica'
  | 'equipamento'
  | 'Estabilizadores'
  | 'laboratorio'
  | 'laudotecnico'
  | 'maquinasPendentesLab'
  | 'maquinasPendentesOro'
  | 'OrdemdeServico'
  | 'ramaisSetores'
  | 'tecnico'
  | 'usuarios'
  | null;

interface ModalContextProps {
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  modalType: ModalType;
  modalData: any;
  isOpen: boolean;
}

const ModalContext = createContext({} as ModalContextProps);

export const useGlobalModal = () => useContext(ModalContext);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<any>(null);

  const openModal = useCallback((type: ModalType, data?: any) => {
    setModalType(type);
    setModalData(data ?? null);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setModalData(null);
  }, []);

  const value = useMemo(
    () => ({ openModal, closeModal, modalType, modalData, isOpen: modalType !== null }),
    [openModal, closeModal, modalType, modalData],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}
