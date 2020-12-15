import nats from 'node-nats-streaming';
console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
});

stan.on('connect', () => {
  console.log('publisher connected to nats');

  const data = {
    id: '123',
    title: 'concert',
    price: 20
  };
  const dataAsJson = JSON.stringify(data);
  stan.publish('ticket:created', dataAsJson, () => {
    console.log('event published');
  });
});
