# TibaNode - Health Information Management System

![TibaNode](./client/public/logo.png)

TibaNode is a comprehensive health information system designed to streamline the management of clients and health programs. This solution allows healthcare providers to efficiently track patient enrollments across multiple health programs while maintaining data security and accessibility.

## 🌟 Key Features

- **Program Management**: Create and manage health programs (TB, Malaria, HIV, etc.)
- **Client Registration**: Register and maintain patient information
- **Program Enrollment**: Enroll clients in multiple health programs
- **Advanced Search**: Quickly find clients by name, number, or other attributes
- **Client Profiling**: View comprehensive client information including enrollment history
- **RESTful API**: Secure access to client data for interoperability with other systems
- **Responsive UI**: Intuitive interface that works across desktop and mobile devices

## 🏗️ Architecture

TibaNode employs a modern client-server architecture:

### Backend
- **Django REST Framework**: Robust API development with built-in authentication
- **SQLite Database** (development)
- **PostgreSQL** (production): Efficient data storage
- **Token-based Authentication**: Secure API access

### Frontend
- **React**: Component-based UI built with TypeScript for type safety
- **Tailwind CSS**: Responsive and clean design system
- **React Router**: Seamless navigation between system components

## 🚀 Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/TibaNode.git
cd TibaNode

# Create and activate virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Load sample data (optional)
python manage.py loaddata loaddata.json

# Run development server
python manage.py runserver
```

# Visit Api

Visit [http://127.0.0.1:8000](http://127.0.0.1:8000) to access the application.

# Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run development server
npm run dev

```

# Visit Application

Visit [http://localhost:5173](http://localhost:5173) to access the application.

---

# 🔒 Security Considerations

TibaNode prioritizes the security and privacy of patient data:

- **JWT Authentication**: Secure token-based authentication for API requests
- **Role-Based Access Control**: Different permission levels for various user types
- **Input Validation**: Thorough client and server-side validation
- **Data Encryption**: Sensitive data encrypted at rest
- **Audit Logging**: Comprehensive logging of all data access and modifications
- **HTTPS**: Enforced secure connections for all API communications
- **CSRF Protection**: Prevention of cross-site request forgery attacks

---

# 📚 API Documentation

The API follows RESTful principles and provides endpoints for all system functionalities.
Documentation is available via **Swagger UI** at `/redoc/` when the server is running.

## Key Endpoints

| Endpoint | Method | Description |
|:---------|:------:|:------------|
| `/api/healthprograms/` | GET | List all health programs |
| `/api/healthprograms/` | POST | Create a new health program |
| `/api/clients/` | GET | List all clients |
| `/api/clients/` | POST | Register a new client |
| `/api/clients/{id}/` | GET | View client details |

---

# 📊 Testing

TibaNode includes comprehensive test coverage for both frontend and backend components.

## Backend Tests

```bash
# Run backend tests
python manage.py test
```

# 🔄 Continuous Integration

The project is configured with **GitHub Actions** for continuous integration:

- Automated testing on pull requests
- Code quality checks

---

# 👥 Users

- **Doctors**: Client, Program management and program enrollment
- **API Consumers**: External systems with access

---

# 📄 License

This project is licensed under the **MIT License** – see the LICENSE file for details.
