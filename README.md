# Kudwa P&L Integration App

A full-stack application that integrates diverse financial data sources (JSON1 – QuickBooks style, JSON2 – RootFi style) into a unified profit-and-loss (P&L) schema.  
Built with **Node.js/Express, MongoDB, React (Vite), Docker, and Jest**.

---

## 🚀 Features

- **ETL Pipeline**: Extract, transform, and load two heterogeneous JSON sources into a unified schema.
- **API**: Endpoints to ingest data, query P&L periods, tree, and summaries.
- **Frontend**: Expandable P&L table with integration controls (trigger JSON1/JSON2 ingestion).
- **Docs**: Swagger UI available at `/api/docs`.
- **Dockerized**: Run API, frontend, and MongoDB with `docker compose up`.
- **Tests**: Unit + integration tests using Jest + Supertest.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Jest, Supertest
- **Frontend**: React (Vite), Material UI
- **Infra**: Docker, docker-compose
- **Docs**: Swagger / OpenAPI

---

## 📂 Project Structure
```text
kudwa-pnl/
├── api/                  # Express API (ETL + endpoints)
│   ├── src/
│   │   ├── modules/pnl/  # P&L logic
│   │   ├── utils/        # transformers for JSON1 & JSON2
│   │   ├── docs/         # swagger.yaml
│   │   └── ...
│   ├── tests/            # Jest tests (unit + e2e)
│   └── Dockerfile
├── web/                  # React frontend
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Running Locally

### Option 1 – Node (without Docker)

#### Backend
```bash
cd api
cp .env.example .env
npm install
npm run dev
```
Then visit:

### http://localhost:4000/api/health

→ should return:
```
{"status":"ok"}
```

http://localhost:4000/api/docs

→ Swagger UI (API documentation)

<img width="1856" height="841" alt="image" src="https://github.com/user-attachments/assets/6d61c971-5f0f-4a7f-8819-ff941872df99" />

Frontend (Web)

Set up environment and start the frontend:

```
cd web
npm install
npm run dev
```
Then visit:

http://localhost:5173

→ Frontend UI

<img width="1753" height="850" alt="image" src="https://github.com/user-attachments/assets/86249c5c-53e7-47e2-89b2-9a8929876ba3" />


## Option 2 – Docker
```
docker compose up --build
```
- **API** → http://localhost:4000

- **Swagger** → http://localhost:4000/api/docs

- **Web** → http://localhost:5173

## 📡 API Endpoints
Health
``` 
curl http://localhost:4000/api/health
```

## Ingest JSON1
```
curl -X POST http://localhost:4000/api/v1/integrations/json1 \
  -H "Content-Type: application/json" \
  --data-binary "@api/data/1.json"
```

## Ingest JSON2
```
curl -X POST http://localhost:4000/api/v1/integrations/json2 \
  -H "Content-Type: application/json" \
  --data-binary "@api/data/2.json"
```
## P&L Periods
```
curl http://localhost:4000/api/v1/pnl/periods
```

## 
