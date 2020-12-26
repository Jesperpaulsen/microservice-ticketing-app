import { Order } from "../../models/order";
import { OrderStatus } from "@jgptickets/common";
import { Payment } from "../../models/payment";
import { app } from "../../app";
import mongoose from "mongoose";
import request from "supertest";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("returns a 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signIn())
    .send({
      token: "sdasjhsa",
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns a 401 when purchasing an order that does not belong to the user", async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.AWAITING_PAYMENT,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signIn())
    .send({
      token: "kldjfkls",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const user = global.signIn(userId);
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.CANCELLED,
    userId,
    version: 0,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", user)
    .send({
      token: "kldjfkls",
      orderId: order.id,
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const user = global.signIn(userId);
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.CREATED,
    userId,
    version: 0,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", user)
    .send({ token: "tok_visa", orderId: order.id })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(20 * 100);
  expect(chargeOptions.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
  });

  expect(payment!.stripeId).toBeDefined();
});
