import { Message } from "node-nats-streaming";
import { OrderCancelledEvent } from "@jgptickets/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const ticket = new Ticket({
    title: "concert",
    price: 20,
    userId: "fake_id",
  });
  ticket.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: ticket.orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("updates the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
