import mongoose, { Document, Schema, model } from "mongoose";

import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ticketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface ticketModel {
  version: number;
  orderId: string;
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
    orderId: {
      type: String,
      required: false,
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

const TicketModel = model<Document & ticketAttrs & ticketModel>(
  "Ticket",
  ticketSchema,
);

class Ticket extends TicketModel {
  constructor(attrs: ticketAttrs) {
    super(attrs);
  }
}

export { Ticket };
