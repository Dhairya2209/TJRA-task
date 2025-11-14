const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");

let events;

app.get("/stats", async (req, res) => {
  const { site_id, date } = req.query;

  if (!site_id) {
    return res.status(400).json({ error: "site_id required" });
  }

  const match = { site_id };

  if (date) {
    match.timestamp = {
      $gte: new Date(date + "T00:00:00Z"),
      $lte: new Date(date + "T23:59:59Z"),
    };
  }

  const result = await events.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$path",
        views: { $sum: 1 },
        users: { $addToSet: "$user_id" }
      }
    }
  ]).toArray();

  const response = {
    site_id,
    date: date || "ALL",
    total_views: result.reduce((a, b) => a + b.views, 0),
    unique_users: new Set(result.flatMap(r => r.users)).size,
    top_paths: result
      .map(r => ({ path: r._id, views: r.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  };

  res.json(response);
});

app.listen(3002, async () => {
  await client.connect();
  events = client.db("analytics").collection("events");
  console.log("Reporting API running on 3002");
});
