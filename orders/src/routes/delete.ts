import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@jgptickets/common";
import { Order, OrderStatus } from "../models/order";
import express, { Request, Response } from "express";

import mongoose from "mongoose";
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

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();
    if (order.userId !== req.currentUser?.id) throw new NotAuthorizedError();

    order.status = OrderStatus.CANCELLED;
    await order.save();

    res.status(204).send(order);
  },
);

export { router as deleteOrderRouter };
