import { Publisher, Subjects, TicketUpdatedEvent } from "@jgptickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TICKET_UPDATED;
}
