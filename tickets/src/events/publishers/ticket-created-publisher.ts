import { Publisher, Subjects, TicketCreatedEvent } from "@jgptickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TICKET_CREATED;
}
