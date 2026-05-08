# GramMitra 🌾

GramMitra is a full-stack rural workforce marketplace platform that connects users with skilled local workers such as electricians, plumbers, AC repair technicians, carpenters, tutors, mechanics, and more.

The platform supports:

* Worker booking
* Worker dashboard
* Job lifecycle management
* Reviews & ratings
* Payment integration
* Multilingual support
* SMS notifications
* Geo-based worker discovery
* Role-based authentication

---

# 🚀 Features

## 👤 Authentication

* Role-based login/signup
* User & Worker accounts
* JWT authentication
* OTP verification flow

---

## 🧑‍🔧 Worker Marketplace

* Browse workers by category
* Search workers by skill
* Nearby worker discovery
* Worker profile pages
* Ratings & reviews
* Experience & wage display

---

## 📅 Booking System

* Create booking requests
* Worker accept/reject flow
* Booking dashboard
* Mark booking as completed
* Prevent self-booking
* Incoming jobs for workers
* Booking lifecycle tracking

---

## ⭐ Review & Rating System

* User can review completed bookings
* Star ratings
* Worker average rating calculation
* Total reviews tracking
* Duplicate review prevention

---

## 💳 Payment Integration

* Razorpay integration
* Payment verification
* Order creation
* Payment status tracking

---

## 📩 Notifications

* SMS notifications using Twilio
* Booking updates
* Payment success notifications

---

## 🌍 Multilingual Support

Supported languages:

* English
* Hindi

Localization implemented using:

* JSON translation files
* Dynamic translation hooks

---

# 🛠️ Tech Stack

## Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* Axios
* React Hot Toast

---

## Backend

* Spring Boot
* Java
* MongoDB
* JWT Security
* Lombok
* Maven

---

## Services & APIs

* Razorpay
* Twilio SMS API
* Gemini AI Chatbot

---

# 📂 Project Structure

## Frontend

```bash id="t0a9e1"
grammitra-frontend/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── public/
└── shared/
```

---

## Backend

```bash id="c2b8d4"
grammitra-backend/
├── controller/
├── dto/
├── model/
├── repository/
├── security/
├── service/
└── resources/
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash id="m3k7x2"
git clone https://github.com/KushiKshatriya100/GramMitra-Project.git
```

---

## 2️⃣ Frontend Setup

```bash id="p8v4n1"
cd grammitra-frontend

npm install

npm run dev
```

Frontend runs on:

```bash id="j5r1u7"
http://localhost:3000
```

---

## 3️⃣ Backend Setup

```bash id="w2q9m6"
cd grammitra-backend

mvn spring-boot:run
```

Backend runs on:

```bash id="n7f3d8"
http://localhost:8080
```

---

# 🔐 Environment Variables

Create:

## Frontend `.env.local`

```env id="e4c8k1"
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Backend `application.properties`

```properties id="y1b7t4"
spring.data.mongodb.uri=YOUR_MONGODB_URI

jwt.secret=YOUR_SECRET_KEY

razorpay.key=YOUR_RAZORPAY_KEY
razorpay.secret=YOUR_RAZORPAY_SECRET

twilio.account.sid=YOUR_TWILIO_SID
twilio.auth.token=YOUR_TWILIO_TOKEN
twilio.phone.number=YOUR_TWILIO_PHONE
```

---

# 📌 Booking Lifecycle

```text id="l6m2q8"
PENDING
   ↓
ACCEPTED
   ↓
COMPLETED
   ↓
REVIEW SUBMITTED
```

---

# ⭐ Review Flow

```text id="f9z4x1"
User books worker
↓
Worker accepts booking
↓
User marks booking completed
↓
User submits review
↓
Worker rating updates automatically
```

---

# 📷 Main Modules

* User Dashboard
* Worker Dashboard
* Worker Profiles
* Booking Management
* Payment Gateway
* Review System
* Chatbot Assistant

---

# 🔮 Future Improvements

* Real-time chat
* Push notifications
* AI worker recommendations
* Voice-based booking
* Admin dashboard
* Worker verification system

---

# 👩‍💻 Developed By

## Kushi Kshatriya

Full Stack Developer
MCA Final Year Student

---

# 📄 License

This project is developed for educational and portfolio purposes.
