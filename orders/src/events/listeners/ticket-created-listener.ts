import { Listener, Subjects, TicketCreatedEvent } from "@jgptickets/common";

import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TICKET_CREATED;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;
    const ticket = new Ticket({ id, title, price });

    await ticket.save();

    msg.ack();
  }
}
