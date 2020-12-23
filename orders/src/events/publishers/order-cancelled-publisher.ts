import { OrderCancelledEvent, Publisher, Subjects } from "@jgptickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED;
}
