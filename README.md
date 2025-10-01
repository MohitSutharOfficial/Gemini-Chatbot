# Gemini AI Chatbot# Gemini API Chatbot



A production-ready, full-stack chatbot application powered by Google's Gemini AI API. Built with React, TypeScript, Material-UI, and Express.js.A fully functional chatbot application that integrates with Google's Gemini AI API to provide intelligent conversational experiences.



![Version](https://img.shields.io/badge/version-1.0.0-blue)## Features

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

![License](https://img.shields.io/badge/license-MIT-green)### Core Features

- Real-time text-based conversations

## ✨ Features- Message history persistence

- User session management

- 🤖 **Real-time AI Conversations** - Chat with Google's powerful Gemini AI model- Responsive chat interface

- 💬 **Clean UI** - Modern, responsive interface built with Material-UI- Typing indicators and message status

- ⚡ **Fast & Lightweight** - Optimized for production with minimal dependencies- Error handling and retry mechanisms

- 🔒 **Secure** - Environment-based configuration and CORS protection

- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices### Advanced Features

- 🎯 **Simple Setup** - Easy installation and deployment- Multi-turn conversations with context

- Conversation memory and history

## 🏗️ Tech Stack- User profiles and preferences

- Export chat functionality

### Frontend- Theme support (light/dark mode)

- **React 18** - Modern React with hooks- Mobile responsive design

- **TypeScript** - Type-safe development- File upload support

- **Material-UI (MUI)** - Beautiful, accessible components- Voice integration capabilities

- **Emotion** - CSS-in-JS styling- Multi-language support

- Custom bot personalities

### Backend

- **Node.js** - JavaScript runtime## Tech Stack

- **Express.js** - Fast, minimalist web framework

- **Google Generative AI** - Gemini AI integration### Backend

- **CORS** - Cross-origin resource sharing- Node.js with Express.js

- **dotenv** - Environment variable management- Socket.IO for real-time communication

- SQLite/PostgreSQL for data persistence

## 📋 Prerequisites- Google Gemini AI API integration

- JWT authentication

Before you begin, ensure you have:- Rate limiting and security middleware



- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)### Frontend

- **npm** (comes with Node.js)- React 18 with hooks

- **Google Gemini API Key** - [Get one here](https://makersuite.google.com/app/apikey)- Material-UI/Chakra UI for components

- Socket.IO client for real-time updates

## 🚀 Quick Start- Responsive design with CSS modules

- Progressive Web App (PWA) capabilities

### 1. Clone the Repository

## Quick Start

```bash

git clone https://github.com/MohitSutharOfficial/Gemini-Chatbot.git### Prerequisites

cd Gemini-Chatbot- Node.js 18+

```- NPM or Yarn

- Google Gemini API key

### 2. Install Dependencies

### Installation

```bash

# Install root dependencies1. Clone the repository:

npm install```bash

git clone <repository-url>

# Install server dependenciescd gemini-chatbot

cd server```

npm install

2. Install dependencies:

# Install client dependencies```bash

cd ../clientnpm run install:all

npm install```

cd ..

```3. Set up environment variables:

```bash

### 3. Configure Environment Variables# Copy environment templates

cp server/.env.example server/.env

#### Server Configurationcp client/.env.example client/.env



Create `server/.env` file:# Edit server/.env with your configuration

```

```bash

cd server4. Start the development servers:

cp .env.example .env```bash

```npm run dev

```

Edit `server/.env` and add your Gemini API key:

The application will be available at:

```env- Frontend: http://localhost:3000

PORT=5000- Backend API: http://localhost:5000

NODE_ENV=production

GEMINI_API_KEY=your_actual_gemini_api_key_here## Environment Configuration

CORS_ORIGIN=http://localhost:3000

```### Server (.env)

```

#### Client ConfigurationGEMINI_API_KEY=your_gemini_api_key_here

JWT_SECRET=your_jwt_secret_here

Create `client/.env` file:DATABASE_URL=your_database_url_here

PORT=5000

```bashNODE_ENV=development

cd ../clientCORS_ORIGIN=http://localhost:3000

cp .env.example .envRATE_LIMIT_WINDOW_MS=900000

```RATE_LIMIT_MAX_REQUESTS=100

```

The default values should work for local development:

### Client (.env)

```env```

REACT_APP_API_URL=http://localhost:5000REACT_APP_API_URL=http://localhost:5000

REACT_APP_APP_NAME=Gemini AI ChatbotREACT_APP_SOCKET_URL=http://localhost:5000

REACT_APP_VERSION=1.0.0```

```

## API Documentation

### 4. Get Your Gemini API Key

### Authentication

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)- `POST /api/auth/register` - Register new user

2. Sign in with your Google account- `POST /api/auth/login` - User login

3. Click **"Create API Key"**- `POST /api/auth/logout` - User logout

4. Copy the generated key- `GET /api/auth/me` - Get current user

5. Paste it into your `server/.env` file

### Conversations

### 5. Start the Application- `GET /api/conversations` - Get user conversations

- `POST /api/conversations` - Create new conversation

#### Development Mode (Recommended)- `GET /api/conversations/:id` - Get conversation details

- `DELETE /api/conversations/:id` - Delete conversation

Run both frontend and backend concurrently:

### Messages

```bash- `GET /api/conversations/:id/messages` - Get conversation messages

# From the root directory- `POST /api/conversations/:id/messages` - Send message

npm run dev- `PUT /api/messages/:id` - Update message

```- `DELETE /api/messages/:id` - Delete message



This will start:### Export

- 🖥️ Backend server on `http://localhost:5000`- `GET /api/conversations/:id/export` - Export conversation

- 🌐 Frontend app on `http://localhost:3000`

## Project Structure

#### Production Mode

```

Start servers separately:gemini-chatbot/

├── client/                 # React frontend

```bash│   ├── public/

# Terminal 1 - Start backend│   ├── src/

cd server│   │   ├── components/     # React components

npm start│   │   ├── pages/         # Page components

│   │   ├── hooks/         # Custom hooks

# Terminal 2 - Start frontend (in a new terminal)│   │   ├── services/      # API services

cd client│   │   ├── utils/         # Utility functions

npm start│   │   └── styles/        # CSS modules

```│   └── package.json

├── server/                # Node.js backend

### 6. Open the Application│   ├── controllers/       # Route controllers

│   ├── middleware/        # Express middleware

Open your browser and navigate to:│   ├── models/           # Database models

```│   ├── routes/           # API routes

http://localhost:3000│   ├── services/         # Business logic

```│   ├── utils/            # Utility functions

│   ├── config/           # Configuration files

Start chatting with Gemini AI! 🎉│   └── package.json

├── docs/                 # Documentation

## 📁 Project Structure└── package.json         # Root package.json

```

```

gemini-chatbot/## Security Features

├── client/                    # React frontend

│   ├── public/               # Static files- Input sanitization and validation

│   ├── src/- Rate limiting per user/IP

│   │   ├── components/- API key security with environment variables

│   │   │   ├── Chat/        # Chat components- HTTPS enforcement in production

│   │   │   │   └── ChatPage.tsx- CORS configuration

│   │   │   └── Layout/      # Layout components- SQL injection prevention

│   │   │       └── SimpleLayout.tsx- Authentication with JWT tokens

│   │   ├── App.tsx          # Main app component

│   │   └── index.tsx        # Entry point## Performance Optimizations

│   ├── .env                 # Environment variables (create from .env.example)

│   ├── .env.example         # Environment template- Response caching for common queries

│   ├── package.json         # Frontend dependencies- Database indexing for fast lookups

│   └── tsconfig.json        # TypeScript config- Lazy loading for message history

│- WebSocket connections for real-time updates

├── server/                   # Express backend- Compression middleware

│   ├── routes/- Optimized bundle sizes

│   │   └── index.js         # API routes

│   ├── services/## Contributing

│   │   └── geminiService.js # Gemini AI integration

│   ├── .env                 # Environment variables (create from .env.example)1. Fork the repository

│   ├── .env.example         # Environment template2. Create a feature branch

│   ├── index.js             # Server entry point3. Make your changes

│   └── package.json         # Backend dependencies4. Add tests if applicable

│5. Submit a pull request

├── .gitignore               # Git ignore rules

├── package.json             # Root package config## License

└── README.md               # This file

```This project is licensed under the MIT License - see the LICENSE file for details.



## 🔌 API Endpoints## Support



### Health CheckFor support, please open an issue on GitHub or contact the development team.
```
GET /api/health
```
Returns server status and configuration.

**Response:**
```json
{
  "status": "ok",
  "geminiConfigured": true,
  "timestamp": "2025-10-01T10:00:00.000Z"
}
```

### Chat
```
POST /api/chat
```
Send a message to Gemini AI and receive a response.

**Request Body:**
```json
{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing well, thank you for asking. How can I assist you today?"
}
```

## 🛠️ Available Scripts

### Root Directory

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server:dev` - Start backend with nodemon (auto-restart)
- `npm run client:dev` - Start frontend development server
- `npm run server:start` - Start backend in production mode
- `npm run client:build` - Build frontend for production
- `npm run build` - Build the entire application
- `npm run install:all` - Install all dependencies (root, server, client)

### Server Directory

- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-restart on changes)

### Client Directory

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm run serve` - Serve production build locally

## 🌐 Deployment

### Build for Production

```bash
# Build the frontend
cd client
npm run build

# The build folder will contain optimized static files
```

### Environment Variables for Production

Ensure you set these environment variables on your production server:

**Backend:**
- `NODE_ENV=production`
- `PORT=5000` (or your preferred port)
- `GEMINI_API_KEY=your_actual_key`
- `CORS_ORIGIN=https://your-frontend-domain.com`

**Frontend:**
- `REACT_APP_API_URL=https://your-backend-domain.com`

### Deployment Platforms

This app can be deployed to:
- **Frontend**: Vercel, Netlify, GitHub Pages, AWS S3
- **Backend**: Heroku, Railway, Render, AWS EC2, DigitalOcean

## 🔧 Configuration

### Changing the AI Model

Edit `server/services/geminiService.js`:

```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
// Available models: 'gemini-pro', 'gemini-pro-vision'
```

### Customizing CORS

Edit `server/index.js`:

```javascript
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
};
```

### Customizing UI Theme

Edit Material-UI theme in `client/src/App.tsx` or create a theme file.

## 🐛 Troubleshooting

### Issue: "API key not valid"
**Solution:** 
- Verify your API key is correct in `server/.env`
- Make sure there are no extra spaces or quotes
- Get a new key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Issue: "Cannot connect to backend"
**Solution:**
- Ensure backend server is running on port 5000
- Check `client/.env` has correct `REACT_APP_API_URL`
- Verify CORS settings in `server/index.js`

### Issue: Port already in use
**Solution:**
```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
killall node
```

### Issue: Module not found errors
**Solution:**
```bash
# Reinstall dependencies
cd server && npm install
cd ../client && npm install
```

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Mohit Suthar**
- GitHub: [@MohitSutharOfficial](https://github.com/MohitSutharOfficial)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

## 📞 Support

If you need help or have questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an issue on GitHub
3. Review the [Google Gemini AI documentation](https://ai.google.dev/docs)

---

**Built with ❤️ using Google's Gemini AI**
