import { Listener } from "../../../common/src/events/AbstractListener";
import { Message } from "node-nats-streaming";
import { Subjects } from "../../../common/src/events/Subjects";
import { TicketCreatedEvent } from "../../../common/src/events/TicketCreatedEvent";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TICKET_CREATED;
  queueGroupName = "payments-service";

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("Event data!", data);

    msg.ack();
  }
}
