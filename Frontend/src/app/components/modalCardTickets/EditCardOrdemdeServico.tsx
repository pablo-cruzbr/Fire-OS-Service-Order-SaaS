"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import styles from "../modalCardCompras/editForm.module.scss";
import { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";
import { getCookieClient } from "@/lib/cookieClient";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FaRegSave } from "react-icons/fa";
import Select from 'react-select';

type Status = { id: string; name: string };
type Tecnicos = { id: string; name: string };
type Instituicoes = { id: string; name: string; endereco?: string };
type Cliente = { id: string; name: string; endereco?: string; cnpj?: string };
type Equipamento = {id: string; name: string; patrimonio: string};
type Prioridade = {id: string; name: string};
type Tarefa = {id: string; name: string}; 
type FormState = {
  tecnico_id: string;
  statusOrdemdeServico_id: string;
  instituicaoUnidade_id: string;
  cliente_id: string;
  equipamento_id: string;
  tipodeOrdemdeServico_id: string;
  prioridade_id: string;
  tarefa_id: string;
  diagnostico: string;
  solucao: string;
  descricaodoProblemaouSolicitacao: string;
};

type TipodeOrdemdeServico = { id: string; name: string };
type Props = {
  ordemdeServico?: OrdemdeServicoProps;
  onClose: () => void;
  onSave?: () => void;
};

export default function EditCardOrdemdeServico({ ordemdeServico, onClose, onSave }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    tecnico_id: "",
    statusOrdemdeServico_id: "",
    instituicaoUnidade_id: "",
    cliente_id: "",
    equipamento_id: "",
    tipodeOrdemdeServico_id: "",
    prioridade_id: "",
    tarefa_id: "",
    diagnostico: "",
    solucao: "",
    descricaodoProblemaouSolicitacao: "",
  });
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [tecnicoList, setTecnicoList] = useState<Tecnicos[]>([]);
  const [instituicaoList, setInstituicaoList] = useState<Instituicoes[]>([]);
  const [clienteList, setClienteList] = useState<Cliente[]>([]);
  const [equipamentoList, setEquipamentoList] = useState<Equipamento[]>([]);
  const [tipodeordemdeservicoList, setTipodeOrdemdeServicoList] = useState<TipodeOrdemdeServico[]>([]);
  const [prioridade, setPrioridade] = useState<Prioridade[]>([]);
  const [tarefaList, setTarefaList] = useState<Tarefa[]>([]); 
  const [loading, setLoading] = useState(false);

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: '#fff',
      borderRadius: '10px',
      borderColor: state.isFocused ? '#4E3182' : '#ddd',
      boxShadow: 'none',
      marginBottom: '1rem',
      '&:hover': { borderColor: '#4E3182' }
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: '#fff'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#4E3182' : state.isFocused ? '#f3effa' : '#fff',
      color: state.isSelected ? '#fff' : '#4B4B4B',
      cursor: 'pointer',
      padding: '10px 15px',
      '&:active': { backgroundColor: '#4E3182' }
    }),
    singleValue: (base: any) => ({ ...base, color: '#4B4B4B' }),
    input: (base: any) => ({ ...base, color: '#4B4B4B' }),
    placeholder: (base: any) => ({ ...base, color: '#999' })
  };

  useEffect(() => {
    if (!ordemdeServico) return;

    const clienteId =
      (ordemdeServico as any)?.cliente?.id ??
      (ordemdeServico as any)?.user?.cliente?.id ??
      (ordemdeServico as any)?.informacoesSetor?.cliente?.id ??
      "";

    const instituicaoId =
      (ordemdeServico as any)?.instituicaoUnidade?.id ??
      (ordemdeServico as any)?.instituicaoUnidadeId ??
      "";

    const equipamentoId =
     (ordemdeServico as any)?.equipamento?.id ??
      (ordemdeServico as any)?.equipamentoId ??
      "";

    const tipodeordemdeservicoId = 
    (ordemdeServico as any)?.tipodeordemdeservico?.id ??
    (ordemdeServico as any)?.tipodeordemdeservicoId ?? "";

    const prioridadeId = 
    (ordemdeServico as any)?.prioridadeId?.id ??
    (ordemdeServico as any)?.prioridadeId ?? "";

    const tarefaId = 
    (ordemdeServico as any)?.tarefa?.id ??
    (ordemdeServico as any)?.tarefaId ?? ""; 

    setForm({
      tecnico_id: (ordemdeServico as any)?.tecnico?.id ?? "",
      statusOrdemdeServico_id: (ordemdeServico as any)?.statusOrdemdeServico?.id ?? "",
      instituicaoUnidade_id: instituicaoId?.toString() ?? "",
      cliente_id: clienteId?.toString() ?? "",
      equipamento_id: equipamentoId?.toString() ?? "",
      tipodeOrdemdeServico_id: tipodeordemdeservicoId?.toString() ?? "",
      prioridade_id: prioridadeId?.toString() ?? "",
      tarefa_id: tarefaId?.toString() ?? "",
      diagnostico: (ordemdeServico as any)?.diagnostico ?? "",
      solucao: (ordemdeServico as any)?.solucao ?? "",
      descricaodoProblemaouSolicitacao: (ordemdeServico as any)?.descricaodoProblemaouSolicitacao ?? "",
    });
  }, [ordemdeServico]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = await getCookieClient();
        if (!token) return;

        const [
          tecnicosRes,
          statusRes,
          clienteRes,
          instituicoesRes,
          equipamentoRes,
          tipodeOrdemdeServicoRes,
          prioridadeRes,
          tarefaRes 
        ] = await Promise.all([
          api.get("/listtecnico", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/liststatusordemdeservico", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/listcliente", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/listinstuicao", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/listequipamento", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/listtipodeordemdeservico", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/liststatusprioridade", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/liststatustarefa", { headers: { Authorization: `Bearer ${token}` } }), 
        ]);

        setTecnicoList(tecnicosRes.data.controles ?? []);
        setStatusList(statusRes.data ?? []);
        setClienteList(clienteRes.data.controles ?? []);
        setInstituicaoList(instituicoesRes.data.instituicoes ?? []);
        setEquipamentoList(equipamentoRes.data ?? []);
        setTipodeOrdemdeServicoList(tipodeOrdemdeServicoRes.data ?? [])
        setPrioridade(prioridadeRes.data ?? [])
        setTarefaList(tarefaRes.data ?? []); 

      } catch (error) {
        console.error("Erro ao buscar listas:", error);
      }
    };

    fetchLists();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = await getCookieClient();
      if (!token) throw new Error("Token não encontrado");

      const payload: any = {
        tecnico_id: form.tecnico_id || undefined,
        statusOrdemdeServico_id: form.statusOrdemdeServico_id || undefined,
        cliente_id: form.cliente_id || null,
        instituicaoUnidade_id: form.instituicaoUnidade_id || null,
        equipamento_id: form.equipamento_id || null,
        tipodeOrdemdeServico_id: form.tipodeOrdemdeServico_id || null,
        prioridade_id: form.prioridade_id || null,
        tarefa_id: form.tarefa_id || null,
        diagnostico: form.diagnostico || undefined,
        solucao: form.solucao || undefined,
        descricaodoProblemaouSolicitacao: form.descricaodoProblemaouSolicitacao || undefined,
      };

      if (ordemdeServico) {
        await api.patch(`/ordemdeservico/update/${ordemdeServico.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Ordem de serviço atualizada com sucesso!");
      } else {
        await api.post("/ordemdeservico", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Ordem de serviço criada com sucesso!");
      }

      if (onSave) {
        onSave();
      } else {
        onClose();
      }
      router.refresh();
    } catch (err: any) {
      console.error("Erro ao enviar dados:", err);
      alert("Erro ao enviar os dados da OS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.editForm}>
      <h3>
        <HiOutlinePencilSquare className={styles.icon} />
        {ordemdeServico ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
      </h3>

      <label>
        <p>Prioridade</p>
        <select name="prioridade_id" value={form.prioridade_id} onChange={handleChange} className={styles.input}>
          <option value="">Selecione a Prioridade</option>
          {prioridade.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <label>
        <p>Tipo de Ordem de Serviço</p>
        <select name="tipodeOrdemdeServico_id" value={form.tipodeOrdemdeServico_id} onChange={handleChange} className={styles.input}>
          <option value="">Selecione o Tipo de Ordem de Serviço</option>
          {tipodeordemdeservicoList.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>{tipo.name}</option>
          ))}
        </select>
      </label>

      <label>
        <p>Tarefa</p>
        <select name="tarefa_id" value={form.tarefa_id} onChange={handleChange} className={styles.input}>
          <option value="">Selecione a Tarefa</option>
          {tarefaList.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>

      <label>
        <p>Técnico</p>
        <select name="tecnico_id" value={form.tecnico_id} onChange={handleChange} className={styles.input}>
          <option value="">Selecione o Técnico</option>
          {tecnicoList.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>

      <label>
        <p>Status da OS</p>
        <select name="statusOrdemdeServico_id" value={form.statusOrdemdeServico_id} onChange={handleChange} className={styles.input}>
          <option value="">Selecione o Status</option>
          {statusList.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <div className={styles.inputGroup}>
        <p>Instituição / Unidade</p>
        <Select
          instanceId="instituicao-select"
          placeholder="Selecione a unidade..."
          isSearchable
          options={instituicaoList.map(inst => ({ value: inst.id, label: inst.name }))}
          value={instituicaoList.filter(inst => inst.id === form.instituicaoUnidade_id).map(inst => ({ value: inst.id, label: inst.name }))[0] || null}
          onChange={(opt) => setForm(prev => ({ ...prev, instituicaoUnidade_id: opt ? opt.value : "" }))}
          styles={customSelectStyles}
        />
      </div>

      <label>
        <p>Cliente</p>
        <select name="cliente_id" value={form.cliente_id} onChange={handleChange} className={styles.input}>
          <option value="">Selecione o Cliente (opcional)</option>
          {clienteList.map((cli) => (
            <option key={cli.id} value={cli.id}>{cli.name}</option>
          ))}
        </select>
      </label>

      <label>
        <p>EQUIPAMENTO</p>
        <select name="equipamento_id" value={form.equipamento_id} onChange={handleChange} className={styles.input}>
          <option value="">Selecione o Equipamento (opcional)</option>
          {equipamentoList.map((equi) => (
            <option key={equi.id} value={equi.id}>{equi.patrimonio} - {equi.name}</option>
          ))}
        </select>
      </label>

      <label>
        <p>Orientação / Descrição do Problema</p>
        <textarea
          name="descricaodoProblemaouSolicitacao"
          value={form.descricaodoProblemaouSolicitacao}
          onChange={handleChange as any}
          placeholder="Descreva o problema ou solicitação..."
        />
      </label>

      <label>
        <p>Diagnóstico</p>
        <textarea
          name="diagnostico"
          value={form.diagnostico}
          onChange={handleChange as any}
          placeholder="Diagnóstico realizado pelo técnico..."
        />
      </label>

      <label>
        <p>Solução / Procedimento Realizado</p>
        <textarea
          name="solucao"
          value={form.solucao}
          onChange={handleChange as any}
          placeholder="Descreva a solução aplicada..."
        />
      </label>

      <div className={styles.buttonArea}>
        <button type="button" onClick={handleSubmit} disabled={loading}>
          <FaRegSave className={styles.iconButton} />
          {ordemdeServico ? "Salvar" : "Criar"}
        </button>
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}