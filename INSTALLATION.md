# Gemini Chatbot Installation Guide

This guide will help you set up and run the Gemini AI Chatbot application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Google Gemini API key** (Get one from [Google AI Studio](https://makersuite.google.com/))

## Quick Start

### 1. Install Dependencies

From the root directory, install all dependencies:

```bash
# Install root dependencies
npm install

# Install server and client dependencies
npm run install:all
```

### 2. Environment Configuration

#### Server Configuration

1. Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` and add your configuration:
   ```env
   # Required - Get your API key from Google AI Studio
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # JWT Secret - Generate a secure random string
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   
   # Database (SQLite by default, PostgreSQL optional)
   DATABASE_URL=sqlite:./database.sqlite
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

#### Client Configuration

1. Copy the example environment file:
   ```bash
   cp client/.env.example client/.env
   ```

2. The default settings should work for local development:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

### 3. Start the Application

Run both the backend and frontend in development mode:

```bash
npm run dev
```

This will start:
- **Backend server** at http://localhost:5000
- **Frontend application** at http://localhost:3000

The application will automatically open in your browser.

## Manual Setup

If you prefer to run the servers separately:

### Backend Only
```bash
cd server
npm install
npm run dev
```

### Frontend Only
```bash
cd client
npm install
npm start
```

## Database Setup

The application uses SQLite by default, which requires no additional setup. The database file will be created automatically when you first run the server.

### PostgreSQL (Optional)

If you prefer PostgreSQL:

1. Install PostgreSQL on your system
2. Create a database for the application
3. Update the `DATABASE_URL` in `server/.env`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/gemini_chatbot
   ```

## API Key Setup

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one
4. Go to "Get API Key" and generate a new API key
5. Copy the API key and add it to your `server/.env` file

### Important Security Notes

- **Never commit your API key to version control**
- Use environment variables to store sensitive information
- Rotate your API keys regularly
- Set up proper rate limiting in production

## Available Scripts

### Root Directory
- `npm run dev` - Start both backend and frontend in development mode
- `npm run install:all` - Install dependencies for both backend and frontend
- `npm run build` - Build the frontend for production
- `npm start` - Start the backend in production mode

### Backend (`server/` directory)
- `npm run dev` - Start server with nodemon (auto-reload)
- `npm start` - Start server in production mode
- `npm test` - Run backend tests
- `npm run lint` - Check code style

### Frontend (`client/` directory)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run frontend tests
- `npm run type-check` - Check TypeScript types

## Features

### ✅ Implemented
- User authentication (register/login)
- Real-time messaging with WebSocket
- Gemini AI integration
- Conversation management
- Message history persistence
- Responsive design
- Theme support (light/dark mode)
- Mobile-friendly interface

### 🚧 Advanced Features (Ready to implement)
- File upload support
- Voice integration
- Multi-language support
- Custom bot personalities
- Analytics dashboard
- Conversation export
- Search functionality

## Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
# Clean install
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

**2. Database connection errors**
- Check if the database file path is writable
- For PostgreSQL, verify connection string and database existence

**3. API errors**
- Verify your Gemini API key is correct
- Check if the API key has proper permissions
- Monitor your API usage and limits

**4. WebSocket connection issues**
- Ensure both backend and frontend are running
- Check firewall settings
- Verify CORS configuration

### Getting Help

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure you have the required Node.js version
4. Check the GitHub issues for similar problems

## Production Deployment

For production deployment:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set production environment variables:
   ```bash
   NODE_ENV=production
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_secure_jwt_secret
   ```

3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name "gemini-chatbot"
   ```

4. Set up reverse proxy with Nginx or similar
5. Configure SSL certificates
6. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.