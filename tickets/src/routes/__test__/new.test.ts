import request from "supertest";

import { Ticket } from "../../models/ticket";
import { app } from "../../app";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can not be accessed if the user is not signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("can be accessed if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signIn())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signIn())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signIn())
    .send({
      price: 10,
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signIn())
    .send({
      title: "valid title",
      price: -10,
    })
    .expect(400);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signIn())
    .send({
      title: "valid title",
    })
    .expect(400);
});

it("creates a ticket with valid input", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const ticket = {
    title: "Valid title",
    price: 20,
  };

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signIn())
    .send({ title: ticket.title, price: ticket.price })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(ticket.title);
  expect(tickets[0].price).toEqual(ticket.price);
});
