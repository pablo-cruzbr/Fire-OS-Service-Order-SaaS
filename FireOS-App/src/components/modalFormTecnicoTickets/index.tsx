import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ModalDetailOrderTecnicoProps {
  handleCloseModal: () => void;
  visible: boolean;
}

interface TipoChamado {
  id: string;
  name: string;
}

interface StatusOrdem {
  id: string;
  name: string;
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
}

interface UsuarioStorage {
  id: string;
  name: string;
  token: string;
  cliente?: { id: string };
  instituicaoUnidade?: { id: string };
  tecnico?: { id: string };
}

export function ModalFormTecnicoTickets({
  handleCloseModal,
  visible,
}: ModalDetailOrderTecnicoProps) {
  const [descricaoProblema, setDescricaoProblema] = useState("");
  const [solucao, setSolucao] = useState("");
  const [statusId, setStatusId] = useState("");
  const [tipoChamadoId, setTipoChamadoId] = useState("");
  const [ramal, setRamal] = useState("");
  const [setorInfo, setSetorInfo] = useState<Setor | null>(null);
  const [usuarioBusca, setUsuarioBusca] = useState<string>("");
  const [informacoesSetor, setInformacoesSetor] = useState<Setor | string | null>(null);
  
  const [buscaGeral, setBuscaGeral] = useState("");
  const [statusList, setStatusList] = useState<StatusOrdem[]>([]);
  const [tiposChamado, setTiposChamado] = useState<TipoChamado[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        const storage = await AsyncStorage.getItem("@AlltiService");
        if (!storage) return;

        const usuario: UsuarioStorage = JSON.parse(storage);
        const token = usuario.token;

        const [statusRes, tiposRes] = await Promise.all([
          api.get<StatusOrdem[]>("/liststatusordemdeservico", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get<TipoChamado[]>("/listtipodechamado", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStatusList(statusRes.data);
        setTiposChamado(tiposRes.data);
      } catch (err: any) {
        console.error(err.response?.data || err.message);
        Alert.alert("Erro", "Não foi possível carregar dados iniciais.");
      }
    })();
  }, [visible]);

const handlePesquisaHibrida = async () => {
  const normalizeString = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const termo = buscaGeral.trim();
  if (!termo) return;

  try {
    const storage = await AsyncStorage.getItem("@AlltiService");
    if (!storage) return;
    const { token } = JSON.parse(storage);

    const ehNumero = /^\d+$/.test(termo);
    const queryParam = ehNumero ? `ramal=${termo}` : `usuario=${termo}`;

    const res = await api.get<Setor[]>(`/listinformacoessetor?${queryParam}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const termoNormalizado = normalizeString(termo);

    const encontrado = res.data.find((s) => {
      if (ehNumero) return s.ramal === termo;
      
      const usuarioBancoNormalizado = normalizeString(s.usuario || "");
      return usuarioBancoNormalizado.includes(termoNormalizado);
    });

    if (encontrado) {
      setSetorInfo(encontrado);
      setInformacoesSetor(encontrado.id);
    } else {
      Alert.alert("Aviso", `Nenhum registro para: ${termo}`);
    }
  } catch (err) {
    console.error(err);
    Alert.alert("Erro", "Falha na busca.");
  }
};


  const handleSubmit = async () => {
    if (!descricaoProblema || !solucao || !statusId || !tipoChamadoId) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);

      const storage = await AsyncStorage.getItem("@AlltiService");
      if (!storage) {
        Alert.alert("Erro", "Token não encontrado. Faça login novamente.");
        return;
      }

      const usuario: UsuarioStorage = JSON.parse(storage);
      const TICKET_TYPE_ID = "9255770c-a7b5-400b-9773-8b249f04b9ed";
      const token = usuario.token;

      if (!usuario.id) {
        Alert.alert("Erro", "Usuário inválido. Faça login novamente.");
        return;
      }

      const numeroOS = Math.floor(10000 + Math.random() * 90000);

      const payload = {
        name: usuario.name || "Sem nome",
        descricaodoProblemaouSolicitacao: descricaoProblema,
        nomedoContatoaserProcuradonoLocal: null,
        user_id: usuario.id,
        tipodeChamado_id: tipoChamadoId,
        tipodeOrdemdeServico_id: TICKET_TYPE_ID, 
        statusOrdemdeServico_id: statusId,
        cliente_id: usuario.cliente?.id || null,
        instituicaoUnidade_id: usuario.instituicaoUnidade?.id || null,
        tecnico_id: usuario.tecnico?.id || null,
        solucao,
        numeroOS,
        informacoesSetorId: setorInfo?.id || null,
      };

      const response = await api.post("/ordemdeservico", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

    
      Alert.alert("Sucesso", "OS concluída com sucesso!");
      handleCloseModal();
    } catch (error: any) {
      console.error("Erro de resposta do servidor:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível concluir a OS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Criar um Ticket</Text>

          <TextInput
            placeholder="Descrição do Problema"
            style={[styles.input, styles.textArea]}
            value={descricaoProblema}
            onChangeText={setDescricaoProblema}
            multiline
          />

          <TextInput
            placeholder="Solução"
            style={[styles.input, styles.textArea]}
            value={solucao}
            onChangeText={setSolucao}
            multiline
          />

          <Text style={styles.label}>Qual o Status do ticket</Text>
          <Picker
            selectedValue={statusId}
            onValueChange={setStatusId}
            style={styles.picker}
          >
            <Picker.Item label="Selecione o Status" value="" />
            {statusList.map((status) => (
              <Picker.Item key={status.id} label={status.name} value={status.id} />
            ))}
          </Picker>

          <Text style={styles.label}>Tipo de Chamado</Text>
          <Picker
            selectedValue={tipoChamadoId}
            onValueChange={setTipoChamadoId}
            style={styles.picker}
          >
            <Picker.Item label="Selecione o Tipo de Chamado" value="" />
            {tiposChamado.map((tipo) => (
              <Picker.Item key={tipo.id} label={tipo.name} value={tipo.id} />
            ))}
          </Picker>

          <View style={styles.row}>
            <TextInput
              placeholder="Ramal ou Nome do Usuário"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={buscaGeral}
              onChangeText={setBuscaGeral}
              autoCapitalize="none"
              keyboardType="default" 
              onSubmitEditing={handlePesquisaHibrida}
            />
            <TouchableOpacity
              style={styles.buttonSmall}
              onPress={handlePesquisaHibrida}
            >
              <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          {setorInfo && (
          <View style={styles.infoBox}>
            <Text>Setor: {setorInfo?.setor.name || "Não Encontrado"}</Text>
            <Text>Ramal: {setorInfo?.ramal || "Não Encontrado"}</Text>
            <Text>Usuário: {setorInfo?.usuario || "Não Encontrado"}</Text>
            <Text>Andar: {setorInfo?.andar || "Não Encontrado"}</Text>
          </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Concluir OS</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonClose} onPress={handleCloseModal}>
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4E3182",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonSmall: {
    backgroundColor: "#4E3182",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: "#888",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
