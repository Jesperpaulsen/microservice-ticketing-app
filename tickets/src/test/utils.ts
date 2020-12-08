import { Ticket } from "../models/ticket";

export const createTicket = async (
  title?: string,
  userId?: string,
  price?: number,
) => {
  const ticket = new Ticket({
    userId: userId || "user_id",
    title: title || "ticket_title",
    price: price || 10.0,
  });
  await ticket.save();
  return ticket;
};
