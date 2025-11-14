

---

# 📘 **Website Analytics Backend System**

## 📌 **1. Overview**

This project implements a high-performance backend system for capturing and reporting website analytics data.

It is built as **three separate services**:

1. **Ingestion API** — receives events very quickly and pushes them into a queue.
2. **Processor Worker** — reads events from the queue and stores them in the database.
3. **Reporting API** — aggregates events for analytics insights.

This architecture ensures **fast ingestion**, **scalability**, and **reliable asynchronous processing**.

---

# ⭐ **2. Architecture Decision**

### 🎯 **Why Asynchronous Processing?**

The ingestion endpoint must be **extremely fast** and **must not wait for database writes**. Database inserts are slow under high load.

To solve this:

* Incoming events are **validated**.
* Events are **pushed to a Redis queue** immediately (usually < 1 ms).
* The API returns success instantly.
* A separate **processor worker** pulls events from the queue and writes to the database.

### ✔ Chosen Queue System: **Redis Lists**

We use Redis because:

* It is **in-memory** → extremely fast.
* Supports **LPUSH** and **BRPOP** for producer–consumer queues.
* Very simple to set up and reliable for event pipelines.
* Perfect for high-throughput ingestion workloads.

### ⚙ Event Flow Diagram

```
Client → Ingestion API → Redis Queue → Processor Worker → MongoDB → Reporting API
```

This guarantees:

* Fast API response
* Durable event processing
* Scalable reporting

---

# ⭐ **3. Database Schema**

Database: **MongoDB**
Collection: **events**

### 📄 **Fields**

| Field        | Type    | Description                       |
| ------------ | ------- | --------------------------------- |
| `site_id`    | String  | ID of the website being tracked   |
| `event_type` | String  | Type of event (e.g., `page_view`) |
| `path`       | String  | The URL path visited              |
| `user_id`    | String  | Unique user identifier            |
| `timestamp`  | ISODate | Time of the event                 |

### 📝 Sample Document

```json
{
  "site_id": "site-abc-123",
  "event_type": "page_view",
  "path": "/pricing",
  "user_id": "user-xyz-789",
  "timestamp": ISODate("2025-11-12T19:30:01Z")
}
```

### 📊 Simple Schema Diagram

```
+------------------------------+
|          events              |
+------------------------------+
| site_id      (string)        |
| event_type   (string)        |
| path         (string)        |
| user_id      (string)        |
| timestamp    (ISODate)       |
+------------------------------+
```

---

# ⭐ **4. Setup Instructions (Step-by-Step)**

Follow these steps to run the complete system.

---

## ✅ **Prerequisites Installed**

You must install:

* **Node.js**
* **Redis**
* **MongoDB**

Redis & MongoDB can be local installations or Docker containers.

---


 
---

## 1️⃣ **Install dependencies for each service**

### Ingestion API

```
cd ingestion-service
npm install
```

### Processor Worker

```
cd ../processor-service
npm install
```

### Reporting API

```
cd ../reporting-service
npm install
```

---

##  2️⃣**Start Redis**

Docker:

```
docker run -d --name redis -p 6379:6379 redis
```

OR local Redis service:

```
redis-server
```

---


##  3️⃣**Start MongoDB**

Docker:

```
docker run -d --name mongodb -p 27017:27017 mongo
```

OR local MongoDB service:

```
mongod
```

---


## 4️⃣**Start Each Service**

### Start Processor (must run FIRST)

```
cd processor-service
node worker.js
```

### Start Ingestion API

```
cd ingestion-service
node index.js
```

### Start Reporting API

```
cd reporting-service
node index.js
```

---

# ⭐ **5. API Usage**

Below are example commands for testing both APIs.

---

## 📤 **POST /event** — Ingestion API

```
curl -X POST http://localhost:3001/event \
-H "Content-Type: application/json" \
-d '{
  "site_id": "site-abc-123",
  "event_type": "page_view",
  "path": "/pricing",
  "user_id": "user-xyz-789",
  "timestamp": "2025-11-12T19:30:01Z"
}'
```

### ✔ Example Response

```json
{ "status": "received" }
```

---

## 📥 **GET /stats** — Reporting API

```
curl "http://localhost:3002/stats?site_id=site-abc-123&date=2025-11-12"
```

### ✔ Example Response

```json
{
  "site_id": "site-abc-123",
  "date": "2025-11-12",
  "total_views": 1450,
  "unique_users": 212,
  "top_paths": [
    { "path": "/pricing", "views": 700 },
    { "path": "/blog/post-1", "views": 500 },
    { "path": "/", "views": 250 }
  ]
}
```

---

# ⭐ **6. Project Structure**

```
analytics-system/
│
├── ingestion-service/
│     └── index.js
│
├── processor-service/
│     └── worker.js
│
├── reporting-service/
│     └── index.js
│
└── README.md
```

---

