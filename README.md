# TravelAI

TravelAI is a full-stack travel planner. It combines a React and Vite frontend with an Express API, MongoDB storage, Google Places data, and Gemini AI itinerary generation.

## Features

- Register and sign in with email/password or Google.
- Create, view, edit, duplicate, and share trips.
- Generate trip itineraries with Gemini AI.
- Find hotels, restaurants, and places using Google Places.
- View trip locations on an interactive map.
- Track trip expenses and ask the AI tools for budget suggestions or travel advice.

## Requirements

- Node.js 22.12 or newer and npm.
- A MongoDB instance, local or hosted, for persistent users and trips.
- API credentials for the external services you want to use. See [Environment setup](#environment-setup).

## Run locally on Windows

Open two PowerShell terminals in the repository.

### 1. Configure the backend

Create `backend\.env` with your local settings:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/travelai
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=30d
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_google_places_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

`MONGODB_URI` can point to a local MongoDB server or a hosted MongoDB deployment. Make sure that database is running and reachable before using features that save or load trips.

### 2. Configure the frontend

Create `frontend\.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Use the same Google OAuth client ID in both environment files. In its Google Cloud OAuth client settings, add `http://localhost:5173` as an authorized JavaScript origin.

### 3. Install dependencies

In the backend terminal:

```powershell
cd "D:\AI Project\backend"
npm install
```

In the frontend terminal:

```powershell
cd "D:\AI Project\frontend"
npm install
```

### 4. Start the app

In the backend terminal:

```powershell
npm run dev
```

In the frontend terminal:

```powershell
npm run dev
```

Open the Vite URL shown in the frontend terminal, usually <http://localhost:5173>. The backend health endpoint is <http://localhost:5000/api/health>.

## Environment setup

| Variable | Used by | Purpose |
| --- | --- | --- |
| `PORT` | Backend | API port; defaults to `5000`. |
| `NODE_ENV` | Backend | Runtime mode; use `development` locally. |
| `MONGODB_URI` | Backend | MongoDB connection string; defaults to a local `travelai` database. |
| `JWT_SECRET` | Backend | Secret used to sign authentication tokens. Set a unique, long random value. |
| `JWT_EXPIRES_IN` | Backend | Token lifetime; defaults to `30d`. |
| `GEMINI_API_KEY` | Backend | Enables Gemini-powered itinerary and AI features. |
| `GOOGLE_MAPS_API_KEY` | Backend | Enables Google Places lookups. Restrict the key to the required APIs. |
| `GOOGLE_CLIENT_ID` | Backend | Audience used to verify Google sign-in ID tokens. |
| `VITE_API_BASE_URL` | Frontend | Backend API URL; defaults to `http://localhost:5000/api`. |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Client ID used to display Google sign-in. |

AI, Places, and Google sign-in features require their corresponding credentials. Keep backend secrets in `backend\.env`; variables prefixed with `VITE_` are included in the browser app and must not contain private secrets.

## Useful commands

Run these from the relevant directory:

| Directory | Command | Description |
| --- | --- | --- |
| `backend` | `npm run dev` | Start the API with automatic restart. |
| `backend` | `npm start` | Start the API normally. |
| `frontend` | `npm run dev` | Start the Vite development server. |
| `frontend` | `npm run build` | Build the frontend for production. |
| `frontend` | `npm run lint` | Run Oxlint. |
| `frontend` | `npm run preview` | Preview a production frontend build. |

## Project structure

```text
frontend/   React, Vite, pages, components, and API client
backend/    Express API, authentication, database models, and integrations
```

The backend exposes routes under `/api/auth`, `/api/trips`, `/api/places`, and `/api/ai`.

## Security

- Never commit `.env` files or paste API keys into source code.
- Rotate credentials immediately if they are exposed. A Git history rewrite does not revoke a key.
- Restrict Google API keys to the APIs and environments that need them.
- Use a unique, strong `JWT_SECRET`, especially outside local development.
