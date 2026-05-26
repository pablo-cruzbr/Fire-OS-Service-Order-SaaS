import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { AuthContext } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ModalDetailOrder } from "../../components/modalDetailOrder";
import { useNavigation } from "@react-navigation/native";

export type OrdensDeServico = {
  id: string;
  name: string;
  descricaodoProblemaouSolicitacao: string;
  nomedoContatoaserProcuradonoLocal: string;
  created_at: string;
  nameTecnico: string | null;
  diagnostico: string | null;
  solucao: string | null;
  bannerassinatura: string | null;
  assinante: string | null;
  numeroOS: number;
  startedAt?: string | null;
  endedAt?: string | null;
  duracao?: number;
  informacoesSetor?: {
    id: string;
    usuario: string;
    ramal: string;
    andar: string;
    setor: { id: string; name: string };
    instituicaoUnidade: { id: string; name: string };
    cliente: { id: string; name: string };
  } | null;
  user: {
    id: string;
    name: string;
    instituicaoUnidade: { name: string; endereco: string } | null;
    cliente: {id: string; name: string; endereco: string } | null;
    setor: { name: string } | null;
  };
  tipodeOrdemdeServico: { id: string; name: string } | null;
  tipodeChamado: {id: string; name: string | null};
  cliente: { id: string; name: string; endereco: string, cnpj: string | null } | null;
  tecnico: { id: string; name: string } | null;
  instituicaoUnidade: { id: string; name: string; endereco: string } | null;
  statusOrdemdeServico: { id: string; name: string} | null;
  prioridade: { id: string; name: string } | null;
};

type Instituicao = { id: string; name: string };
type Cliente = { id: string; name: string };
type TipodeOrdem = { id: string; name: string };
type Prioridade = { id: string; name: string };

const STATUS_COLORS: Record<string, string> = {
  "ABERTA": "#27AE60",
  "EM ANDAMENTO": "#2980B9",
  "CONCLUIDA": "#95A5A6",
  "PAUSADA": "#F39C12",
};

function getStatusColor(name?: string | null): string {
  return STATUS_COLORS[name?.trim().toUpperCase() ?? ""] ?? "#BDC3C7";
}

function getPrioridadeColor(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("alta") || l.includes("urgent") || l.includes("crít")) return "#E74C3C";
  if (l.includes("méd") || l.includes("med")) return "#F39C12";
  return "#27AE60";
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes}min`;
  if (hours < 24) return `há ${hours}h`;
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}

export default function Dashboard() {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);

  const [ordensDeServico, setOrdensDeServico] = useState<OrdensDeServico[]>([]);
  const [filteredOrdens, setFilteredOrdens] = useState<OrdensDeServico[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [instituicaoFilter, setInstituicaoFilter] = useState<string>("");
  const [clienteFilter, setClienteFilter] = useState<string>("");
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalOsDetailVisible, setModalOsVisible] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState<OrdensDeServico | null>(null);
  const [loading, setLoading] = useState(false);
  const [tiposOrdem, setTiposOrdem] = useState<TipodeOrdem[]>([]);
  const [tipoOrdemFilter, setTipoOrdemFilter] = useState<string>("");
  const [prioridades, setPrioridades] = useState<Prioridade[]>([]);
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const activeFiltersCount = [tipoOrdemFilter, instituicaoFilter, clienteFilter, prioridadeFilter].filter(Boolean).length;

  const clearFilters = () => {
    setTipoOrdemFilter("");
    setInstituicaoFilter("");
    setClienteFilter("");
    setPrioridadeFilter("");
  };

  const statusList = [
    { id: "all", name: "TODOS" },
    { id: "80e14fbe-c7fd-45bc-b3cd-cfa51ede44e0", name: "ABERTA" },
    { id: "ce3a8414-704c-4562-bb3d-b400fe9f3b6b", name: "EM ANDAMENTO" },
    { id: "fa69ed32-20b2-4d3a-9a6d-e61c5b45efea", name: "CONCLUIDA" },
    { id: "f5341cb0-e6e1-4a5a-b5fc-c55386e55222", name: "PAUSADA" },
  ];

const loadOrdens = async () => {
  setLoading(true);
  try {
    const storageToken = await AsyncStorage.getItem("@AlltiService");
    if (!storageToken) return;

    const { token } = JSON.parse(storageToken);
    if (!token) return;

    const response = await api.get("/listordemdeservico", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("QTD DE ORDENS RECEBIDAS:", response.data.controles?.length);
console.log("DADOS COMPLETOS:", JSON.stringify(response.data.controles, null, 2));

    const ordens = response.data.controles || []; 
    
    setOrdensDeServico(ordens);
    setFilteredOrdens(ordens);
    console.log("QTD FINAL NA LISTA:", filteredOrdens.length);
  } catch (error) {
    console.error("Erro ao carregar ordens de serviço:", error);
  } finally {
    setLoading(false);
  }
};

  // Carrega filtros de instituição e cliente
  const loadFilters = async () => {
    try {
      const storageToken = await AsyncStorage.getItem("@AlltiService");
      if (!storageToken) return;

      const { token } = JSON.parse(storageToken);
      if (!token) return;

      // Instituições
      const instResponse = await api.get("/listinstuicao", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const instList = instResponse.data.instituicoes || [];
      setInstituicoes(instList.map((inst: any) => ({ id: inst.id, name: inst.name })));

      // Clientes
      const cliResponse = await api.get("/listcliente", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cliList = cliResponse.data.controles || [];
      setClientes(cliList.map((cli: any) => ({ id: cli.id, name: cli.name })));

      const tipoResponse = await api.get("/listtipodeordemdeservico", {
        headers: {},
      });
      const tipoList = tipoResponse.data || [];
      setTiposOrdem(tipoList.map((tipo: any) => ({ id: tipo.id, name: tipo.name })));

      const prioResponse = await api.get("/liststatusprioridade", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prioList = prioResponse.data || [];
      setPrioridades(prioList.map((p: any) => ({ id: p.id, name: p.name })));

    } catch (error) {
      console.error("Erro ao carregar filtros:", error);
    }
  };

  // Filtragem
  useEffect(() => {
    let result = [...ordensDeServico];

    // Pesquisa
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (os) =>
          os.numeroOS?.toString().includes(lower) ||
          os.instituicaoUnidade?.name?.toLowerCase().includes(lower) ||
          os.user?.cliente?.name?.toLowerCase().includes(lower)
      );
    }

  
    if (statusFilter && statusFilter !== "TODOS") {
      result = result.filter((os) => os.statusOrdemdeServico?.name === statusFilter);
    }

   
    if (instituicaoFilter) {
      result = result.filter(
        (os) => os.instituicaoUnidade?.id === instituicaoFilter
      );
    }

   
    if (clienteFilter) {
      result = result.filter(
        (os) => os.user?.cliente?.id === clienteFilter || os.cliente?.id === clienteFilter
      );
    }

    if (tipoOrdemFilter) {
      result = result.filter(
        (os) => os.tipodeOrdemdeServico?.id === tipoOrdemFilter
      );
    }

    if (prioridadeFilter) {
      result = result.filter(
        (os) => os.prioridade?.id === prioridadeFilter
      );
    }

    setFilteredOrdens(result);
  }, [search, statusFilter, instituicaoFilter, clienteFilter, ordensDeServico, tipoOrdemFilter, prioridadeFilter]);

 
  useEffect(() => {
    loadOrdens();
    loadFilters();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
  
      <View style={styles.header}>
        <Image source={require("../../assets/logoperfil2.png")} style={styles.profileImage} />
        <Text style={styles.title}>Ordens de Serviço</Text>
        <View style={styles.headerIcons}>
          <SimpleLineIcons name="logout" size={20} color="#fff" style={styles.icon} onPress={signOut}/>
          <Feather name="user" size={24} color="#fff" style={styles.icon} />
          {loading ? (
            <ActivityIndicator size="small" color="#fff" style={styles.icon} />
          ) : (
            <Ionicons
              name="refresh"
              size={22}
              color="#fff"
              style={styles.icon}
              onPress={loadOrdens}
            />
          )}
        </View>
      </View>

    
      <TextInput
        style={styles.input}
        placeholder="Pesquisar por número da OS, Instituição ou Empresa"
        value={search}
        onChangeText={setSearch}
      />

    
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="options-outline" size={18} color="#4E3182" />
        <Text style={styles.filterButtonText}>Filtros</Text>
        {activeFiltersCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
          </View>
        )}
      </TouchableOpacity>
     
      <View style={styles.statusRow}>
        {statusList.map((status) => {
          const active =
            statusFilter === status.name || (status.id === "all" && statusFilter === "");
          return (
            <TouchableOpacity
              key={status.id}
              style={[styles.statusButton, active && styles.statusButtonActive]}
              onPress={() => setStatusFilter(status.id === "all" ? "" : status.name)}
            >
              <Text style={[styles.statusText, active && styles.statusTextActive]}>
                {status.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

     
  
      <FlatList
        data={filteredOrdens}
        keyExtractor={(item) => item.id}
       renderItem={({ item }) => {
  const statusColor = getStatusColor(item.statusOrdemdeServico?.name);
  const local = item.instituicaoUnidade?.name || item.user?.cliente?.name || item.cliente?.name;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => { setSelectedOrdem(item); setModalOsVisible(true); }}
      activeOpacity={0.85}
    >
      <View style={[styles.cardAccent, { backgroundColor: statusColor }]} />

      <View style={styles.cardBody}>

        {/* Linha 1: número + badge de status */}
        <View style={styles.cardRowSpaced}>
          <Text style={styles.cardNumber}>OS #{item?.numeroOS ?? "N/A"}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {item?.statusOrdemdeServico?.name ?? "—"}
            </Text>
          </View>
        </View>

        {/* Local do chamado */}
        {!!local && (
          <View style={styles.cardRowInfo}>
            <Ionicons name="business-outline" size={13} color="#888" />
            <Text style={styles.cardInfoText} numberOfLines={1}>{local}</Text>
          </View>
        )}

        {/* Prioridade */}
        {item?.prioridade?.name && (
          <View style={[styles.priorityBadge, { backgroundColor: getPrioridadeColor(item.prioridade.name) + "18" }]}>
            <Text style={[styles.priorityBadgeText, { color: getPrioridadeColor(item.prioridade.name) }]}>
              ⚠  {item.prioridade.name}
            </Text>
          </View>
        )}

        {/* Descrição do problema */}
        {!!item?.descricaodoProblemaouSolicitacao && (
          <View style={styles.cardRowInfo}>
            <Ionicons name="chatbubble-outline" size={13} color="#888" />
            <Text style={styles.cardProblemText} numberOfLines={1}>
              {item.descricaodoProblemaouSolicitacao}
            </Text>
          </View>
        )}

        {/* Data */}
        <View style={styles.cardRowInfo}>
          <Ionicons name="time-outline" size={12} color="#bbb" />
          <Text style={styles.cardDateText}>{timeAgo(item?.created_at)}</Text>
        </View>

      </View>
    </TouchableOpacity>
  );
}}
        contentContainerStyle={{ paddingBottom: 90, paddingTop: 10 }}
      />

     
      <Modal
        transparent
        visible={modalOsDetailVisible}
        animationType="slide"
        onRequestClose={() => setModalOsVisible(false)}
      >
        <ModalDetailOrder
          ordem={selectedOrdem}
          handleCloseModal={() => setModalOsVisible(false)}
        />
      </Modal>

     
      <TouchableOpacity style={styles.fabSecondary} onPress={signOut}>
        <Feather name="log-in" size={28} color="#fff" />
      </TouchableOpacity>

       <TouchableOpacity
        style={styles.fabSecondary}
        onPress={() => navigation.navigate("ListOrdemdeServicoInterna" as never)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="form-select" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal de filtros — bottom sheet */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.filterOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        />
        <View style={styles.filterSheet}>
          <View style={styles.filterHandle} />

          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filtros</Text>
            {activeFiltersCount > 0 && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.filterClearText}>Limpar tudo</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.filterLabel}>Tipo de OS</Text>
          <Picker
            selectedValue={tipoOrdemFilter}
            style={styles.picker}
            onValueChange={(value) => setTipoOrdemFilter(value)}
          >
            <Picker.Item label="Todos os tipos" value="" />
            {tiposOrdem.map((tipo) => (
              <Picker.Item key={tipo.id} label={tipo.name} value={tipo.id} />
            ))}
          </Picker>

          <Text style={styles.filterLabel}>Instituição</Text>
          <Picker
            selectedValue={instituicaoFilter}
            style={styles.picker}
            onValueChange={(value) => setInstituicaoFilter(value)}
          >
            <Picker.Item label="Todas as instituições" value="" />
            {instituicoes.map((inst) => (
              <Picker.Item key={inst.id} label={inst.name} value={inst.id} />
            ))}
          </Picker>

          <Text style={styles.filterLabel}>Cliente</Text>
          <Picker
            selectedValue={clienteFilter}
            style={styles.picker}
            onValueChange={(value) => setClienteFilter(value)}
          >
            <Picker.Item label="Todos os clientes" value="" />
            {clientes.map((cli) => (
              <Picker.Item key={cli.id} label={cli.name} value={cli.id} />
            ))}
          </Picker>

          <Text style={styles.filterLabel}>Prioridade</Text>
          <Picker
            selectedValue={prioridadeFilter}
            style={styles.picker}
            onValueChange={(value) => setPrioridadeFilter(value)}
          >
            <Picker.Item label="Todas as prioridades" value="" />
            {prioridades.map((prio) => (
              <Picker.Item key={prio.id} label={prio.name} value={prio.id} />
            ))}
          </Picker>

          <TouchableOpacity
            style={styles.filterApplyButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.filterApplyText}>
              {activeFiltersCount > 0 ? `Aplicar (${activeFiltersCount})` : "Fechar"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    backgroundColor: "#4E3182",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 20,
  },
  profileImage: { width: 35, height: 35, borderRadius: 50 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", flex: 1, textAlign: "center" },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: 15 },
  input: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  filterRow: { flexDirection: "row", marginHorizontal: 10, marginBottom: 10 },
  picker: {
    height: 60,
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: 8,
  marginBottom: 10,
  },
  statusRow: { flexDirection: "row", paddingHorizontal: 10, marginBottom: 10, flexWrap: "wrap" },
  statusButton: {
    width: 100,
    height: 30,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 7,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statusButtonActive: { backgroundColor: "#4E3182" },
  statusText: { fontSize: 11, color: "#333", fontWeight: "600" },
  statusTextActive: { color: "#fff" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 9,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  cardBody: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 13,
    gap: 5,
  },
  cardRowSpaced: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F1431",
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardRowInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cardInfoText: {
    fontSize: 12,
    color: "#555",
    flex: 1,
  },
  priorityBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 1,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardProblemText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    fontStyle: "italic",
  },
  cardDateText: {
    fontSize: 11,
    color: "#bbb",
  },
  fab: {
    position: "absolute",
    bottom: 120,
    right: 20,
    backgroundColor: "#4E3182",
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    zIndex: 99,
  },
  fabSecondary: {
    position: "absolute",
    bottom: 50,
    right: 20,
    backgroundColor: "#4E3182",
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  // Botão de filtro
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginHorizontal: 10,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#4E3182",
    backgroundColor: "#fff",
    gap: 6,
  },
  filterButtonText: {
    color: "#4E3182",
    fontWeight: "700",
    fontSize: 13,
  },
  filterBadge: {
    backgroundColor: "#4E3182",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // Bottom sheet de filtros
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  filterSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 10,
    maxHeight: "85%",
  },
  filterHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F1431",
  },
  filterClearText: {
    fontSize: 13,
    color: "#E74C3C",
    fontWeight: "600",
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555",
    marginTop: 14,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterApplyButton: {
    marginTop: 14,
    backgroundColor: "#4E3182",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  filterApplyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
