'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { getCookieClient } from '@/lib/cookieClient';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import styles from './RelatorioSecretaria.module.scss';
import { IoClose } from 'react-icons/io5';
import { RiFileExcel2Line } from 'react-icons/ri';

interface TipoInstituicao {
  id: string;
  name: string;
}

interface Props {
  secretaria: 'saude' | 'educacao';
  onClose: () => void;
}

const TIPOS_SAUDE = ['USF', 'SMS', 'UPA', 'UAPS', 'UBS'];
const TIPOS_EDUCACAO = ['ESCOLA', 'CRECHE', 'SME'];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function RelatorioSecretariaModal({ secretaria, onClose }: Props) {
  const [tipos, setTipos] = useState<TipoInstituicao[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gerando, setGerando] = useState(false);

  const titulo = secretaria === 'saude'
    ? 'RELATÓRIO DE TAREFAS SECRETARIA DA SAÚDE'
    : 'RELATÓRIO DE TAREFAS SECRETARIA DA EDUCAÇÃO';

  const prefixosFiltro = secretaria === 'saude' ? TIPOS_SAUDE : TIPOS_EDUCACAO;

  useEffect(() => {
    async function fetchTipos() {
      try {
        const token = await getCookieClient();
        const res = await api.get('/listtipodeinstituicaounidade', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const all: TipoInstituicao[] = res.data || [];
        setTipos(all);

        const preSelected = all
          .filter(t => prefixosFiltro.some(p => t.name.toUpperCase().startsWith(p)))
          .map(t => t.id);
        setSelecionados(preSelected);
      } catch (e) {
        console.error('Erro ao buscar tipos:', e);
      }
    }
    fetchTipos();
  }, [secretaria]);

  function toggleTipo(id: string) {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function handleGerar() {
    if (selecionados.length === 0) {
      toast.error('Selecione ao menos um tipo de instituição.');
      return;
    }
    setGerando(true);
    try {
      const token = await getCookieClient();
      const params: any = { tiposIds: selecionados.join(',') };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/ordens/relatorio-secretaria', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const ordens = res.data || [];

      const periodoTexto = startDate && endDate
        ? `${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`
        : 'Todos os períodos';

      const rows: any[][] = [
        [titulo],
        [`Total de chamados: ${ordens.length}`],
        [`Período: ${periodoTexto}`],
        [],
        ['Código', 'Data', 'Hora', 'Tipo da tarefa', 'Responsável', 'Cliente', 'Orientação', 'Endereço', 'Visualização', 'OS Digital'],
        ...ordens.map((os: any) => [
          os.numeroOS,
          formatDate(os.created_at),
          formatTime(os.created_at),
          os.tarefa?.name || os.tipodeChamado?.name || '-',
          os.tecnico?.name || os.nameTecnico || '-',
          os.instituicaoUnidade?.name || os.cliente?.name || '-',
          os.descricaodoProblemaouSolicitacao || '-',
          os.instituicaoUnidade?.endereco || os.cliente?.endereco || '-',
          formatDate(os.updatedAt),
          `${typeof window !== 'undefined' ? window.location.origin : ''}/os-digital/${os.id}`,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Larguras das colunas
      ws['!cols'] = [
        { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 25 },
        { wch: 20 }, { wch: 30 }, { wch: 50 }, { wch: 35 }, { wch: 18 }, { wch: 60 },
      ];

      // Mescla título (A1:J1)
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'RELATORIO DE TAREFAS');

      const nomeArquivo = `Relatorio_${secretaria === 'saude' ? 'Saude' : 'Educacao'}_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);

      toast.success(`Relatório gerado com ${ordens.length} OS!`);
      onClose();
    } catch (e) {
      console.error('Erro ao gerar relatório:', e);
      toast.error('Erro ao gerar relatório.');
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <IoClose size={22} />
        </button>

        <h2 className={styles.title}>
          <RiFileExcel2Line size={22} />
          {titulo}
        </h2>

        <section className={styles.section}>
          <p className={styles.sectionLabel}>Tipos de Instituição</p>
          <div className={styles.checkboxGrid}>
            {tipos.map(tipo => (
              <label key={tipo.id} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={selecionados.includes(tipo.id)}
                  onChange={() => toggleTipo(tipo.id)}
                />
                <span>{tipo.name}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionLabel}>Período (opcional)</p>
          <div className={styles.dateRow}>
            <div className={styles.dateField}>
              <label>De</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.dateField}>
              <label>Até</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          </div>
        </section>

        <div className={styles.footer}>
          <button className={styles.btnCancelar} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.btnGerar}
            onClick={handleGerar}
            disabled={gerando || selecionados.length === 0}
          >
            <RiFileExcel2Line size={18} />
            {gerando ? 'Gerando...' : 'Gerar Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
