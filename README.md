# 🚗 Multi-Vendor Car Rental Platform

A production-ready, scalable multi-vendor car rental platform with real-time updates, payment integration, and comprehensive admin features.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎯 Core Features
- **Multi-Tenancy**: USER, VENDOR, and ADMIN roles
- **Real-Time Updates**: WebSocket integration for live availability
- **Payment Integration**: Stripe checkout with secure payment processing
- **Commission System**: Automatic platform commission calculation
- **Geo-Location Search**: Find cars by location with distance-based search
- **Booking Management**: Complete booking lifecycle with conflict prevention
- **Admin Dashboard**: Analytics, vendor/car approvals, revenue tracking

### 🏢 For Vendors
- Add, edit, and manage car listings
- View bookings and earnings
- Real-time booking notifications
- Set pickup locations (geo-coordinates)
- Manage availability

### 👤 For Users
- Search and filter cars
- Map-based car discovery
- Real-time availability updates
- Secure booking with Stripe payments
- Booking management dashboard

### 👨‍💼 For Admins
- Approve vendors and cars
- Platform analytics and revenue dashboard
- Commission management
- User and booking oversight

## 🏗️ Architecture

```
Frontend (Next.js) ←→ Backend (Express) ←→ MongoDB Atlas
         ↕                    ↕
    Socket.IO          Stripe API
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **MongoDB Atlas** account (free tier available)
- **Stripe** account (for payments)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Rental-Web
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend (from root)
cd ..
npm install
```

3. **Set up environment variables**

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB Atlas connection string
```

**Frontend** (`.env.local`):
```bash
cp .env.example .env.local
# Edit .env.local with your API URLs
```

4. **Configure MongoDB Atlas**
   - Create a cluster at https://cloud.mongodb.com
   - Get connection string
   - Whitelist your IP address (Network Access)
   - See `backend/MONGODB_SETUP.md` for detailed instructions

5. **Configure Stripe** (Optional for testing)
   - Create account at https://stripe.com
   - Get test API keys from dashboard
   - Add to `backend/.env`

6. **Start development servers**

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
npm run dev
```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/health

## 📁 Project Structure

```
Rental-Web/
├── backend/              # Express.js backend
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Auth & validation
│   ├── websocket/       # Socket.IO handlers
│   └── server.js        # Main server file
│
├── app/                  # Next.js app directory
│   ├── api/             # API routes (if needed)
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # User/Vendor/Admin dashboards
│   └── vehicles/        # Car listing pages
│
├── components/           # React components
├── lib/                  # Utilities & API clients
├── types/                # TypeScript types
└── store/                # State management
```

## 🔌 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/vendor/onboard` - Vendor onboarding

### Cars
- `GET /api/cars` - Get all cars (with filters)
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create car (VENDOR)
- `PUT /api/cars/:id` - Update car (VENDOR)
- `DELETE /api/cars/:id` - Delete car (VENDOR)

### Bookings
- `POST /api/bookings` - Create booking (USER)
- `GET /api/bookings/user` - Get user bookings
- `GET /api/bookings/vendor` - Get vendor bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/create-session` - Create Stripe checkout
- `POST /api/payments/webhook` - Stripe webhook handler

### Admin
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/vendors` - Get all vendors
- `PUT /api/admin/vendors/:id/approve` - Approve vendor
- `GET /api/admin/cars` - Get all cars
- `PUT /api/admin/cars/:id/approve` - Approve car

## 🔌 WebSocket Events

### Client → Server
- `join_car` - Join car room for real-time updates
- `leave_car` - Leave car room

### Server → Client
- `car_available` - Car became available
- `car_unavailable` - Car became unavailable
- `booking_created` - New booking created
- `booking_cancelled` - Booking cancelled
- `payment_success` - Payment succeeded
- `new_booking` - New booking notification (vendor)

## 💳 Stripe Integration

The platform uses Stripe Checkout for secure payments.

### Setup
1. Create Stripe account
2. Get test API keys from dashboard
3. Add to `backend/.env`
4. Set up webhook endpoint (use Stripe CLI for local development)

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 Documentation

- `PRODUCTION_README.md` - Production deployment guide
- `DEPLOYMENT.md` - Detailed deployment instructions
- `backend/MONGODB_SETUP.md` - MongoDB setup guide
- `COMPLETE_PROJECT_SUMMARY.md` - Complete project overview

## 🔒 Security

- JWT authentication
- Password hashing (bcrypt)
- Input validation
- CORS configuration
- Security headers (Helmet.js)
- Rate limiting
- Environment variable protection

## 🧪 Testing

```bash
# Test MongoDB connection
cd backend
node test-mongodb-connection.js

# Run backend
npm run dev

# Run frontend
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team
- Express.js community
- MongoDB Atlas
- Stripe
- Socket.IO

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using Next.js, Express.js, MongoDB, and Socket.IO**
