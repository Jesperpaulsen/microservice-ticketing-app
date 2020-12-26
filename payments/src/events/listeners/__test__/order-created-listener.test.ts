import { OrderCreatedEvent, OrderStatus } from "@jgptickets/common";

import { Order } from "../../../models/order";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: "fake_timestamp",
    userId: "fake_id",
    status: OrderStatus.CREATED,
    ticket: {
      id: "fake_id",
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(order!.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
