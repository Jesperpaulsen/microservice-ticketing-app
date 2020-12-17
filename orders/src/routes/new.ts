import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@jgptickets/common";
import express, { Request, Response } from "express";

import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { body } from "express-validator";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [body("ticketId").not().isEmpty().withMessage("TicketId must be provided")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError();

    // @ts-ignore
    const isReserved = await ticket.isReserved();
    if (isReserved) throw new BadRequestError("Ticket is already reserved");

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = new Order({
      userId: req.currentUser!.id,
      ticket: ticket,
      status: OrderStatus.CREATED,
      expiresAt: expiration,
    });
    await order.save();
    res.status(201).send(order);
  },
);

export { router as newOrderRouter };
