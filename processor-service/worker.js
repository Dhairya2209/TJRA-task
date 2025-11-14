const Redis = require("ioredis");
const { MongoClient } = require("mongodb");

const redis = new Redis();
const client = new MongoClient("mongodb://localhost:27017");

let events;

async function start() {
  await client.connect();
  events = client.db("analytics").collection("events");

  console.log("Processor Worker Started...");

  while (true) {
    const result = await redis.brpop("analytics_events", 0); 
    const event = JSON.parse(result[1]);

    // Insert event into DB
    await events.insertOne(event);

    console.log("Processed event:", event.path);
  }
}

start();
