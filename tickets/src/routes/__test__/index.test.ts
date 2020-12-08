import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { createTicket } from "../../test/utils";

it("can fetch a list of tickets", async () => {
  createTicket();
  createTicket();
  createTicket();

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(3);
});
