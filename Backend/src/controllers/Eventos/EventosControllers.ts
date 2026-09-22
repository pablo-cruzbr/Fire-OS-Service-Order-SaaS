import { Request, Response } from "express";
import { EventoService, eventoService } from "../../services/Eventos/EventoService";
import { CreateEventoInput, UpdateEventoInput } from "../../schemas/evento.schema";

class EventosController {
  constructor(private service: EventoService = eventoService) {}

  list = async (req: Request, res: Response) => {
    const events = await this.service.list();
    return res.json(events);
  }

  create = async (req: Request, res: Response) => {
    const event = await this.service.create(req.body as CreateEventoInput);
    return res.json(event);
  }

  update = async (req: Request, res: Response) => {
    const event = await this.service.update(req.body as UpdateEventoInput);
    return res.json(event);
  }

  delete = async (req: Request, res: Response) => {
    // validate(eventoIdParamSchema, 'params') já coerciona req.params.id pra number.
    const { id } = req.params as unknown as { id: number };
    const event = await this.service.delete(id);
    return res.json(event);
  }
}

export { EventosController };
