import mongoose from "mongoose";

import { Ticket } from "../models/ticket";

interface Params {
  userId?: string;
  title?: string;
  price?: number;
}

export const createTicket = async ({ userId, title, price }: Params) => {
  const ticket = new Ticket({
    userId: userId || "user_id",
    title: title || "ticket_title",
    price: price || 10.0,
  });
  await ticket.save();
  return ticket;
};

export const getRandomId = () => new mongoose.Types.ObjectId().toHexString();
