import { Document, Schema, model } from "mongoose";

import { OrderStatus } from "@jgptickets/common";

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.CREATED,
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

const OrderModel = model<Document & OrderAttrs>("Order", orderSchema);

class Order extends OrderModel {
  constructor(attrs: OrderAttrs) {
    super(attrs);
  }
}

export { Order };
