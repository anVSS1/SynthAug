# SynthAug - AI SaaS Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

This repository contains the complete source code for SynthAug, a premium AI SaaS platform for synthetic data generation using Generative Adversarial Networks (GANs).

## 🎯 Features

- **User Authentication** - Secure JWT-based authentication system
- **Project Management** - Create and manage multiple AI projects
- **AI-Powered Generation** - Synthetic data generation using Projected GANs
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

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas/register)
- **Google Colab Account** - [Access](https://colab.research.google.com/)
- **Ngrok Account** - [Sign up free](https://dashboard.ngrok.com/signup)

---

## 🚀 Complete Setup Guide - Start to Finish

> 📚 **Quick Reference:** See [STARTUP_CHECKLIST.md](STARTUP_CHECKLIST.md) for a detailed step-by-step checklist

The application consists of **three components** that must run simultaneously:

1. **AI Engine** (Google Colab + Ngrok)
2. **Backend Server** (Node.js + Express + MongoDB)
3. **Frontend Client** (React + Vite)

Follow these steps in order:

---

### STEP 1: Clone the Repository

```bash
git clone <your-repository-url>
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
   ```
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

### STEP 5: Set Up and Start the AI Engine (Google Colab)

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

### STEP 7: Access the Application

1. **Open your web browser** and go to: `http://localhost:5173`

2. **Create an account:**
   - Click **"Sign Up"**
   - Enter your email and password
   - Click **"Create Account"**

3. **You're in!** You should now see the Dashboard with the ability to create projects

> 💡 **Note:** The dashboard is accessible at both `http://localhost:5173/` and `http://localhost:5173/dashboard`

---

## 🎨 Using SynthAug

### Creating Your First Project

1. **Click "New Project"** on the dashboard
2. **Enter a project name** (e.g., "My First Dataset")
3. **Upload your dataset** as a ZIP file containing images
4. **Click "Create Project"**
5. Navigate to your project to start training

### Training the AI Model

1. **Open your project** from the dashboard
2. **Click "Upload Dataset"** and select your ZIP file
3. **Choose a training preset:**
   - **Draft Mode** - Fast training (50 iterations, ~5-10 minutes)
   - **Production Mode** - High quality (600 iterations, ~45-60 minutes)
4. **Click "Start Training"**
5. **Monitor progress** in real-time
6. **Download results** when complete

---

## 📁 Project Structure

```
SaaS GANs/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Route pages
│   │   │   ├── Auth.tsx      # Login/Register
│   │   │   ├── Dashboard.tsx # Main dashboard
│   │   │   ├── Studio.tsx    # Project workspace
│   │   │   └── Settings.tsx  # User settings
│   │   ├── services/         # API integration
│   │   ├── store/            # State management (Zustand)
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   └── vite.config.ts        # Vite configuration
│
├── server/                    # Backend application
│   ├── models/               # Database models
│   │   ├── User.js          # User authentication
│   │   ├── Project.js       # Project data
│   │   ├── Activity.js      # Activity logs
│   │   └── Notification.js  # Notifications
│   ├── routes/               # API endpoints
│   │   ├── auth.js          # Authentication routes
│   │   ├── projects.js      # Project CRUD
│   │   ├── proxy.js         # AI engine proxy
│   │   └── notifications.js # Notification routes
│   ├── middleware/           # Express middleware
│   │   └── auth.js          # JWT verification
│   ├── index.js              # Server entry point
│   ├── package.json
│   └── .env.example          # Environment template
│
├── colab_backend.ipynb        # AI training notebook
├── LICENSE
└── README.md                  # This file
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

- Generated images stored temporarily on Colab
- Download results before session expires
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

## 🎯 Roadmap

- [ ] Add support for custom resolutions
- [ ] Implement image preview in upload
- [ ] Add training progress graphs
- [ ] Support for video generation
- [ ] Batch project processing
- [ ] Cloud storage integration
- [ ] Admin dashboard
- [ ] Payment integration
- [ ] API access for developers
- [ ] Model export functionality

---

⭐ If you found this helpful, please star the repository!
