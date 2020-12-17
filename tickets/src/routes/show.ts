import express, { Request, Response } from "express";

import { NotFoundError } from "@jgptickets/common";
import { Ticket } from "../models/ticket";
import mongoose from "mongoose";
import { param } from "express-validator";

const router = express.Router();

router.get(
  "/api/tickets/:id",
  param("id")
    .not()
    .isEmpty()
    .custom((id: string) => mongoose.Types.ObjectId.isValid(id)),
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.send(ticket);
  },
);

export { router as showTicketRouter };
