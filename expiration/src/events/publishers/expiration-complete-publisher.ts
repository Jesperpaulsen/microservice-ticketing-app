import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@jgptickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.EXPIRATION_COMPLETE;
}
