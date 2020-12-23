import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedEvent } from "@jgptickets/common";
import { TicketUpdatedListener } from "../../listeners/ticket-updated-listener";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create and save a ticket
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();
  // create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    price: 999,
    // @ts-ignore
    version: ticket.version + 1,
    title: "new concert",
    userId: "fake_id",
  };

  // @ts-ignore create a fake msg object
  const msg: Message = {
    ack: jest.fn(),
  };
  // return all of this stuff
  return { listener, ticket, data, msg };
};

it("finds, updates, and saves a ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  // @ts-ignore
  expect(updatedTicket.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { listener, ticket, data, msg } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (e) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
