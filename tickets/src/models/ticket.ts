import mongoose, { Schema, model, Document } from "mongoose";

interface ticketAttrs {
  title: string;
  price: number;
  userId: string;
}

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

const TicketModel = model<Document & ticketAttrs>("Ticket", ticketSchema);

class Ticket extends TicketModel {
  constructor(attrs: ticketAttrs) {
    super(attrs);
  }
}

export { Ticket };
