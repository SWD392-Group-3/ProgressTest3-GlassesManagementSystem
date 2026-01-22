# Glasses Management System

## 📋 Introduction

The Glasses Management System is a full-stack web application built to manage a glasses store, including product management, customer management, order management, and other business activities. The project is developed with a 3-layer architecture to ensure maintainability and scalability.

## ✨ Features

- 🛍️ Glasses product management
- 👥 Customer management
- 📦 Order management
- 📊 Reports and statistics
- 🔐 User authentication and authorization
- 💻 Modern and user-friendly interface

## 🛠️ Technology Stack

### Backend
- **.NET 9.0** - Main framework
- **ASP.NET Core Web API** - RESTful API development
- **C#** - Programming language
- **OpenAPI/Swagger** - API documentation

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### Architecture
- **3-Layer Architecture**:
  - Data Access Layer (DAL)
  - Business Logic Layer (BLL)
  - Presentation Layer (API)

## 📁 Project Structure

```
ProgressTest3-GlassesManagementSystem/
├── backend/                          # Backend API
│   ├── BusinessLogicLayer/          # Business logic layer
│   ├── DataAccessLayer/             # Data access layer
│   └── GlassesManagementSystem/     # Main API project
│       ├── Controllers/             # API Controllers
│       ├── Program.cs               # Entry point
│       └── appsettings.json         # Configuration
│
└── frontend/                         # Frontend application
    ├── app/                         # Next.js app directory
    │   ├── page.tsx                 # Home page
    │   ├── layout.tsx               # Main layout
    │   └── globals.css              # Global CSS
    ├── public/                      # Static files
    └── package.json                 # Dependencies
```

## 📦 System Requirements

### Backend
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- Visual Studio 2022 or Visual Studio Code
- SQL Server (optional, if using database)

### Frontend
- [Node.js](https://nodejs.org/) (version 20.9 or higher)
- npm or yarn

## 🚀 Installation Guide

### 1. Clone repository

```bash
git clone git@github.com:SWD392-Group-3/ProgressTest3-GlassesManagementSystem.git
cd ProgressTest3-GlassesManagementSystem
```

### 2. Install Backend

```bash
cd backend
```

Open the solution file `backend.sln` in Visual Studio or run:

```bash
dotnet restore
```

### 3. Install Frontend

Open a new terminal and run:

```bash
cd frontend
npm install
```

## ▶️ Running the Application

### Run Backend API

1. Open a terminal in the `backend` directory
2. Run the command:

```bash
cd GlassesManagementSystem
dotnet run
```

The API will run at: `https://localhost:5001` or `http://localhost:5000`

To view API documentation (Swagger), visit: `https://localhost:5001/swagger` (in Development environment)

### Run Frontend

1. Open a new terminal in the `frontend` directory
2. Run the command:

```bash
npm run dev
```

The application will run at: `http://localhost:3000`

## 📖 Usage Guide

### Backend API

1. **Start API Server**
   - Run `dotnet run` in the `GlassesManagementSystem` directory
   - The API will automatically open in the browser or access the displayed URL

2. **View API Documentation**
   - In Development environment, visit `/swagger` to view and test endpoints
   - Swagger UI allows you to view all API endpoints and test them directly

3. **Use the API**
   - Send HTTP requests to the endpoints
   - Use methods: GET, POST, PUT, DELETE
   - The API returns data in JSON format

### Frontend

1. **Start Development Server**
   - Run `npm run dev` in the `frontend` directory
   - The application will automatically open at `http://localhost:3000`

2. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

3. **Lint code**
   ```bash
   npm run lint
   ```

## 🔧 Configuration

### Backend Configuration

Edit `appsettings.json` or `appsettings.Development.json` to configure:
- Connection strings
- Logging
- CORS settings
- Authentication settings

### Frontend Configuration

Edit `next.config.ts` to configure:
- API endpoints
- Environment variables
- Build settings

## 📝 Available Scripts

### Backend
- `dotnet build` - Build project
- `dotnet run` - Run application
- `dotnet test` - Run tests (if available)

### Frontend
- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Check code for errors

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is developed for educational and commercial purposes.

## 👥 Authors

- **Your Name** - *Initial work*

## 📞 Contact

If you have any questions or suggestions, please create an issue in the repository.

---

**Note**: This is a project under development. Some features may not be complete yet.
