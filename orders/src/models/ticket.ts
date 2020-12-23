import { Document, Schema, model } from "mongoose";
import { Order, OrderStatus } from "./order";

import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

interface ticketModel extends TicketAttrs {
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<(Document & ticketModel) | null>;
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
      min: 0,
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

ticketSchema.statics.findByEvent = function (event: {
  id: string;
  version: number;
}) {
  return Ticket.findOne({ _id: event.id, version: event.version - 1 });
};

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.CREATED,
        OrderStatus.AWAITING_PAYMENT,
        OrderStatus.COMPLETE,
      ],
    },
  });
  return !!existingOrder;
};

const TicketModel = model<Document & ticketModel>("Ticket", ticketSchema);

class Ticket extends TicketModel {
  constructor(attrs: TicketAttrs) {
    if (attrs) super({ _id: attrs.id, title: attrs.title, price: attrs.price });
    else super();
  }
}

export { Ticket };
