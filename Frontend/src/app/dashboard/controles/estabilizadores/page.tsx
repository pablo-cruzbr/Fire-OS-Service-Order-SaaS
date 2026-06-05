// app/dashboard/compras/page.tsx
import { getCookieServer } from '@/lib/cookieServer';
import { api } from '@/services/api';
import EstabilizadoresList from './EstabilizadoresList';
import { EstabilizadoresResponse } from '@/lib/getEstabilizadores.type';
export const dynamic = 'force-dynamic';
async function getEstabilizadores(): Promise<EstabilizadoresResponse> {
  try {
    const token = await getCookieServer();

    const response = await api.get('/listcontroledeestabilizadores', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data || {
      controles: [],
      total: 0,
      totalAguardandoReparo: 0,
      totalFinalizado: 0,
    };

  } catch (err) {
    console.error("Erro ao buscar estabilizadores:", err);

    return {
      controles: [],
      total: 0,
      totalAguardandoReparo: 0,
      totalFinalizado: 0,
    };
  }
}

export default async function ComprasPage() {
  const EstabilizadoresData = await getEstabilizadores();
  return <EstabilizadoresList EstabilizadoresData={EstabilizadoresData} />;
}
