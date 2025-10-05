# Live Polling System ✨

A real-time, interactive polling application for teachers and students. Built with the MERN stack (MongoDB, Express, React, Node.js), this project features live updates via Socket.io, a persistent database, and a secure authentication system for teachers.

**Live Demo URL**: *(https://live-polling-system-gold-gamma.vercel.app/)*

---

## Features

### 🧑‍🏫 Teacher Features
* **Secure Authentication**: Teachers can register for an account and log in to a secure dashboard.
* **Create Polls**: Ask questions with multiple-choice options and designate one as the correct answer.
* **Live Results**: View poll results update in real-time as students submit their answers.
* **Participant Management**: View a list of all connected students and remove them from the session if necessary.
* **Poll History**: Access a persistent history of all past polls and their results, stored in MongoDB.

### 🧑‍🎓 Student Features
* **Join Session**: Students can easily join a polling session by providing their name.
* **Real-Time Voting**: Receive poll questions instantly as the teacher asks them and submit answers once.
* **View Results**: See the final results of each poll, with the correct answer highlighted.
* **Poll History**: Students can also view the history of past polls.

---

## 🛠️ Technology Stack

This project is a full-stack application leveraging modern web technologies.

* **Frontend**:
    * [React](https://reactjs.org/) (with Vite)
    * [Tailwind CSS](https://tailwindcss.com/)
    * [Socket.io Client](https://socket.io/docs/v4/client-api/)

* **Backend**:
    * [Node.js](https://nodejs.org/)
    * [Express.js](https://expressjs.com/)
    * [Socket.io](https://socket.io/)
    * [Mongoose](https://mongoosejs.com/) (for MongoDB)
    * [Passport.js](http://www.passportjs.org/) (for authentication)

* **Database & Services**:
    * [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud Database)
    * [Render](https://render.com/) (Cloud service for Backend & Redis)
    * [Vercel](https://vercel.com/) (Cloud service for Frontend)

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the application on your local machine for development and testing.

### Prerequisites

Make sure you have the following installed:
* [Node.js](https://nodejs.org/en/download/) (v18 or higher)
* A local [MongoDB](https://www.mongodb.com/try/download/community) server or a free MongoDB Atlas account.
* A local [Redis](https://redis.io/docs/getting-started/installation/) server.

### 1. Installation

1.  Clone the repository to your local machine.
2.  Install backend dependencies:
    ```bash
    cd backend
    npm install
    ```
3.  Install frontend dependencies:
    ```bash
    cd ../frontend
    npm install
    ```

### 2. Configuration

Create a `.env` file in the `backend` directory. This file is crucial for storing your secret keys and database connection strings.

```env
# backend/.env

# Server Configuration
PORT=4000
CORS_ORIGIN=http://localhost:5173 # Default Vite port

# Database & Session
MONGO_URI=mongodb://localhost:27017/live_polling_app
REDIS_URL=redis://localhost:6379
SESSION_SECRET='your_super_secret_string_here'

# Poll Configuration
POLL_DURATION_SECONDS=60
Note: If your Vite frontend runs on a different port, update CORS_ORIGIN accordingly.

3. Running the Application Locally
You will need two separate terminals to run the frontend and backend servers simultaneously.

Start your local MongoDB and Redis servers.

Start the Backend Server (in Terminal 1):

Bash

cd backend
npm run dev
Start the Frontend Server (in Terminal 2):

Bash

cd frontend
npm run dev
Open your browser and navigate to the URL provided by the frontend terminal (usually http://localhost:5173).

🌐 Deployment
This application is designed to be deployed using free-tier cloud services.

1. Database Setup (MongoDB Atlas)
Create a free M0 cluster on MongoDB Atlas.

In "Network Access", allow access from anywhere by adding the IP address 0.0.0.0/0.

Get your database connection string (URI).

2. Backend & Redis Deployment (Render)
Push your backend code to a dedicated GitHub repository.

On Render, create a new Key Value (Redis) instance on the free tier. Copy its Internal Redis URL.

On Render, create a new Web Service and connect it to your backend's GitHub repository.

Set the Build Command to npm install and the Start Command to node src/server.js.

Under the "Environment" tab, add your MONGO_URI, SESSION_SECRET, and the REDIS_URL you copied.

3. Frontend Deployment (Vercel)
Push your frontend code to a dedicated GitHub repository.

On Vercel, import your frontend's GitHub repository.

In the project settings, add an Environment Variable: VITE_BACKEND_URL and set its value to the live URL of your backend on Render (e.g., https://your-backend.onrender.com).

Deploy the project. Vercel will give you your public live URL.

4. Final Step
Go back to your backend service on Render and update the CORS_ORIGIN environment variable with your live Vercel frontend URL. This will allow the two services to communicate.