# SynthAug - AI SaaS Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

This repository contains the complete source code for SynthAug, a premium AI SaaS platform for synthetic data generation.

## Features

- **User Authentication** - Secure JWT-based authentication system
- **Project Management** - Create and manage multiple AI projects
- **AI-Powered Generation** - Synthetic data generation using GANs
- **Real-time Progress** - Live updates on training progress
- **Modern UI** - Beautiful, responsive interface built with React & Tailwind CSS
- **Notifications** - Stay informed about project status
- **Activity Tracking** - Monitor your project history and statistics
- **Security** - Rate limiting, helmet.js, input validation

## Tech Stack

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

- **Google Colab** - Training environment
- **Ngrok** - Tunneling service
- **PyTorch** - Deep learning framework
- **Projected GAN** - GAN architecture

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (which includes npm)
- A [MongoDB](https://www.mongodb.com/) account (and your connection string)
- A [Google Colab](https://colab.research.google.com/) account
- An [Ngrok](https://ngrok.com/) account and authentication token

---

## How to Run the Application

The application is split into three parts that must be run simultaneously:

1.  **AI Engine** (Google Colab + Ngrok)
2.  **Backend Server** (Node.js + Express)
3.  **Frontend Client** (React + Vite)

### 1. AI Engine Setup (Google Colab)

This is the worker that performs the AI tasks. It runs in a Google Colab notebook and is exposed to the internet via Ngrok.

1.  **Open the Notebook:** Upload the `colab_backend.ipynb` file from the root of this project to your Google Colab environment.

2.  **Configure Ngrok:**

    - Inside the notebook, find the cell for Ngrok authentication.
    - Replace `'YOUR_NGROK_AUTH_TOKEN'` with your actual token from the [Ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken).

3.  **Run the Notebook:** Execute all the cells in the notebook. At the end, it will output a public URL (e.g., `https://xxxx-xxxx-xxxx.ngrok-free.app`). **Copy this URL.**

### 2. Backend Server Setup

This is the "manager" that handles users, projects, and communication with the AI engine.

1.  **Navigate to the Server Directory:**

    ```bash
    cd server
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    - In the `server` directory, copy the `.env.example` file to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Edit the `.env` file and configure the following:
      - **`MONGO_URI`**: Replace with your actual MongoDB connection string from [MongoDB Atlas](https://www.mongodb.com/)
      - **`JWT_SECRET`**: Replace with a long, random, and secret string for signing tokens (you can generate one with: `openssl rand -base64 32`)
      - **`AI_ENGINE_URL`**: Paste the public URL you copied from Google Colab in the previous step
      - **`PORT`**: The port for the backend server (default: 5000)

4.  **Start the Server:**
    ```bash
    npm start
    ```
    The backend server will now be running on `http://localhost:5000`.

### 3. Frontend Client Setup

This is the user interface that you interact with in the browser.

1.  **Navigate to the Client Directory:**

    ```bash
    cd client
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The frontend will now be running on `http://localhost:5173` (or the next available port).

---

## Accessing the Application

Once all three parts are running, open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`). You can now register an account and start using SynthAug.

---

## Project Structure

```
SaaS GANs/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API integration
│   │   └── store/            # State management
│   └── vite.config.ts        # Vite configuration
│
├── server/                    # Backend application
│   ├── models/               # Database models
│   ├── routes/               # API endpoints
│   ├── middleware/           # Express middleware
│   ├── index.js              # Server entry point
│   └── .env.example          # Environment variables template
│
├── colab_backend.ipynb        # AI training notebook
└── README.md                  # This file
```

## 🔒 Security Considerations

- All environment variables are excluded from version control
- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- R limiting on API endpoints
- CORS configuration for production
- Input validation and sanitization
- Security headers with Helmet.js

**Important:** Never commit your `.env` file or expose sensitive credentials.

## Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)

1. Set environment variables on your hosting platform
2. Ensure `NODE_ENV=production`
3. Set `FRONTEND_URL` to your deployed frontend URL
4. Deploy from your repository

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables if needed

### AI Engine

The AI engine runs on Google Colab with Ngrok. For production:

- Consider using a dedicated GPU server
- Use a stable public URL (not Ngrok)
- Implement proper authentication and rate limiting

## Contributing

We welcome contributions!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Known Issues

- Ngrok URL expires and needs to be updated periodically
- Google Colab may disconnect after extended inactivity
- Free MongoDB Atlas tier has connection limits

## Support

If you encounter any issues, search existing [GitHub issues](https://github.com/anVSS1/SynthAug/issues) or open a new one.

## Acknowledgments

- Google Colab for providing free GPU resources
- MongoDB Atlas for database hosting
- Ngrok for tunneling services
