# 🎓 Student Progress Management System

A full-stack MERN application to manage and monitor student progress, specifically focused on their Codeforces activity. This system helps track performance, send reminders, and generate reports with a clean, responsive interface.

---

## 📌 Table of Contents

- [🔧 Tech Stack](#-tech-stack)
- [🖥 Features](#-features)
- [📽 Product Walkthrough](#-product-walkthrough)
- [📁 Folder Structure](#-folder-structure)
- [📡 APIs Used](#-apis-used)
- [📊 Interface Overview](#-interface-overview)
- [📄 Documentation](#-documentation)
- [📎 Links](#-links)

---

## 🔧 Tech Stack

- **Frontend**: React.js, Tailwind CSS / Bootstrap, Chart.js, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Scheduling**: node-cron
- **External API**: Codeforces API
- **Other Tools**: CSV Generator, Nodemailer, Mongoose, Axios

---

## 🖥 Features

### 📋 Student Table View
- List students with: `Name`, `Email`, `Phone`, `CF Handle`, `Current Rating`, `Max Rating`
- **Add / Edit / Delete** student data
- **View more** → detailed Codeforces stats
- Export all data as `.csv`
- Show last updated timestamp per student

### 👤 Student Profile View
- **Contest History**: Rating graph, contest list, filters (30/90/365 days)
- **Problem Solving**: Filters (7/30/90 days), stats like:
  - Most difficult problem solved
  - Total problems solved
  - Average rating
  - Problems/day
  - Bar chart by rating bucket
  - Submission heat map

### 🔄 Codeforces Data Sync
- Daily background sync via `cron` (default: 2 AM)
- Realtime fetch if CF handle is updated
- Option to change sync frequency & time

### 🚨 Inactivity Detection
- Detect students with **no submissions in last 7 days**
- Auto-email reminders with count tracking
- Toggle to disable emails per student

### 💡 Bonus
- Responsive UI (Mobile & Tablet)
- Light/Dark Mode toggle
- Modular & well-commented code

---

## 📽 Product Walkthrough

📹 [Click here to watch the demo video](#)  
*(Replace with actual YouTube/Drive link)*

---

## 📁 Folder Structure

/client # React frontend
/server # Express backend
└── /controllers
└── /routes
└── /models
└── /cron
.env # Environment variables
README.md



---

## 📡 APIs Used

- [Codeforces API](https://codeforces.com/apiHelp)
  - `user.info`
  - `user.rating`
  - `user.status`
  - `contest.list`

---

## 📊 Interface Overview

- `/students`: All students table view  
- `/students/:id`: Profile page with detailed graphs  
- `/add-student`: Add new student  
- `/edit/:id`: Edit student  
- Cron job auto-runs & can be configured via `.env`

---

## 📄 Documentation

### `.env` Variables


PORT=5000
MONGO_URI=your_mongodb_url
CODEFORCES_BASE=https://codeforces.com/api/
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CRON_SCHEDULE=0 2 * * * # (default: 2AM)


### Running the Project Locally
```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm start
