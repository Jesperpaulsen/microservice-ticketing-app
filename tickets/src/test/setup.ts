import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { signIn } from "@jgptickets/common";

declare global {
  namespace NodeJS {
    interface Global {
      signIn(id?: string): string[];
    }
  }
}

let mongo: MongoMemoryServer;

jest.mock("../nats-wrapper");

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";

  const mongo = new MongoMemoryServer();
  const mongo_uri = await mongo.getUri();

  await mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) await mongo.stop();
  await mongoose.connection.close();
});

global.signIn = signIn;
