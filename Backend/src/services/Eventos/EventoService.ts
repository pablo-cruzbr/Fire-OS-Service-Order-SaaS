import { EventoRepository, eventoRepository } from "../../repositories/EventoRepository";
import { CreateEventoInput, UpdateEventoInput } from "../../schemas/evento.schema";
import { SchedulerEvent } from "./Evento.type";

function toSchedulerEvent(event: { id: number; text: string; start_date: Date; end_date: Date }): SchedulerEvent {
  return {
    id: event.id,
    text: event.text,
    start_date: event.start_date.toISOString(),
    end_date: event.end_date.toISOString(),
  };
}

class EventoService {
  constructor(private repository: EventoRepository = eventoRepository) {}

  async list(): Promise<SchedulerEvent[]> {
    const events = await this.repository.findAll();
    return events.map(toSchedulerEvent);
  }

  async create(data: CreateEventoInput): Promise<SchedulerEvent> {
    const event = await this.repository.create({
      text: data.text,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
    });
    return toSchedulerEvent(event);
  }

  async update(data: UpdateEventoInput): Promise<SchedulerEvent> {
    const event = await this.repository.update(data.id, {
      text: data.text,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
    });
    return toSchedulerEvent(event);
  }

  async delete(id: number): Promise<SchedulerEvent> {
    const event = await this.repository.delete(id);
    return toSchedulerEvent(event);
  }
}

const eventoService = new EventoService();

export { EventoService, eventoService };
