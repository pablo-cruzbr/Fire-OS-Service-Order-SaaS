import { serverGet } from "@/lib/serverApi";
import { toArray } from "@/lib/toArray";
import type { DocumentacaoTecnicaProps } from "@/lib/getDocumentacaoTecnica.type";
import DocumentacaoTecnicaList from "@/features/documentacaoTecnica/DocumentacaoTecnicaList";

export const dynamic = "force-dynamic";

export default async function DocumentacaoTecnicaPage() {
  const data = await serverGet<unknown>("/listdocumentacaotecnica", []);
  return <DocumentacaoTecnicaList data={toArray<DocumentacaoTecnicaProps>(data)} />;
}
