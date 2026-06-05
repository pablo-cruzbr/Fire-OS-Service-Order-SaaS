// app/dashboard/compras/page.tsx
import { getCookieServer } from '@/lib/cookieServer';
import { api } from '@/services/api';
import EquipamentoList from './EquipamentoList';
import { EquipamentoProps } from '@/lib/getEquipamento.type';
export const dynamic = 'force-dynamic';
async function getEquipamento(): Promise<EquipamentoProps[]> {
  try {
    const token = await getCookieServer();
    const response = await api.get('/listequipamento', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data || [];
    
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function ComprasPage() {
  const Equipamento = await getEquipamento();
  return <EquipamentoList Equipamento={Equipamento} />;
}
