import nats, { Message } from 'node-nats-streaming';

import { randomBytes } from 'crypto'

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
});

stan.on('connect', () => {
  console.log('listener connected to nats');

  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  })

  // SetDeliverAll makes sure the NATS deliever all events after a restart. A durable name is used by NATS to log what events the service har processed.
  const options = stan.subscriptionOptions().setManualAckMode(true).setDeliverAllAvailable().setDurableName('accounting-service');

  // queue groups are useful in combination with multiple instances and setDurableName to ensure we dont send events multiple times.
  const subscription = stan.subscribe('ticket:created', 'queue-group-name',options);

  subscription.on('message', (msg: Message) => {
    const data = msg.getData();

    if (typeof data === 'string') {
      console.log(`recieved event number: ${msg.getSequence()}, with data: ${data}`)
    }
    msg.ack();
  });
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
