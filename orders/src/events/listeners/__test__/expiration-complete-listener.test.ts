import { Order, OrderStatus } from "../../../models/order";
import mongoose, { PromiseProvider } from "mongoose";

import { ExpirationCompleteEvent } from "@jgptickets/common";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 20,
    title: "concert",
  });
  await ticket.save();

  const order = new Order({
    userId: "fake_id",
    status: OrderStatus.CREATED,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});
it("emit an OrderCancelled event", async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );
  expect(eventData.id).toEqual(order.id);
});
it("ack the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
