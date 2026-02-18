# SynthAug - Complete Setup Guide for Instructors

This guide provides step-by-step instructions for setting up and running the SynthAug platform locally. The system consists of three main components: **Frontend**, **Backend**, and **AI Engines** (Image and Numeric).

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://www.python.org/)
- **MongoDB** - [Local installation](https://docs.mongodb.com/manual/installation/) OR [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recommended, free tier available)
- **Git** - [Download](https://git-scm.com/)

### Accounts Needed
- **MongoDB Atlas** - Free cloud database (optional but recommended)
- **Google Colab** - For GPU-based image generation (optional, for testing image projects)
- **Ngrok** - For tunneling Colab to backend (optional, for image projects)

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: 5GB for node_modules + dependencies
- **OS**: Windows, macOS, or Linux

---

## 🚀 Quick Start (5 minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/anVSS1/SynthAug.git
cd SynthAug
```

### Step 2: Setup Backend (Port 5000)

```bash
cd server
npm install
```

Create `.env` file in the `server/` directory:

```env
MONGO_URI=mongodb://localhost:27017/synthautg
JWT_SECRET=your-secret-key-change-this-to-something-secure
FRONTEND_URL=http://localhost:5173
AI_ENGINE_URL=http://localhost:5001
NODE_ENV=development
PORT=5000
```

Start the backend:

```bash
npm start
```

Expected output:
```
Server running on port 5000
Connected to MongoDB at mongodb://localhost:27017/synthautg
```

### Step 3: Setup Numeric Engine (Port 5001)

Open **new terminal**:

```bash
cd tabular_engine
pip install -r requirements.txt
python app.py
```

Expected output:
```
 * Running on http://localhost:5001
 * Press CTRL+C to quit
```

### Step 4: Setup Frontend (Port 5173/5174)

Open **new terminal**:

```bash
cd client
npm install
npm run dev
```

Expected output:
```
VITE v7.3.0  ready in 1234 ms
➜  Local:   http://localhost:5173
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the SynthAug dashboard. Create a test account to verify everything is working.

---

## 🏗️ Detailed Setup Instructions

### Backend Setup

#### 1. Install Dependencies

```bash
cd server
npm install
```

#### 2. Configure Environment Variables

Create `server/.env`:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/synthautg

# JWT Configuration
JWT_SECRET=your_very_secure_secret_key_min_32_characters

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend & Engine URLs
FRONTEND_URL=http://localhost:5173
AI_ENGINE_URL=http://localhost:5001
```

**For MongoDB Atlas (Cloud):**

If using MongoDB Atlas instead of local MongoDB:

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free tier cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/synthautg`
4. Update `MONGO_URI` in `.env`

#### 3. Verify Backend is Running

```bash
npm start
```

Test the API:
```bash
curl http://localhost:5000/api/auth/check
```

---

### Numeric Engine Setup (Tabular Data Generation)

#### 1. Install Python Dependencies

```bash
cd tabular_engine
pip install -r requirements.txt
```

**Contents of `requirements.txt`:**
```
Flask==2.3.2
Flask-CORS==4.0.0
pandas==2.0.3
scikit-learn==1.3.0
sdv==1.0.0
numpy==1.24.3
requests==2.31.0
```

#### 2. Run the Numeric Engine

```bash
python app.py
```

This service:
- Listens on `http://localhost:5001`
- Handles CSV uploads
- Trains CTGAN or Gaussian Copula models
- Generates synthetic tabular data

#### 3. Verify It's Running

```bash
curl http://localhost:5001/status
```

Expected response:
```json
{"status": "ready"}
```

---

### Frontend Setup

#### 1. Install Dependencies

```bash
cd client
npm install
```

#### 2. Run Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or next available port like 5174 if 5173 is in use).

#### 3. Build for Production (Optional)

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

---

## 🧪 Testing the System

### Test 1: User Authentication

1. Navigate to http://localhost:5173
2. Click "Sign Up"
3. Enter test credentials:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123!`
4. Click "Sign Up"
5. You should be redirected to the Dashboard

### Test 2: Create a Numeric Project

1. From Dashboard, click "New Project"
2. Enter project name: `Test Numeric Project`
3. Select **"Numeric Data"** as project type
4. Click "Create"
5. You should see the project in your list

### Test 3: Upload CSV and Train

1. Click on the newly created project
2. Click "Upload Dataset"
3. Select a CSV file (see sample CSV below)
4. Click "START TRAINING"
5. Watch the progress in real-time
6. After completion (1-5 minutes for CPU), click "Download Results"

#### Sample CSV for Testing

Create `test_data.csv`:
```csv
Age,Income,Score,Category
25,35000,72,A
30,45000,85,B
28,40000,78,A
35,55000,92,C
45,75000,88,B
```

### Test 3: Check Activity Feed

Go to Dashboard → Click "Activity" to see:
- Project creation events
- Training start/completion
- Download events

---

## 📁 Project Structure

```
SynthAug/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # Page components (Auth, Dashboard, Studio, etc.)
│   │   ├── components/    # Reusable components
│   │   ├── store/         # Zustand state management
│   │   └── services/      # API calls
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Node.js Backend
│   ├── routes/            # API endpoints
│   ├── models/            # MongoDB schemas
│   ├── middleware/        # Auth & validation
│   ├── index.js           # Server entry point
│   └── package.json
│
├── tabular_engine/        # Python Numeric Engine
│   ├── app.py             # Flask server
│   ├── requirements.txt    # Python dependencies
│   └── workdir/           # Generated CSV storage
│
├── README.md              # Project overview
└── SETUP_GUIDE.md         # This file
```

---

## 🔌 API Endpoints (For Development)

### Authentication
```
POST   /api/auth/register       Create new user
POST   /api/auth/login          Authenticate user
GET    /api/auth/check          Verify token validity
```

### Projects
```
GET    /api/projects            List user's projects
POST   /api/projects            Create new project
GET    /api/projects/:id        Get project details
PUT    /api/projects/:id        Update project
DELETE /api/projects/:id        Delete project
```

### Training & Data
```
POST   /api/proxy/:id/upload               Upload dataset (image or CSV)
POST   /api/proxy/:id/train                Start training
GET    /api/proxy/:id/status               Get training progress
GET    /api/proxy/:id/download             Download results
```

### Activity & Notifications
```
GET    /api/activity                       Get activity log
GET    /api/notifications                  Get notifications
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solution:**
1. Verify MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
2. Check `MONGO_URI` in `.env` is correct
3. If using Atlas, verify IP whitelist allows your connection

### Issue: "Port 5000/5001/5173 already in use"

**Solution:**
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

### Issue: "npm install fails with permission denied"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Issue: "Python module not found"

**Solution:**
```bash
# Ensure you're in virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install again
pip install -r requirements.txt
```

### Issue: Frontend shows "Cannot connect to backend"

**Solution:**
1. Verify backend is running: `http://localhost:5000/api/auth/check`
2. Check `FRONTEND_URL` in backend `.env`
3. Clear browser cache and refresh
4. Check browser console (F12) for CORS errors

---

## 📊 Understanding the Project Types

### Image Projects
- **Purpose**: Generate synthetic images using Projected GAN
- **Input**: ZIP file with 50-100+ images
- **Output**: Generated images in ZIP format
- **Training Time**: 30 minutes to 3+ hours (depending on GPU availability)
- **Requirements**: GPU (Google Colab + Ngrok setup)
- **Status**: Optional (requires Colab notebook configuration)

### Numeric Projects
- **Purpose**: Generate synthetic tabular data (CSV)
- **Input**: CSV file with numeric/categorical columns
- **Output**: Generated CSV with synthetic rows
- **Training Time**: 1-5 minutes (CPU-only)
- **Requirements**: Local Python environment
- **Status**: ✅ Fully working out-of-the-box

---

## 🚀 Running Everything (Complete System)

For convenience, here's the complete startup sequence:

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start
```

**Terminal 2 - Numeric Engine:**
```bash
cd tabular_engine
pip install -r requirements.txt
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd client
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

## 📚 Database Structure

The system uses MongoDB with the following collections:

### Users
```javascript
{
  _id: ObjectId,
  username: "testuser",
  email: "test@example.com",
  password_hash: "bcrypt_hashed_password",
  avatar: "https://...",
  createdAt: ISO_DATE,
  totalProjects: 5,
  totalImagesGenerated: 1500
}
```

### Projects
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId(User),
  name: "My Data Project",
  type: "image" | "tabular",
  status: "idle" | "training" | "completed" | "failed",
  progress: 0-100,
  logs: ["log message 1", "log message 2"],
  createdAt: ISO_DATE,
  completedAt: ISO_DATE,
  resultPath: "/path/to/results"
}
```

### Activities
```javascript
{
  _id: ObjectId,
  userId: ObjectId(User),
  projectId: ObjectId(Project),
  action: "project_created" | "training_started" | "download",
  metadata: {imageCount: 150, trainingTime: 3600},
  timestamp: ISO_DATE
}
```

---

## ✅ Verification Checklist

After setup, verify each component:

- [ ] **Backend started** - `npm start` shows "Server running on port 5000"
- [ ] **Database connected** - "Connected to MongoDB" message appears
- [ ] **Numeric Engine started** - `python app.py` shows "Running on http://localhost:5001"
- [ ] **Frontend started** - `npm run dev` shows "Local: http://localhost:5173"
- [ ] **Can access dashboard** - Browser shows login page at localhost:5173
- [ ] **Can create account** - Sign up and reach dashboard
- [ ] **Can create project** - New project appears in list
- [ ] **Can upload CSV** - File upload succeeds without errors
- [ ] **Can start training** - Progress bar appears and updates
- [ ] **Can download results** - Download button works after completion

---

## 📖 Additional Resources

- **React Documentation**: https://react.dev/
- **Node.js Documentation**: https://nodejs.org/docs/
- **MongoDB Documentation**: https://docs.mongodb.com/
- **PyTorch Documentation**: https://pytorch.org/docs/
- **Projected GAN Paper**: https://arxiv.org/abs/2111.01007

---

## ❓ FAQ

**Q: Can I use this on macOS/Linux?**  
A: Yes! The only difference is:
- macOS: Use `brew` for package management
- Linux: Use `apt`/`yum` for packages
- All code is cross-platform

**Q: Do I need a GPU for numeric projects?**  
A: No! Numeric projects run on CPU. GPU is optional and only for image projects.

**Q: Can multiple users train simultaneously?**  
A: In development: No (single queue). In production: Yes (with job queue system like Redis + Bull).

**Q: How long does training take?**  
A: 
- Numeric: 1-5 minutes (CPU)
- Image Draft: 30 min - 1 hour
- Image Studio: 1 - 3 hours

**Q: Can I use this in production?**  
A: This is a development setup. For production, see the main README for deployment recommendations.

---

## 📞 Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Check browser console for errors (F12)
3. Check server logs in terminal
4. Verify all three services are running

---

**Last Updated**: February 2026  
**Author**: SynthAug Development Team
