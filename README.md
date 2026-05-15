# 📊 AnalytixExcel:MERN Stack Data Visualization Platform

**AnalytixExcel** is a full-stack web application built with the MERN (MongoDB, Express.js, React, Node.js) stack. It empowers users to upload their Excel files, instantly generate a wide variety of interactive 2D and 3D charts, and gain insights into their data through an integrated AI assistant. The platform is designed for collaboration and security, featuring a robust role-based authentication system.

---

## ✨ Key Features

*   🔒 **Secure User Authentication:** Complete registration and login system with JWT-based authentication.
*   🛡️ **Role-Based Access Control:** Three distinct user roles (User, Admin, and Superadmin) with granular permissions for managing users and files.
*   📈 **Dynamic Data Visualization:** Upload Excel/CSV files and generate a wide array of charts:
    *   **2D Charts:** Bar, Line, Pie, Doughnut, Polar Area, and more.
    *   **3D Charts:** Interactive and rotatable Scatter Plots, Bar Charts, and Surface Plots.
*   🤖 **AI-Powered Data Assistant:** A floating AI chat assistant (powered by the Gemini API) that can answer natural language questions about the contents of the uploaded file.
*   🎛️ **Comprehensive Admin Panel:** A dashboard for Admins and Superadmins to manage users, approve new admins, and moderate uploaded files based on their permissions.
*   📊 **Personalized User Dashboard:** Each user gets a dashboard with real-time statistics, such as lifetime file uploads, recently deleted files, and a list of their recent uploads.
*   ⚙️ **Full Profile & File Management:** Users can manage their own uploaded files, update their profile information (name and avatar), and deactivate or permanently delete their accounts.

---

## 🛠️ Tech Stack

### Frontend
*   **React:** For building the user interface.
*   **React Router:** For client-side routing.
*   **Axios:** For making API requests to the backend.
*   **Chart.js:** For creating 2D charts.
*   **Three.js & React Three Fiber:** For rendering interactive 3D charts.
*   **jsPDF:** For exporting charts as PDF files.

### Backend
*   **Node.js & Express.js:** For the server and REST API.
*   **MongoDB:** As the database for storing user and file data.
*   **Mongoose:** As the ODM for interacting with MongoDB.
*   **JSON Web Tokens (JWT):** For secure user authentication.
*   **Multer:** For handling file uploads.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
Before you begin, ensure you have the following installed:
*   [Node.js and npm](https://nodejs.org/)
*   [MongoDB](https://www.mongodb.com/) (either a local instance or a cloud MongoDB Atlas cluster)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server

2. Install dependencies: npm install

3. Create a .env file and add your MONGO_URI and JWT_SECRET.

4. Start the server:
   ```bash
   node server.js
### Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client

2. Install dependencies: npm install

3. Start the React app:
   ```bash
   npm start

4. The application will be running at http://localhost:3000.
