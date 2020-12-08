import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { createTicket, getRandomId } from "../../test/utils";

it("returns a 404 if the ticket is not found", async () => {
  const id = getRandomId();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const ticket = await createTicket({});

  const response = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .send()
    .expect(200);

  expect(response.body.title).toEqual(ticket.title);
  expect(response.body.price).toEqual(ticket.price);
});
