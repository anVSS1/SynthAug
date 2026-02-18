# SynthAug - AI SaaS Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

This repository contains the complete source code for SynthAug, a premium AI SaaS platform for synthetic data generation using Generative Adversarial Networks (GANs).

## 🎯 Features

- **User Authentication** - Secure JWT-based authentication system
- **Project Management** - Create and manage multiple AI projects
- **AI-Powered Generation** - Synthetic data generation using Projected GANs
- **Tabular Augmentation** - Local CPU generation for numeric datasets (CTGAN or Gaussian Copula)
- **Real-time Progress** - Live updates on training progress
- **Modern UI** - Beautiful, responsive interface built with React & Tailwind CSS
- **Notifications** - Stay informed about project status
- **Activity Tracking** - Monitor your project history and statistics
- **Security** - Rate limiting, helmet.js, input validation

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Morgan** - Logging

### AI Engine

- **Google Colab** - GPU training environment
- **Ngrok** - Tunneling service
- **PyTorch** - Deep learning framework
- **Projected GAN** - GAN architecture
- **SDV (CTGAN/Gaussian Copula)** - Local CPU engine for numeric data

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas/register)
- **Google Colab Account** - [Access](https://colab.research.google.com/)
- **Ngrok Account** - [Sign up free](https://dashboard.ngrok.com/signup)

---

## 🚀 Quick Start Summary

**To run the complete platform, you need:**

1. **Backend** (Always required):

   ```bash
   cd server && npm install && npm start
   ```

2. **Frontend** (Always required):

   ```bash
   cd client && npm install && npm run dev
   ```

3. **For Image Projects** (Optional - only if working with images):
   - Run Google Colab notebook `colab_backend.ipynb`
   - Get Ngrok URL and update `server/.env`

4. **For Numeric Projects** (Optional - only if working with CSV):
   ```bash
   cd tabular_engine && pip install -r requirements.txt && python app.py
   ```

**Access**: Open browser to `http://localhost:5173`

---

## 🚀 Complete Setup Guide - Start to Finish

The application consists of **four components** that must run simultaneously:

1. **Backend Server** (Node.js + Express + MongoDB)
2. **Frontend Client** (React + Vite)
3. **AI Engine** (Google Colab + Ngrok) - for image projects only
4. **Tabular Engine** (Python Flask + SDV) - for numeric projects only

Follow these steps in order:

---

### STEP 1: Clone the Repository

```bash
git clone https://github.com/anVSS1/SynthAug.git
cd "SaaS GANs"
```

---

### STEP 2: Set Up MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account
2. Create a new cluster (free tier is sufficient)
3. Click **"Connect"** on your cluster
4. Choose **"Connect your application"**
5. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/`)
6. Replace `<password>` with your actual database password
7. **Save this connection string** - you'll need it in Step 4

---

### STEP 3: Set Up Ngrok Tunnel

1. Go to [Ngrok](https://dashboard.ngrok.com/signup) and create a free account
2. Navigate to [Your Authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy your authtoken (it looks like: `2aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
4. **Save this token** - you'll need it in Step 5

---

### STEP 4: Configure and Start the Backend Server

1. **Navigate to server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - On Windows:
     ```bash
     copy .env.example .env
     ```
   - On Mac/Linux:
     ```bash
     cp .env.example .env
     ```

   **Before proceeding, verify your configuration:**

   ```bash
   node check-backend.js
   ```

   This diagnostic script will check if your `.env` file is properly configured.

4. **Edit the `.env` file** (use any text editor):

   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://your-username:your-password@cluster.xxxxx.mongodb.net/synthaug?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   AI_ENGINE_URL=https://placeholder-will-update-after-step5.ngrok-free.app
   TABULAR_ENGINE_URL=http://localhost:5001
   ```

   **Configuration Details:**
   - `MONGO_URI`: Paste the MongoDB connection string from Step 2
   - `JWT_SECRET`: Any long random string (e.g., `openssl rand -base64 32`)
   - `AI_ENGINE_URL`: Leave as placeholder (will update after Step 5)
   - `TABULAR_ENGINE_URL`: Leave as-is for local tabular engine

5. **Verify configuration again:**

   ```bash
   node check-backend.js
   ```

   Fix any errors before proceeding.

7 NODE_ENV=development

````

**Configuration Details:**
- `MONGO_URI`: Paste the MongoDB connection string from Step 2
- `JWT_SECRET`: Any long random string (e.g., `openssl rand -base64 32` to generate one)
- `AI_ENGINE_URL`: Leave as placeholder for now (will update after Step 5)

5. **Start the backend server:**
```bash
npm start
````

You should see:

```
MongoDB Connected...
Server running on port 5000
```

✅ **Keep this terminal running**

---

### STEP 5: Set Up and Start the AI Engine (Google Colab - Images)

1. **Open Google Colab:**
   - Go to [Google Colab](https://colab.research.google.com/)
   - Click **"File"** → **"Upload notebook"**
   - Upload `colab_backend.ipynb` from the project root

2. **Configure Ngrok Token:**
   - In the notebook, find Cell 2 (Imports & Configuration)
   - Replace the ngrok token:
     ```python
     NGROK_AUTH_TOKEN = "YOUR_TOKEN_HERE"  # Paste your Ngrok token from Step 3
     ```

3. **Run all cells:**
   - Click **"Runtime"** → **"Run all"**
   - Or press `Ctrl+F9` (Windows) / `Cmd+F9` (Mac)
   - Wait for each cell to complete

4. **Copy the Ngrok URL:**
   - After the last cell runs, you'll see output like:
     ```
     🔥 BINDING SUCCESSFUL.
     🔗 COPY THIS URL INTO YOUR WEBSITE .ENV FILE: https://xxxx-xxxx-xxxx.ngrok-free.app
     ```
   - **Copy this URL**

5. **Update Backend .env file:**
   - Go back to your backend terminal
   - Stop the server (Ctrl+C)
   - Open `server/.env` and update:
     ```env
     AI_ENGINE_URL=https://xxxx-xxxx-xxxx.ngrok-free.app
     ```
   - Save the file
   - Restart the server:
     ```bash
     npm start
     ```

   ✅ **Keep both the Colab notebook and backend server running**

---

### STEP 5B: Set Up Local Tabular Engine (For Numeric Data)

**Purpose:** This engine generates synthetic numeric data (CSV) using CTGAN or Gaussian Copula models. It runs entirely on your CPU without requiring Colab or GPU.

1. **Navigate to tabular engine directory:**

   ```bash
   cd tabular_engine
   ```

2. **Install Python dependencies:**

   ```bash
   pip install flask flask-cors pandas numpy sdv requests
   ```

   Or if you have a requirements file:

   ```bash
   pip install -r requirements.txt
   ```

3. **Start the tabular engine:**

   ```bash
   python app.py
   ```

   You should see:

   ```
   * Running on http://127.0.0.1:5001
   * Running on http://192.168.x.x:5001
   ```

   ✅ **Keep this terminal running**

4. **Verify backend configuration:**

   Your backend `.env` should already have:

   ```env
   TABULAR_ENGINE_URL=http://localhost:5001
   ```

> **Note:** The numeric project type automatically uses this local engine. No Ngrok or GPU required!

---

### STEP 6: Configure and Start the Frontend

1. **Open a new terminal** and navigate to the client directory:

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   You should see:

   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  press h + enter to show help
   ```

   ✅ **Keep this terminal running**

---

### STEP 7: Verify Everything is Running

Before using the application, make sure all required services are running:

#### Backend (Required):

```bash
# Terminal 1
cd server
npm start
# Should show: "MongoDB Connected..." and "Server running on port 5000"
```

#### Frontend (Required):

```bash
# Terminal 2
cd client
npm run dev
# Should show: "Local: http://localhost:5173/"
```

#### Image Engine (Optional - only for image projects):

- Google Colab notebook running (last cell showing Ngrok URL)
- Ngrok URL copied to `server/.env`

#### Tabular Engine (Optional - only for numeric projects):

```bash
# Terminal 3
cd tabular_engine
python app.py
# Should show: "Running on http://127.0.0.1:5001"
```

---

### STEP 8: Access the Application

1. **Open your web browser** and go to: `http://localhost:5173`

2. **Create an account:**
   - Click **"Sign Up"**
   - Enter your email and password
   - Click **"Create Account"**

3. **You're in!** You should now see the Dashboard with the ability to create projects

> 💡 **Note:** The dashboard is accessible at both `http://localhost:5173/` and `http://localhost:5173/dashboard`

---

## 🎨 Using SynthAug

### Understanding Project Types

SynthAug supports two types of synthetic data generation:

#### Image Projects 🖼️

- **Input**: ZIP file with images (JPG, PNG, JPEG)
- **Engine**: Google Colab GPU with Projected GAN
- **Training Time**: 5-60+ minutes depending on preset
- **Output**: ZIP with generated images (50-1000+)
- **Requirements**: Colab notebook running + Ngrok URL configured
- **Use Cases**: Image augmentation, style transfer, dataset expansion

#### Numeric Projects 📊

- **Input**: CSV file with numeric/categorical data
- **Engine**: Local Python Flask with SDV (CTGAN/Gaussian Copula)
- **Training Time**: 1-5 minutes (CPU-only)
- **Output**: CSV with synthetic rows (10-100,000+)
- **Requirements**: Python Flask app running on localhost:5001
- **Use Cases**: Tabular data augmentation, privacy-preserving datasets, ML training data

---

### Creating Your First Project

#### For Image Projects:

1. **Click "New Project"** on the dashboard
2. **Enter a project name** (e.g., "My Image Dataset")
3. **Select "Image Data"** as the project type
4. **Click "Create Project"**
5. Navigate to your project to upload images and start training

#### For Numeric Projects:

1. **Click "New Project"** on the dashboard
2. **Enter a project name** (e.g., "My Numeric Dataset")
3. **Select "Numeric Data"** as the project type
4. **Click "Create Project"**
5. Navigate to your project to upload CSV and start training

### Training the AI Model

#### Image Projects:

1. **Open your project** from the dashboard
2. **Select your ZIP file** containing images
3. **Click "Upload File"** to upload the dataset
4. **Choose a training preset:**
   - **Draft Mode** - Fast training (50 iterations, ~5-10 minutes)
   - **Studio Mode** - High quality (600 iterations, ~45-60 minutes)
5. **Set the number of images** to generate (50-1000)
6. **Click "START TRAINING"**
7. **Monitor progress** in real-time
8. **Download results** when complete (ZIP file with generated images)

#### Numeric Projects:

1. **Open your project** from the dashboard
2. **Select your CSV file** containing numeric data
3. **Columns are automatically detected** and shown in the schema preview
4. **Choose a synthesis model:**
   - **CTGAN** - Neural network-based synthesis (more accurate, slower)
   - **Gaussian Copula** - Statistical synthesis (faster, good for smaller datasets)
5. **Set the number of rows** to generate (10-100,000)
6. **Click "START TRAINING"** (CSV auto-uploads and training starts)
7. **Monitor progress** in real-time
8. **Download results** when complete:
   - **Generated Only** - CSV with synthetic rows only
   - **Original + Generated** - Merged CSV with both original and synthetic data

---

## 📁 Project Structure

```
SaaS GANs/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── DeleteConfirmModal.tsx
│   │   │   ├── NewProjectModal.tsx
│   │   │   ├── ProgressVisualization.tsx
│   │   │   └── Terminal.tsx
│   │   ├── layouts/          # Page layouts
│   │   │   └── MainLayout.tsx
│   │   ├── pages/            # Route pages
│   │   │   ├── Auth.tsx      # Login/Register
│   │   │   ├── Dashboard.tsx # Main dashboard
│   │   │   ├── Studio.tsx    # Project workspace (Image/Numeric)
│   │   │   ├── Settings.tsx  # User settings
│   │   │   ├── Upload.tsx    # Upload interface
│   │   │   └── Legal.tsx     # Terms/Privacy
│   │   ├── services/         # API integration
│   │   │   └── api.ts        # Axios config + interceptors
│   │   ├── store/            # State management (Zustand)
│   │   │   ├── useAuthStore.ts
│   │   │   ├── useProjectStore.ts
│   │   │   └── useNotificationStore.ts
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   ├── vite.config.ts        # Vite configuration
│   └── tailwind.config.js    # Tailwind CSS config
│
├── server/                    # Backend application
│   ├── models/               # Database models
│   │   ├── User.js          # User authentication
│   │   ├── Project.js       # Project data (image/tabular)
│   │   ├── Activity.js      # Activity logs
│   │   └── Notification.js  # Notifications
│   ├── routes/               # API endpoints
│   │   ├── auth.js          # Authentication routes
│   │   ├── projects.js      # Project CRUD
│   │   ├── proxy.js         # Dual AI engine proxy
│   │   ├── notifications.js # Notification routes
│   │   ├── activity.js      # Activity routes
│   │   └── user.js          # User profile routes
│   ├── middleware/           # Express middleware
│   │   └── auth.js          # JWT verification
│   ├── index.js              # Server entry point
│   ├── check-backend.js      # Config validation script
│   ├── package.json
│   └── .env.example          # Environment template
│
├── tabular_engine/            # Tabular AI engine (CPU-only)
│   ├── app.py                # Flask server (port 5001)
│   ├── requirements.txt      # Python dependencies
│   └── workdir/              # Project workspaces (CSV I/O)
│
├── colab_backend.ipynb        # Image AI training notebook (GPU)
├── LICENSE
├── README.md                  # This file
└── SynthAug_Project_Report.tex # LaTeX report
```

---

## 🔧 Troubleshooting

### Dashboard Shows Blank Page

If you see a blank dashboard:

1. **Check browser console** (F12) for errors
2. **Verify backend is running** - Should show "MongoDB Connected" and "Server running on port 5000"
3. **Verify MongoDB connection** - Check your `MONGO_URI` in `server/.env`
4. **Check authentication** - Try logging out and logging back in
5. **Clear browser storage** - Open DevTools → Application → Clear storage
6. **Restart all services:**
   ```bash
   # Kill all terminals (Ctrl+C)
   # Restart backend
   cd server && npm start
   # Restart frontend (new terminal)
   cd client && npm run dev
   ```

### Backend Connection Errors

- Ensure MongoDB Atlas allows connections from your IP
- Check firewall settings
- Verify `.env` file exists and is configured correctly

### Tabular Engine Not Responding

- Verify Flask app is running: `python tabular_engine/app.py`
- Check console output shows "Running on http://127.0.0.1:5001"
- Verify `TABULAR_ENGINE_URL=http://localhost:5001` in `server/.env`
- Check port 5001 is not in use by another process
- Ensure Python dependencies installed: `pip install -r tabular_engine/requirements.txt`
- Look for errors in Python terminal output

### AI Engine Not Responding

- Verify Ngrok URL is correct in `server/.env`
- Check Google Colab notebook is still running
- Ngrok free tier URLs expire - restart Colab and update `AI_ENGINE_URL`

### Port Already in Use

If port 5000 or 5173 is already in use:

```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## 🔒 Security Considerations

- All environment variables are excluded from version control
- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens for secure authentication
- Rate limiting on API endpoints (20 auth requests per 15 minutes)
- CORS configuration for production
- Input validation and sanitization
- Security headers with Helmet.js

**⚠️ IMPORTANT:** Never commit your `.env` file or expose sensitive credentials

---

## 🌐 Deployment

### Backend Deployment (Railway, Render, Heroku)

1. Create account on hosting platform
2. Create new project and connect your Git repository
3. Set environment variables:
   ```env
   NODE_ENV=production
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-secret-key
   AI_ENGINE_URL=your-colab-ngrok-url
   PORT=5000
   FRONTEND_URL=https://your-frontend-domain.com
   ```
4. Deploy from `server` directory

### Frontend Deployment (Vercel, Netlify)

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `client/dist` folder
3. Set build command: `npm run build`
4. Set output directory: `dist`

### AI Engine - Production Considerations

For production, consider:

- **Dedicated GPU server** (AWS EC2 with GPU, Google Cloud Compute Engine)
- **Stable public URL** (not Ngrok) - Deploy Flask app with proper domain
- **Authentication** - Add API keys for AI engine
- **Rate limiting** - Protect AI endpoints
- **Queue system** - Handle multiple training requests (Redis + Bull)

---

## 🧪 Development Tips

### Running in Development

- Backend has hot-reload with nodemon
- Frontend has HMR (Hot Module Replacement) with Vite
- MongoDB in Atlas has free monitoring tools

### Environment Variables

Create a `.env.local` file for local overrides (ignored by git)

### API Testing

Use the `/api` prefix for all endpoints (proxied by Vite in development)

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Known Issues & Limitations

### Ngrok Free Tier

- **URL expires after 2 hours of inactivity**
- Must restart Colab notebook and update `AI_ENGINE_URL` in backend `.env`
- For production, use a stable hosting solution

### Google Colab

- **Session disconnects after 12 hours** (or sooner if idle)
- Must keep browser tab open or Colab disconnects
- Free tier has GPU usage limits
- Solution: Use Google Colab Pro or migrate to dedicated GPU server

### MongoDB Atlas Free Tier

- Limited to 512 MB storage
- Max 100 connections
- Sufficient for development/small projects

### Storage

- **Image projects**: Generated images stored temporarily on Colab - download before session expires
- **Numeric projects**: CSV files stored in `tabular_engine/workdir/{projectId}/` - automatically persisted locally
- Consider implementing cloud storage (AWS S3, Google Cloud Storage) for production

---

## 📞 Support

If you encounter any issues:

1. **Check the Troubleshooting section** above
2. **Open browser DevTools** (F12) and check Console for errors
3. **Verify all three components** are running:
   - ✅ Google Colab (last cell showing Ngrok URL)
   - ✅ Backend server (showing "MongoDB Connected")
   - ✅ Frontend (running on localhost:5173)
4. **Search existing issues** on GitHub
5. **Open a new issue** with:
   - Error messages (from browser console and terminal)
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

---

## 🙏 Acknowledgments

- **Projected GAN** team for the amazing GAN architecture
- **Google Colab** for providing free GPU resources
- **MongoDB Atlas** for cloud database hosting
- **Ngrok** for tunneling services
- All open-source contributors

---

## 🎓 Learning Resources

Want to learn more about the technologies used?

- **React**: [Official React Docs](https://react.dev/)
- **Tailwind CSS**: [Tailwind Documentation](https://tailwindcss.com/docs)
- **MongoDB**: [MongoDB University](https://university.mongodb.com/)
- **GANs**: [GAN Paper](https://arxiv.org/abs/1406.2661)
- **Projected GAN**: [Paper](https://arxiv.org/abs/2111.01007) | [GitHub](https://github.com/autonomousvision/projected_gan)

---

## 📊 Performance Tips

### For Faster Training

- Use smaller image resolutions (256x256 recommended)
- Start with draft mode to test
- Use larger batch sizes if GPU memory allows
- Upgrade to Google Colab Pro for better GPUs

### For Better Results

- Use consistent, high-quality images in your dataset
- Train for more iterations (production mode)
- Ensure dataset has variety but maintains consistent style
- Minimum 50-100 images recommended for good results

---

⭐ If you found this helpful, please star the repository!
