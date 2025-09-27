# Gemini API Chatbot

A fully functional chatbot application that integrates with Google's Gemini AI API to provide intelligent conversational experiences.

## Features

### Core Features
- Real-time text-based conversations
- Message history persistence
- User session management
- Responsive chat interface
- Typing indicators and message status
- Error handling and retry mechanisms

### Advanced Features
- Multi-turn conversations with context
- Conversation memory and history
- User profiles and preferences
- Export chat functionality
- Theme support (light/dark mode)
- Mobile responsive design
- File upload support
- Voice integration capabilities
- Multi-language support
- Custom bot personalities

## Tech Stack

### Backend
- Node.js with Express.js
- Socket.IO for real-time communication
- SQLite/PostgreSQL for data persistence
- Google Gemini AI API integration
- JWT authentication
- Rate limiting and security middleware

### Frontend
- React 18 with hooks
- Material-UI/Chakra UI for components
- Socket.IO client for real-time updates
- Responsive design with CSS modules
- Progressive Web App (PWA) capabilities

## Quick Start

### Prerequisites
- Node.js 18+
- NPM or Yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-chatbot
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Copy environment templates
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit server/.env with your configuration
```

4. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Configuration

### Server (.env)
```
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_database_url_here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Conversations
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/conversations/:id/messages` - Send message
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

### Export
- `GET /api/conversations/:id/export` - Export conversation

## Project Structure

```
gemini-chatbot/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS modules
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── package.json
├── docs/                 # Documentation
└── package.json         # Root package.json
```

## Security Features

- Input sanitization and validation
- Rate limiting per user/IP
- API key security with environment variables
- HTTPS enforcement in production
- CORS configuration
- SQL injection prevention
- Authentication with JWT tokens

## Performance Optimizations

- Response caching for common queries
- Database indexing for fast lookups
- Lazy loading for message history
- WebSocket connections for real-time updates
- Compression middleware
- Optimized bundle sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.