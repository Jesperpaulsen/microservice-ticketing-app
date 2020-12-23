import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@jgptickets/common";
import { body, param } from "express-validator";
import express, { Request, Response } from "express";

import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import mongoose from "mongoose";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be valid"),
    param("id")
      .not()
      .isEmpty()
      .custom((id: string) => mongoose.Types.ObjectId.isValid(id)),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  },
);

export { router as updateTicketRouter };
