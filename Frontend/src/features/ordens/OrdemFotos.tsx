"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TbArrowLeft, TbPhotoPlus, TbTrash } from "react-icons/tb";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";
import { Button, EmptyState, Spinner } from "@/components/ui";
import type { Foto } from "./helpers";

/** Photos of the OS: list, upload (queued on the API) and delete with confirmation. */
export function OrdemFotos({ ordemId }: { ordemId: string }) {
  const [fotos, setFotos] = useState<Foto[] | null>(null);
  const [selected, setSelected] = useState<Foto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/foto/${ordemId}`);
      setFotos(Array.isArray(data) ? data : []);
    } catch (error) {
      setFotos([]);
      toast.error(apiErrorMessage(error, "Não foi possível carregar as fotos."));
    }
  }, [ordemId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("ordemdeServico_id", ordemId);
        // let the browser set the multipart boundary (the instance defaults to JSON)
        await api.post("/foto", formData, { headers: { "Content-Type": undefined } });
      }
      // Upload is processed by a queue worker: the POST only confirms the photo
      // was queued, so reload the list — a photo may only show up a bit later.
      toast.success("Fotos enviadas. Elas podem levar alguns segundos para aparecer.");
      await load();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Erro ao enviar as fotos."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(foto: Foto) {
    if (!window.confirm("Excluir esta foto? Essa ação não pode ser desfeita.")) return;
    setDeleting(true);
    try {
      await api.delete(`/foto/${foto.id}`);
      setFotos((previous) => (previous ?? []).filter((item) => item.id !== foto.id));
      setSelected(null);
      toast.success("Foto excluída.");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível excluir a foto."));
    } finally {
      setDeleting(false);
    }
  }

  if (selected) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelected(null)} icon={<TbArrowLeft className="h-4 w-4" />}>
            Voltar às fotos
          </Button>
          <Button
            variant="lightDanger"
            size="sm"
            loading={deleting}
            onClick={() => handleDelete(selected)}
            icon={<TbTrash className="h-4 w-4" />}
          >
            Excluir foto
          </Button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={selected.url} alt="Foto da ordem de serviço" className="max-h-[60vh] w-full rounded-lg bg-surface object-contain" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-bodytext">
          {fotos ? `${fotos.length} foto${fotos.length === 1 ? "" : "s"}` : "Carregando fotos..."}
        </p>
        <Button
          size="sm"
          variant="light"
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
          icon={<TbPhotoPlus className="h-4 w-4" />}
        >
          {uploading ? "Enviando..." : "Adicionar fotos"}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      {fotos === null ? (
        <div className="flex justify-center py-10 text-primary">
          <Spinner />
        </div>
      ) : fotos.length === 0 ? (
        <EmptyState title="Nenhuma foto adicionada" description="As fotos enviadas pelo técnico aparecem aqui." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((foto) => (
            <button
              key={foto.id}
              type="button"
              onClick={() => setSelected(foto)}
              className="group overflow-hidden rounded-lg bg-surface focus-visible:outline-2 focus-visible:outline-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt="Foto da ordem de serviço"
                className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
