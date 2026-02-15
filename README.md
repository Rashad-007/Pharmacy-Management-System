# 🏥 Smart Pharmacy Intelligence System (SPIS)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> AI-Powered Pharmacy Management Platform combining full-stack development with predictive analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL 8.0
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/SPIS.git
cd SPIS
```

2. **Set up Database**
```bash
mysql -u root -p
CREATE DATABASE pharmacy_db;
USE pharmacy_db;
SOURCE database/schema.sql;
```

3. **Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

4. **Set up Frontend**
```bash
cd frontend
npm install
npm run dev
```

5. **Set up ML Service (Optional)**
```bash
cd ml_service
pip install -r requirements.txt
python src/api.py
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8001

### Default Login
- Email: `admin@spis.com`
- Password: `admin123`

## 📦 Project Structure

```
SPIS/
├── frontend/          # React application
├── backend/           # Node.js API server
├── ml_service/        # Python ML microservice
├── database/          # SQL schema and migrations
└── docs/              # Documentation
```

## ✨ Features

- 🔐 JWT Authentication with RBAC
- 📦 Inventory Management
- 💳 Billing & Sales
- 📊 Analytics Dashboard
- 🤖 AI-Powered Predictions
  - Demand Forecasting
  - Expiry Risk Analysis
  - Auto-Reorder Optimization

## 🛠️ Tech Stack

**Frontend:** React, Material-UI, Vite  
**Backend:** Node.js, Express, MySQL  
**ML Service:** Python, FastAPI, Scikit-learn, Prophet  

## 📖 Documentation

See the `docs/` folder for detailed documentation:
- [System Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [User Guide](docs/USER_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**  
B.Tech AI & Data Science  
[GitHub](https://github.com/yourusername) | [LinkedIn](https://linkedin.com/in/yourprofile)

---

**Built with ❤️ for the pharmaceutical industry**
