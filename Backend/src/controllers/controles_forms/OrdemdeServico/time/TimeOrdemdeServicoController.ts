import { Request, Response } from "express";
import { TimeOrdemdeServicoService } from "../../../../services/controles_forms/OrdemdeServico/time/TimeOrdemdeServicoService";
import { AtualizarTempoInput } from "../../../../schemas/ordemdeServico.schema";

export class TimeOrdemdeServicoController {
  iniciar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const ordem = await TimeOrdemdeServicoService.iniciarOrdem(id);
    return res.json(ordem);
  }

  concluir = async (req: Request, res: Response) => {
    const { id } = req.params;
    const ordem = await TimeOrdemdeServicoService.concluirOrdem(id);
    return res.json(ordem);
  }

  pausar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const ordem = await TimeOrdemdeServicoService.pausarOrdem(id);
    return res.json(ordem);
  }

  retomar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const ordem = await TimeOrdemdeServicoService.retomarOrdem(id);
    return res.json(ordem);
  }

  atualizarTempo = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startedAt, endedAt } = req.body as AtualizarTempoInput;

    const ordem = await TimeOrdemdeServicoService.atualizarTempo({
      ordemId: id,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      endedAt: endedAt ? new Date(endedAt) : undefined,
    });

    return res.json(ordem);
  }

  lerTempo = async (req: Request, res: Response) => {
    const { id } = req.params;
    const tempo = await TimeOrdemdeServicoService.lerTempo(id);

    return res.json({
      startedAt: tempo?.startedAt || null,
      endedAt: tempo?.endedAt || null,
      duracao: tempo?.duracao || 0,
    });
  }
}
