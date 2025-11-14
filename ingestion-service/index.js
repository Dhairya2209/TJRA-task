const express = require("express");
const Redis = require("ioredis");

const app = express();
app.use(express.json());

const redis = new Redis(); // connects to localhost:6379

app.post("/event", async (req, res) => {
  const { site_id, event_type, path, user_id, timestamp } = req.body;

  if (!site_id || !event_type) {
    return res.status(400).json({ error: "site_id and event_type required" });
  }

  // Push event to queue (FAST)
  await redis.lpush("analytics_events", JSON.stringify(req.body));

  // Immediately return success
  res.json({ status: "received" });
});

app.listen(3001, () => console.log("Ingestion API running on 3001"));
