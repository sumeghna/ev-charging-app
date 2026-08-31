# ⚡ EV India - EV Charging Station Locator & Booking System

A modern, full-stack web application that helps electric vehicle owners find nearby charging stations, check real-time availability, and book charging slots across India.

![EV India App](https://img.shields.io/badge/Status-Live-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=flat)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## 📱 Live Demo

| Feature | Description |
|---------|-------------|
| **Find Stations** | Search EV charging stations by city or use your location |
| **Live Map** | Interactive map with real-time station markers |
| **Book Slots** | Check availability and book charging slots instantly |
| **Dark/Light Mode** | Toggle between themes for comfortable browsing |
| **User Authentication** | Secure login/registration with JWT |
| **Responsive** | Works seamlessly on all devices |

---

## ✨ Features

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
| **CORS** | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React** | UI library |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling framework |
| **React Router** | Navigation |
| **React Leaflet** | Interactive maps |
| **Axios** | HTTP client |
| **React Hot Toast** | Notifications |
| **date-fns** | Date manipulation |

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
│ │ ├── Station.js # Station schema with 2dsphere index
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


## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB Atlas** account (free tier works)
- **Git** (for cloning)

### 1. Clone the Repository

```bash
git clone https://github.com/sumeghna/ev-charging-app.git
cd ev-charging-app

Backend Setup
bash
cd backend
npm install
cp .env.example .env

Frontend Setup
bash
cd ../frontend/frontend
npm install
cp .env.example .env

