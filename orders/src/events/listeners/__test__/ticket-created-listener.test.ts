import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketCreatedEvent } from "@jgptickets/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";

const setup = () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // Create a fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: "concert",
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure the ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure the ack functions was called
  expect(msg.ack).toHaveBeenCalled();
});
