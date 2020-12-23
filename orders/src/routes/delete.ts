import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@jgptickets/common";
import { Order, OrderStatus } from "../models/order";
import express, { Request, Response } from "express";

import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import mongoose from "mongoose";
import { natsWrapper } from "../nats-wrapper";
import { param } from "express-validator";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  param("orderId")
    .not()
    .isEmpty()
    .custom((orderId: string) => mongoose.Types.ObjectId.isValid(orderId)),
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("ticket");

    if (!order) throw new NotFoundError();
    if (order.userId !== req.currentUser?.id) throw new NotAuthorizedError();

    order.status = OrderStatus.CANCELLED;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  },
);

export { router as deleteOrderRouter };
