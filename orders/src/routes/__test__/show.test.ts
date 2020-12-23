import { Ticket } from "../../models/ticket";
import { Types } from "mongoose";
import { app } from "../../app";
import request from "supertest";

it("fetches the order", async () => {
  const ticket = new Ticket({
    id: Types.ObjectId().toHexString(),
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  const user = global.signIn();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns 401 if a user tries to fetch another users ticket", async () => {
  const ticket = new Ticket({
    id: Types.ObjectId().toHexString(),
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signIn("userOne"))
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signIn("userTwo"))
    .send()
    .expect(401);
});
