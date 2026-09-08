# OrderFlow — Backend

> Production-oriented REST API and real-time backend for the OrderFlow order management platform.

This repository contains the backend services powering **OrderFlow**, a full-stack business operations platform for managing orders, customers, employees, authentication, authorization, analytics, and operational workflows.

The backend is built with **Node.js, Express, TypeScript, MongoDB, Mongoose, and Socket.IO**.

### 🔗 Project Links

* **Frontend:** https://github.com/poochix/orderFlow-frontend
* **Backend:** https://github.com/poochix/OrderFlow-backend
* **Live Application:** https://order-flow-frontend-omega.vercel.app/

-------------------------------------------------------------------

LOGIN DETAILS

Admin email : admin@orderflow.com 

Admin password : AdminPassword123!

Staff email : test@email.com 

Staff password : 123456

-----------------------------------------------------------------

## ✨ Core Features

### 🔐 Authentication

* JWT-based authentication
* Secure authentication middleware
* HTTP-only cookie-based authentication
* User session validation
* Account status checks
* Protected API endpoints

### 🛡️ Role-Based Access Control

OrderFlow uses role-based authorization to control access to protected operations.

Supported application roles include:

```text
Admin
Manager
Staff
```

Authorization is handled independently from authentication so that identity verification and permission enforcement remain separate responsibilities.

```text
Request
   │
   ▼
Authentication
   │
   ▼
Authenticated User
   │
   ▼
Role Authorization
   │
   ├── Allowed ──► Controller
   │
   └── Denied ───► 403 Forbidden
```

---

## 📦 Order Management

The backend provides business logic for the order lifecycle, including:

* Order creation
* Order retrieval
* Order updates
* Order status transitions
* Employee assignment
* Customer relationships
* Operational history
* Audit logging

---

## 👥 User & Customer Management

The API supports management of application users and customers while enforcing role-specific permissions.

User-related operations include:

* User creation
* User retrieval
* User updates
* Role management
* Account status handling
* Customer relationships

---

## ⚡ Real-Time Communication

OrderFlow uses **Socket.IO** alongside the Express API.

```text
                    OrderFlow Backend
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
        REST API                    Socket.IO
             │                           │
             ▼                           ▼
       Business Logic             Real-Time Events
             │                           │
             └─────────────┬─────────────┘
                           ▼
                       Frontend
```

This allows connected clients to receive important operational updates without relying entirely on polling or manual page refreshes.

---

## 📝 Audit Logging

Business operations can be recorded through an audit-log system.

This provides a foundation for:

* Operational traceability
* User accountability
* Status-change history
* Debugging
* Business activity history

---

## 🧱 Backend Architecture

The backend follows a layered architecture designed to separate HTTP concerns from business logic and data access.

```text
                    HTTP Request
                         │
                         ▼
                      Routes
                         │
                         ▼
                     Middleware
                ┌────────┼────────┐
                │        │        │
                ▼        ▼        ▼
              Auth     RBAC    Validation
                │        │        │
                └────────┼────────┘
                         ▼
                    Controllers
                         │
                         ▼
                      Services
                         │
                         ▼
                     Mongoose
                         │
                         ▼
                      MongoDB
```

### Project Structure

```text
src/
├── config/          # Application configuration
├── controllers/     # HTTP request handlers
├── middleware/      # Authentication, authorization, etc.
├── models/          # Mongoose data models
├── routes/          # API route definitions
├── services/        # Business logic
├── validators/      # Request validation
└── ...
```

The separation between controllers and services keeps HTTP handling separate from core business logic and makes the application easier to test and maintain.

---

## 🧪 Testing

The backend uses **Jest** and **Supertest** for automated API testing.

Testing focuses on important application behavior such as:

* API endpoints
* Authentication behavior
* Authorization behavior
* Business logic
* HTTP responses
* Error conditions

Run tests with:

```bash
npm test
```

---

## 🐳 Docker

The backend includes Docker support for creating a consistent application runtime.

Build the image:

```bash
docker build -t orderflow-backend .
```

Run the container:

```bash
docker run -p 5000:5000 orderflow-backend
```

Environment variables should be supplied according to the application's configuration.

---

## 🔄 CI

The repository includes GitHub Actions workflows for automated development checks.

```text
Git Push / Pull Request
          │
          ▼
     GitHub Actions
          │
          ├── Install dependencies
          ├── Build / TypeScript checks
          └── Automated tests
```

---

## 🛠️ Tech Stack

| Technology     | Purpose                 |
| -------------- | ----------------------- |
| Node.js        | Runtime                 |
| Express        | HTTP API                |
| TypeScript     | Type safety             |
| MongoDB        | Database                |
| Mongoose       | ODM                     |
| JWT            | Authentication          |
| Zod            | Validation              |
| Socket.IO      | Real-time communication |
| Jest           | Testing                 |
| Supertest      | API testing             |
| Docker         | Containerization        |
| GitHub Actions | CI                      |

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/poochix/OrderFlow-backend.git

cd OrderFlow-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file containing the required application configuration.

> Never commit real credentials, secrets, JWT keys, database passwords, or API keys.

### 4. Start development server

```bash
npm run dev
```

### 5. Run tests

```bash
npm test
```

---

## 🔗 Frontend

The frontend is maintained as a separate repository:

https://github.com/poochix/orderFlow-frontend

Together, the repositories form the complete OrderFlow application:

```text
┌─────────────────────────────┐
│     OrderFlow Frontend      │
│ React + TypeScript + Redux  │
└──────────────┬──────────────┘
               │
          HTTP / WebSocket
               │
               ▼
┌─────────────────────────────┐
│      OrderFlow Backend      │
│ Express + TypeScript        │
│ Socket.IO + Mongoose        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          MongoDB            │
└─────────────────────────────┘
```

---

## 🎯 Engineering Principles

The backend was developed with emphasis on:

* Separation of concerns
* Type safety
* Secure authentication
* Role-based authorization
* Input validation
* Centralized error handling
* Testability
* Real-time communication
* Maintainable business logic
* Production-oriented architecture

---

## 👨‍💻 Author

**Hritik Dubey**

Full-Stack Developer

---

## 📄 License

This project is intended as a portfolio and learning project.
