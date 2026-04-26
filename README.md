# UniComplaint - University Complaint Management System

A full-stack complaint management system built with Next.js 13, MongoDB, and NextAuth.

## Tech Stack
- **Framework:** Next.js 13 (App Router)
- **Database:** MongoDB Atlas (via Mongoose)
- **Authentication:** NextAuth.js
- **Styling:** Custom CSS (Glassmorphism & Dark Mode)
- **Charts:** Chart.js

---

## 🚀 Getting Started for Collaborators

If you are cloning this project to work on it, follow these steps to get your environment set up.

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Because `.env.local` is ignored by Git for security, you need to create it manually on your machine.

1. Copy the example environment file:
   - Create a new file named `.env.local` in the root folder.
   - Copy the contents from `.env.example` into `.env.local`.
2. Fill in the values:
   - `MONGODB_URI`: Ask the repository owner for the shared MongoDB Atlas connection string, or provide your own local MongoDB connection string (e.g., `mongodb://127.0.0.1:27017/compsystem`).
   - `NEXTAUTH_SECRET`: Generate a random string (or ask the owner for the shared one). You can generate one by running `openssl rand -base64 32` in your terminal.
   - `NEXTAUTH_URL`: Keep this as `http://localhost:3000` for local development.

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Seed the Database (Optional)
If you are using a fresh database, you can automatically generate demo users and complaints by visiting:
[http://localhost:3000/api/seed](http://localhost:3000/api/seed)
