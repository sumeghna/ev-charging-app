# ⚡ EV India - EV Charging Station Locator & Booking System

A modern, full-stack web application that helps electric vehicle owners find nearby charging stations, check real-time availability, and book charging slots across India.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=flat)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## 📱 Features

| Feature | Description |
|---------|-------------|
| **Find Stations** | Search EV charging stations by city or use your location |
| **Live Map** | Interactive map with real-time station markers |
| **Book Slots** | Check availability and book charging slots instantly |
| **Dark/Light Mode** | Toggle between themes for comfortable browsing |
| **User Authentication** | Secure login/registration with JWT |
| **Responsive** | Works seamlessly on all devices |

---

## ✨ Features Breakdown

### For Users (Drivers)
- 🔍 **Find Charging Stations** - Search by city or use GPS location
- 🗺️ **Interactive Map** - Visualize stations with custom markers
- 📅 **Real-time Availability** - Check live slot availability
- 📱 **Book Slots** - Reserve your charging time in seconds
- 🧭 **Get Directions** - Open Google Maps for navigation
- ⭐ **View Ratings** - See station ratings and reviews
- 📋 **Manage Bookings** - View, reschedule, or cancel bookings
- 🌓 **Dark/Light Mode** - Choose your preferred theme

### For Station Owners
- ➕ **Add Stations** - Register new charging stations
- ✏️ **Manage Stations** - Update pricing, hours, amenities
- 📊 **View Bookings** - See all bookings for your stations

### For Admins
- 👥 **User Management** - View and manage all users
- 📈 **Dashboard** - Track total users, stations, bookings
- 🎯 **Role Management** - Assign roles to users

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB Atlas** | Cloud database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React** | UI library |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling framework |
| **React Router** | Navigation |
| **React Leaflet** | Interactive maps |
| **Axios** | HTTP client |

### Database
| Collection | Purpose |
|------------|---------|
| **Users** | User authentication & roles |
| **Stations** | Charging station data with geospatial indexing |
| **Bookings** | User bookings with conflict prevention |

---

## 📁 Project Structure
ev-charging-app/
├── backend/
│ ├── config/
│ │ └── db.js # MongoDB connection
│ ├── models/
│ │ ├── User.js # User schema
│ │ ├── Station.js # Station schema
│ │ └── Booking.js # Booking schema
│ ├── controllers/
│ │ ├── authController.js # Auth handlers
│ │ ├── stationController.js # Station CRUD
│ │ ├── bookingController.js # Booking & availability
│ │ └── adminController.js # Admin functions
│ ├── routes/
│ │ ├── authRoutes.js # Auth endpoints
│ │ ├── stationRoutes.js # Station endpoints
│ │ ├── bookingRoutes.js # Booking endpoints
│ │ └── adminRoutes.js # Admin endpoints
│ ├── middleware/
│ │ ├── auth.js # JWT verification
│ │ └── errorHandler.js # Error handling
│ ├── utils/
│ │ ├── seedIndia.js # Indian stations seed
│ │ ├── seedInit.js # Database initialization
│ │ └── seed.js # General seed data
│ ├── .env.example # Environment variables template
│ ├── package.json
│ └── server.js # Entry point
│
└── frontend/
├── src/
│ ├── api/
│ │ └── axios.js # API client with auth
│ ├── context/
│ │ ├── AuthContext.jsx # Authentication state
│ │ └── ThemeContext.jsx # Dark/light theme state
│ ├── components/
│ │ ├── Navbar.jsx # Navigation with theme toggle
│ │ ├── StationCard.jsx # Station display card
│ │ ├── PlugIcon.jsx # Connector type icons
│ │ └── ProtectedRoute.jsx # Auth guard for routes
│ ├── pages/
│ │ ├── Stations.jsx # Main page with map
│ │ ├── StationDetail.jsx # Station details & booking
│ │ ├── Login.jsx # Login page
│ │ ├── Register.jsx # Registration page
│ │ └── MyBookings.jsx # User bookings
│ ├── App.jsx # Main app with routes
│ ├── main.jsx # Entry point
│ └── index.css # Global styles
├── .env.example # Environment variables template
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB Atlas** account (free tier works)
- **Git** (for cloning)

### 1. Clone the Repository

```bash
git clone https://github.com/sumeghna/ev-charging-app.git
cd ev-charging-app

2. Backend Setup
bash
cd backend
npm install
cp .env.example .env
Update backend/.env with your MongoDB URI:

env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/evcharging
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development

3. Initialize & Seed Database
bash
npm run init          # Create indexes and admin user
npm run seed:india    # Seed Indian charging stations
4. Start Backend Server
bash
npm run dev
Backend runs on http://localhost:5000

5. Frontend Setup
bash
cd ../frontend
npm install
cp .env.example .env
Update frontend/.env:

env
VITE_API_URL=http://localhost:5000
6. Start Frontend Server
bash
npm run dev
Frontend runs on http://localhost:5173

7. Open the Application
Visit http://localhost:5173 in your browser

🔑 Default Credentials
Role	Email	Password
Admin	admin@evcharge.com	Admin@123
Test User	test@example.com	password123
Station Owner	owner@india.com	Owner@123
📡 API Endpoints
Authentication
Method	Endpoint	Description	Auth
POST	/api/auth/register	Register a new user	Public
POST	/api/auth/login	Login user	Public
GET	/api/auth/me	Get current user	Private
Stations
Method	Endpoint	Description	Auth
GET	/api/stations	Get all stations	Public
GET	/api/stations/city/:city	Get stations by city	Public
GET	/api/stations/:id	Get station details	Public
POST	/api/stations	Create station	Owner/Admin
PUT	/api/stations/:id	Update station	Owner/Admin
DELETE	/api/stations/:id	Delete station	Owner/Admin
Bookings
Method	Endpoint	Description	Auth
GET	/api/bookings/availability	Check slot availability	Private
POST	/api/bookings	Create booking	Private
GET	/api/bookings/me	Get user bookings	Private
PATCH	/api/bookings/:id/cancel	Cancel booking	Private
Admin
Method	Endpoint	Description	Auth
GET	/api/admin/users	Get all users	Admin
GET	/api/admin/stats	Get dashboard stats	Admin
🗺️ Supported Cities
City	State	Stations
Mumbai	Maharashtra	3
Delhi	Delhi	2
Bangalore	Karnataka	2
Chennai	Tamil Nadu	1
Hyderabad	Telangana	1
Pune	Maharashtra	1
Kolkata	West Bengal	1
Ahmedabad	Gujarat	1
Jaipur	Rajasthan	1
Lucknow	Uttar Pradesh	1
📦 Available Scripts
Backend
bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run seed:india   # Seed Indian charging stations
npm run init         # Initialize database indexes
npm run reset        # Reset database (init + seed)
Frontend
bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
