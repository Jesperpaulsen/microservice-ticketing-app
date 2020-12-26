import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@jgptickets/common";

import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PAYMENT_CREATED;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) throw new Error("Order not found!");

    order.set({ status: OrderStatus.COMPLETE });
    await order.save();

    // Order updated event should ideally be emitted. But at this state, no other service needs to listen to an updated order.

    msg.ack();
  }
}
