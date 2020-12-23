import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async (done) => {
  // Create an instance of a ticket and save it
  const ticket = new Ticket({ title: "concert", price: 20, userId: "123" });
  // Fetch the ticket twice
  await ticket.save();
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the ticket we fetched.
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // Were gonna save the first fetched ticket.
  await firstInstance!.save();
  // Then save the second ticket and expect and error due to version inconsitency.
  // This doesn't work due to limitations with jest and mongoose
  /* expect(async () => {
    await secondInstance!.save();
  }).toThrow(); */
  try {
    await secondInstance!.save();
  } catch (e) {
    return done();
  }

  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  const ticket = new Ticket({ title: "concert", price: 20, userId: "123" });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
