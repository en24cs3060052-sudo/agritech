# AgriTech: Digital Farming Partner (MERN)

Full-stack web application that helps farmers make data-driven decisions: farm and crop management, soil health advice, weather forecasts with field advice, pest alerts, resource ordering, expert consultation and an admin dashboard.

## Features
- JWT authentication, bcrypt password hashing, role-based access (farmer, admin)
- Farm profiles and crop monitoring with automatic soil advice (pH, N, P, K)
- Weather forecast with field advice (OpenWeather, sample-data fallback)
- Pest alerts published by admin
- Resource catalogue, order placement and tracking, admin approval
- Expert questions, community forum and replies
- Admin dashboard: statistics, users, orders, alerts, catalogue
- Responsive Bootstrap UI in English and Hindi, charts with Recharts

## Tech stack
MongoDB, Express.js, React.js, Node.js, Axios, React Router, Bootstrap, JWT

## Run locally
```bash
cd backend
cp .env.example .env     # fill MONGO_URI and JWT_SECRET
npm install
npm run seed
npm start

# new terminal
cd frontend
npm install
npm start
```
Open http://localhost:3000

Demo logins (after seeding): `admin@agritech.com` and `farmer@agritech.com`, password `Farm@12345`

## Deployment
- Database: MongoDB Atlas
- Backend: Render (root `backend`, start `node server.js`)
- Frontend: Vercel (root `frontend`, env `REACT_APP_API_URL`)

## API
`/api/auth`, `/api/farms`, `/api/crops`, `/api/weather`, `/api/alerts`, `/api/resources`, `/api/orders`, `/api/posts`, `/api/admin`
