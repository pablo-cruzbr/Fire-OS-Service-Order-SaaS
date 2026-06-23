import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrdensDeServico } from "../../pages/Dashboard";
import { api } from "../../services/api";
import { ModalEditFormTicketInterno } from "../modalFormEditTicketInterno";

interface ModalDetailOsProps {
  ordem: OrdensDeServico | null;
  visible: boolean;
  handleCloseModal: () => void;
}

interface Setor {
  id: string;
  usuario: string;
  ramal: string;
  andar: string;
  setor: {
    id: string;
    name: string;
  };
  instituicaoUnidade: {
    id: string;
    name: string;
  }
  cliente:{
    id: string;
    name: string;

  }
}

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

export function ModalDetailTicketInterno({
  ordem,
  visible,
  handleCloseModal,
}: ModalDetailOsProps) {
  const [ordemAtual, setOrdemAtual] = useState<OrdensDeServico | null>(ordem);
  const [setorInfo, setSetorInfo] = useState<Setor | null>(null);
  const [modalTecnicoOpen, setModalTecnicoOpen] = useState(false);

  useEffect(() => {
    setOrdemAtual(ordem);
  }, [ordem]);

  useEffect(() => {
    if (!visible || !ordemAtual) return;

    const nomeSetor = ordemAtual.user.setor?.name;
    if (!nomeSetor) return;

    fetchSetorInfo(nomeSetor);
  }, [visible, ordemAtual]);

  const fetchSetorInfo = async (nomeSetor: string) => {
    try {
      const storage = await AsyncStorage.getItem("@AlltiService");
      if (!storage) return;

      const usuario = JSON.parse(storage);
      const token = usuario.token;

      const res = await api.get<Setor[]>("/listinformacoessetor", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const encontrado = res.data.find((s) => s.setor.name === nomeSetor);
      setSetorInfo(encontrado || null);

      if (!encontrado)
        Alert.alert("Atenção", "Nenhum setor encontrado para este ticket.");
    } catch (error) {
      console.error("Erro ao buscar setor:", error);
      Alert.alert("Erro", "Não foi possível buscar o setor.");
    }
  };

  if (!visible || !ordemAtual) return null;

  const endereco =
    ordemAtual.user?.cliente?.endereco ??
    ordemAtual.instituicaoUnidade?.endereco ??
    "";

   const atualizarOrdem = () => setOrdemAtual({ ...ordemAtual });

  const abrirWaze = (endereco: string) => {
    const url = `https://waze.com/ul?q=${encodeURIComponent(endereco)}`;
    Linking.canOpenURL(url).then((supported) =>
      supported
        ? Linking.openURL(url)
        : Alert.alert("Erro", "Não foi possível abrir o Waze.")
    );
  };

  const abrirGoogleMaps = (endereco: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      endereco
    )}`;
    Linking.openURL(url);
  };

  return (
    <>
      <Modal transparent animationType="fade" visible={visible}>
        <TouchableOpacity style={styles.overlay} onPress={handleCloseModal}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
            <ScrollView>
              <View style={styles.header}>
                <Text style={styles.title}>Detalhes do Ticket</Text>
                 <TouchableOpacity onPress={atualizarOrdem} style={styles.refreshIcon}>
                                <MaterialIcons name="refresh" size={24} color="#0F1431" />
                              </TouchableOpacity>
                <TouchableOpacity onPress={handleCloseModal}>
                  <MaterialIcons name="close" size={24} color="#0F1431" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Data e Hora:</Text>
              <Text>
                {ordemAtual.created_at
                  ? new Date(ordemAtual.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Não informado"}
              </Text>

              <Text style={styles.label}>
                Número do Ticket: {ordemAtual.numeroOS ?? "-"}
              </Text>
              <Text style={styles.label}>
                Status: {ordemAtual.statusOrdemdeServico?.name ?? "-"}
              </Text>
              

              {ordemAtual.informacoesSetor && (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.label}>Local do Chamado: </Text>

                  {ordemAtual?.informacoesSetor?.instituicaoUnidade?.name ? (
                    <Text>{ordemAtual.informacoesSetor.instituicaoUnidade.name}</Text>
                  ) : ordemAtual?.informacoesSetor?.cliente?.name ? (
                    <Text>{ordemAtual.informacoesSetor.cliente.name}</Text>
                  ) : (
                    <Text>Não informado</Text>
                  )}

                  <Text style={styles.label}>
                    Informações do usuário que solicitou o chamado
                  </Text>
                  
                  <Text>Setor: {ordemAtual.informacoesSetor.setor.name}</Text>
                  <Text>Usuário: {ordemAtual.informacoesSetor.usuario}</Text>
                  <Text>Ramal: {ordemAtual.informacoesSetor.ramal}</Text>
                  <Text>Andar: {ordemAtual.informacoesSetor.andar}</Text>
                </View>
              )}

              <Text style={styles.label}>Descrição do Problema</Text>
              <Text>
                {ordemAtual.descricaodoProblemaouSolicitacao || "-"}
              </Text>

              <Text style={styles.label}>Solução</Text>
              <Text>{ordemAtual.solucao || "-"}</Text>

              <Text style={styles.label}>Tipo de Chamado</Text>
              <Text>{ordemAtual.tipodeChamado?.name || "-"}</Text>

              <Text style={styles.label}>Quem abriu e Fechou o Ticket</Text>
              <Text>{ordemAtual.user?.name || "-"}</Text>

              <TouchableOpacity
                style={styles.buttonClose}
                onPress={() => setModalTecnicoOpen(true)}
              >
                <View style={styles.buttonContent}>
                  <MaterialIcons name="description" size={20} color="#FFF" />
                  <Text style={styles.textButtonClose}>
                    EDITAR DESCRIÇÃO TÉCNICA
                  </Text>
                </View>
              </TouchableOpacity>

              {endereco ? (
                <>
                  <TouchableOpacity
                    style={styles.buttonClose}
                    onPress={() => abrirWaze(endereco)}
                  >
                    <Text style={styles.textButtonClose}>ABRIR NO WAZE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buttonClose}
                    onPress={() => abrirGoogleMaps(endereco)}
                  >
                    <Text style={styles.textButtonClose}>
                      ABRIR NO GOOGLE MAPS
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal transparent animationType="none" visible={modalTecnicoOpen}>
        <ModalEditFormTicketInterno
          ordemId={ordemAtual.id}
          handleCloseModal={() => setModalTecnicoOpen(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: WIDTH - 30,
    maxHeight: HEIGHT - 100,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  buttonClose: {
    marginTop: 15,
    backgroundColor: "#4E3182",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  
  refreshIcon: {
    left: 40,
  },
  textButtonClose: {
    color: "#FFF",
    fontWeight: "bold",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
