import { Document, Schema, model } from "mongoose";

interface TicketAttrs {
  userId: string;
  expiresAt: Date;
}

const ticketSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Schema.Types.Date,
      required: false,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
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

const OrderModel = model<Document & TicketAttrs>("Ticket", ticketSchema);

class Ticket extends OrderModel {
  constructor(attrs: TicketAttrs) {
    super(attrs);
  }
}

export { Ticket };
