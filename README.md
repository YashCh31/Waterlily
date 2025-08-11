# Waterlily 🌸

A secure, multi-page questionnaire application built with React and Node.js, featuring JWT-based authentication and responsive design.

## 🚀 Features

### Authentication
- **JWT Token-based Authentication** with 24-hour expiration
- **User Registration & Login** with secure password hashing (bcrypt)
- **Protected Routes** requiring authentication
- **Session Persistence** using localStorage
- **Automatic Token Verification** on app startup

### Questionnaire System
- **Multi-page Form** with field-based pagination
- **Selective Validation** - Personal Information fields are mandatory, others optional
- **Real-time Validation** with user-friendly error messages
- **Progress Tracking** with visual indicators
- **Responsive Design** for mobile and desktop

### Data Management
- **Secure Form Submission** with JWT authorization
- **PostgreSQL Database** for reliable data storage
- **User-specific Data Access** - users can only view their own responses
- **Grouped Results Display** organized by field categories

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Custom CSS** with responsive design
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YashCh31/Waterlily.git
cd Waterlily
```

### 2. Database Setup
1. Create a PostgreSQL database named `waterlily`
2. Update database credentials in `index.js`:
```javascript
const client = new Client({
  user: 'your_username',
  host: 'localhost',
  database: 'waterlily',
  password: 'your_password',
  port: 5432,
});
```

### 3. Backend Setup
```bash
# Install backend dependencies
npm install

# Start the backend server
node index.js
```
The backend server will run on `http://localhost:5001`

### 4. Frontend Setup
```bash
# Navigate to frontend directory
cd forms

# Install frontend dependencies
npm install

# Start the React development server
npm start
```
The frontend will run on `http://localhost:3000`

## 🗄️ Database Schema

The application uses the following main tables:

### auth_users
- `id` (Primary Key)
- `username` (Unique)
- `password_hash`
- `created_at`

### questions
- `id` (Primary Key)
- `title`
- `text`
- `description`
- `input_type` (text, email, tel, number, textarea)
- `field` (Personal Information, Professional Details, etc.)
- `created_at`

### responses
- `id` (Primary Key)
- `user_id` (Foreign Key → auth_users.id)
- `question_id` (Foreign Key → questions.id)
- `answer`
- `created_at`

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/verify` - Token verification (protected)

### Questions & Responses
- `GET /questions` - Fetch all questions (protected)
- `POST /user-answers` - Submit form responses (protected)
- `GET /user-answers/:userId` - Get user's responses (protected)

## 🎨 Application Flow

1. **Landing Page** - Users are redirected to login if not authenticated
2. **Authentication** - Login or register to access the application
3. **Multi-page Questionnaire** - Navigate through different field categories
4. **Form Validation** - Real-time validation with mandatory Personal Information
5. **Secure Submission** - Form data submitted with JWT authentication
6. **Results Display** - View submitted responses grouped by categories

## 🔒 Security Features

- **Password Hashing** using bcrypt with salt rounds
- **JWT Tokens** for stateless authentication
- **Protected API Routes** requiring valid tokens
- **User Data Isolation** - users can only access their own data
- **Input Validation** on both frontend and backend
- **CORS Configuration** for secure cross-origin requests

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach** with breakpoints at 768px
- **Flexible layouts** that adapt to different screen sizes
- **Touch-friendly buttons** and form elements
- **Optimized typography** for readability across devices

## 🚀 Production Deployment

### Environment Variables
Create a `.env` file for production:
```env
JWT_SECRET=your-super-secret-jwt-key
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=waterlily
PORT=5001
```

### Security Considerations
- Change the JWT secret key in production
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Add HTTPS in production
- Regular security updates for dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Yashwanth Chandolu** - [@YashCh31](https://github.com/YashCh31)

## 🙏 Acknowledgments

- React community for excellent documentation
- Express.js for the robust backend framework
- PostgreSQL for reliable data storage
- JWT community for authentication standards

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/YashCh31/Waterlily/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

Happy coding! 🌸
