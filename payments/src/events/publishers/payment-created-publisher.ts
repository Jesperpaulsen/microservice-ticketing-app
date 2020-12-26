import { PaymentCreatedEvent, Publisher, Subjects } from "@jgptickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PAYMENT_CREATED;
}
