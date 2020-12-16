import { createTicket, getRandomId } from "../../test/utils";

import { Ticket } from "../../models/ticket";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import request from "supertest";

it("returns a 404 if the provided id does not exist", async () => {
  const id = getRandomId();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signIn())
    .send({
      title: "Random title",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = getRandomId();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Random title",
      price: 20,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const ticket = await createTicket({});

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signIn())
    .send({ title: "new title", price: 40 })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const userId = "test_id";
  const ticket = await createTicket({ userId });
  const cookie = global.signIn(userId);
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 40 })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "test", price: -40 })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "test" })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const userId = "test_id";
  const ticket = await createTicket({ userId });
  const cookie = global.signIn(userId);
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "new title", price: 140 })
    .expect(200);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket?.title).toEqual("new title");
  expect(updatedTicket?.price).toEqual(140);
});

it("publishes an event", async () => {
  const userId = "test_id";
  const ticket = await createTicket({ userId });
  const cookie = global.signIn(userId);
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "new title", price: 140 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
