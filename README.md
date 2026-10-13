# SeatSync API

A REST API for managing events for ticket booking, built with Node.js and Express.

Events are stored in memory (seeded from [src/data/events.js](src/data/events.js)), so any changes are lost when the server restarts.

## Getting started

Requires Node.js 18 or later.

```bash
npm install
npm run dev     # start with nodemon (auto-restart on changes)
npm start       # start with node
```

The server listens on port `3000` by default. Set the `PORT` environment variable to change it.

## Scripts

| Script                 | Description                      |
| ---------------------- | -------------------------------- |
| `npm start`            | Run the server                   |
| `npm run dev`          | Run the server with nodemon      |
| `npm run format`       | Format all files with Prettier   |
| `npm run format:check` | Check formatting without writing |

## Endpoints

| Method | Path          | Description        | Success response |
| ------ | ------------- | ------------------ | ---------------- |
| GET    | `/`           | Health check       | `200`            |
| GET    | `/events`     | List events        | `200`            |
| GET    | `/events/:id` | Get a single event | `200`            |
| POST   | `/events`     | Create an event    | `201`            |
| PUT    | `/events/:id` | Replace an event   | `200`            |
| DELETE | `/events/:id` | Delete an event    | `204`            |

### Query parameters for `GET /events`

| Parameter | Example             | Description                                    |
| --------- | ------------------- | ---------------------------------------------- |
| `venue`   | `?venue=City Arena` | Filter by venue (case-insensitive exact match) |
| `sort`    | `?sort=price`       | Sort by price, lowest first                    |

### Event object

```json
{
  "id": 1,
  "name": "Rock Concert",
  "venue": "City Arena",
  "date": "2026-12-20",
  "totalSeats": 50,
  "price": 999
}
```

`id` is assigned by the server. `POST` and `PUT` require all other fields in the request body:

| Field        | Rule                          |
| ------------ | ----------------------------- |
| `name`       | Non-empty string              |
| `venue`      | Non-empty string              |
| `date`       | Any value parseable as a date |
| `totalSeats` | Positive integer              |
| `price`      | Number, 0 or greater          |

### Examples

```bash
# Create
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Comedy Night","venue":"City Arena","date":"2026-12-28","totalSeats":60,"price":299}'

# Update
curl -X PUT http://localhost:3000/events/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Rock Concert","venue":"City Arena","date":"2026-12-20","totalSeats":80,"price":1099}'

# Delete
curl -X DELETE http://localhost:3000/events/1
```

### Errors

Errors return JSON with a `message` field:

| Status | When                                                |
| ------ | --------------------------------------------------- |
| `400`  | Request body fails validation                       |
| `404`  | Event or route not found                            |
| `500`  | Unexpected server error (details logged to console) |

```json
{ "message": "totalSeats must be a positive whole number" }
```

## Postman

A Postman collection is in [docs/seatsync.postman_collection.json](docs/seatsync.postman_collection.json). After importing it, set the `baseUrl` collection variable to `http://localhost:3000`.

## Project structure

```
src/
├── index.js                     # App setup and server start
├── routes/events.routes.js      # Route definitions
├── controllers/events.controller.js
├── validators/events.validator.js
├── middleware/
│   ├── logger.js                # Logs method, URL, status and duration
│   └── errorHandler.js          # Central error handler
└── data/events.js               # In-memory seed data
```
