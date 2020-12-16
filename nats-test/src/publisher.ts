import { TicketCreatedPublisher } from './events/TicketCreatedPublisher';
import nats from 'node-nats-streaming';
console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
});

stan.on('connect', async () => {
  console.log('publisher connected to nats');

  const publisher = new TicketCreatedPublisher(stan);
  await publisher.publish({
    id: '123',
    price: 20,
    title: 'toto'
  });

  // const data = {
  //   id: '123',
  //   title: 'concert',
  //   price: 20
  // };
  // const dataAsJson = JSON.stringify(data);
  // stan.publish('ticket:created', dataAsJson, () => {
  //   console.log('event published');
  // });
});
