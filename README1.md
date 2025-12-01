# 🏫 School / Academy Management System – Technical Blueprint

This document is a **complete blueprint** to actually build the project, not just think about it. It covers:

- Overall architecture (tech + flow)
- Features by role (Teacher / Parent / Owner / Staff)
- Database design (collections & fields)
- API design (important endpoints)
- App structure in Flutter (screens)
- Admin panel structure
- Week-by-week roadmap (what to do first → last)

Assumed stack:

- **Backend:** Node.js + Express + MongoDB
- **Mobile App:** Flutter
- **Admin Panel:** React or simple HTML + Bootstrap
- **Auth:** JWT (role-based)
- **Payments:** Razorpay / Stripe (later)
- **Optional:** Firebase Cloud Messaging (FCM) for notifications

---

## 1️⃣ Overall Architecture (High Level)

### Frontend

#### Flutter Mobile App

- **Single app**, multiple roles:
  - Teacher
  - Parent
  - School Owner

#### Web Admin Panel

- Built with **React** or **simple HTML + Bootstrap**
- Used by **Management Staff**

### Backend

- **Node.js + Express** REST API
- **MongoDB** as database
- **JWT Authentication** with role-based authorization
- **Payment gateway**:
  - Razorpay / Stripe (implemented later)
- **Optional**:
  - Firebase Cloud Messaging (FCM) for push notifications

### Example Flow – Fee Payment

1. Parent opens mobile app  
2. Sees **pending fee**  
3. Taps **“Pay”**  
4. Redirects to **payment gateway page**  
5. On success:
   - Backend marks invoice as **PAID**
   - Admin panel + owner dashboard show updated status

---

## 2️⃣ Features by Role (MVP)

### 🔹 Common (All Roles)

- Login / Logout
- View profile
- Change password

---

### 🧑‍🏫 Teacher (Mobile App)

- View assigned classes
- View students list
- Mark attendance (Present / Absent)
- Add homework / assignments
- (Optional later) View timetable

---

### 👨‍👩‍👧 Parent (Mobile App)

- View child details:
  - Class
  - Section
  - Roll number
- View attendance summary
- View homework / announcements
- View fees:
  - Pending fees
  - Paid history
- Pay fees online

---

### 👑 School Owner (Mobile App)

- View **total students** and **teachers**
- View **fee collection summary**
- View list of **defaulters** (students with pending fees)
- View **basic reports** (e.g. monthly collection)

---

### 🧑‍💼 Management Staff (Admin Panel)

- Full **CRUD** for:
  - Schools (if multiple)
  - Classes & Sections
  - Students
  - Parents
  - Teachers
- Assign students to classes
- Assign teachers to classes
- Create **fee structures**:
  - Fee type (tuition, transport, etc.)
  - Amount
  - Due dates
- Track payments
- Export basic reports (CSV, optional later)

---

## 3️⃣ Database Design (MongoDB – Collections)

You can refine this later, but this is a strong MVP starting point.

---

### 1. `users`

Stores login + role info.

```json
{
  "_id": "ObjectId",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password_hash": "...",
  "role": "TEACHER | PARENT | OWNER | STAFF",
  "schoolId": "ObjectId",   // which school they belong to
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
