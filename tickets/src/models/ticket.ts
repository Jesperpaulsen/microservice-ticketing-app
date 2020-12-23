import mongoose, { Document, Schema, model } from "mongoose";

import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ticketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface ticketModel extends ticketAttrs {
  version: number;
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

const TicketModel = model<Document & ticketModel>("Ticket", ticketSchema);

class Ticket extends TicketModel {
  constructor(attrs: ticketAttrs) {
    super(attrs);
  }
}

export { Ticket };
