import { Order, OrderStatus } from "../../models/order";

import { Ticket } from "../../models/ticket";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import request from "supertest";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signIn())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const order = new Order({
    ticket,
    userId: "ljldkjdklsjfd",
    status: OrderStatus.CREATED,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signIn())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signIn())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an order created event", async () => {
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signIn())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
