import { getCookieServer } from '@/lib/cookieServer';
import { api } from '@/services/api';
import ClientesList from './ClientesList';
import { ClientesProps, ClienteResponse } from '@/lib/getCliente.type';
export const dynamic = 'force-dynamic';
async function getClientes(): Promise<ClienteResponse> {
  try {
    const token = await getCookieServer();
    const response = await api.get('/listcliente', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data || {
      controles: [], 
      total: 0, 
    };
    
  } catch (err) {
    console.error(err);
    return { 
      controles: [], 
      total: 0 };
  };
}

export default async function ClientesPage() {
  const clienteData = await getClientes();
  return <ClientesList clienteData={clienteData} />;
}
