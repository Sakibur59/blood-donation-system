# 🩸 BloodLink - Blood Donation Management System

**BloodLink** is a modern, full-stack Blood Donation Management System designed to connect blood donors, hospitals, and patients in need. With real-time communication, role-based access control, and a responsive user interface, BloodLink makes blood donation coordination faster, easier, and more efficient.

The platform aims to help save lives by connecting people who need blood with donors and blood banks that can provide it.

## ✨ Key Features

### 🎭 Role-Based Authentication & Dashboards

BloodLink provides a personalized dashboard for each user role.

- **🩸 Donor**
  - View available blood requests.
  - Find donation opportunities based on blood group.
  - Track donation history.
  - Receive real-time notifications.
  - Chat with hospitals.

- **🏥 Hospital**
  - Create urgent blood requests.
  - Search for donors by blood group.
  - Manage blood requests.
  - Receive notifications when donors respond.
  - Communicate with donors through live chat.

- **👑 Admin**
  - Manage registered users.
  - Add and manage blood banks.
  - Monitor blood requests and donations.
  - View platform statistics.
  - Oversee blood bank inventory.

### 🚀 Real-Time Features with Socket.io

- **Instant Notifications:** Receive real-time alerts when matching blood requests are created or fulfilled.
- **Live Chat:** Enable instant communication between donors and hospitals.
- **Typing Indicators:** See when another user is typing.
- **Live Dashboard Updates:** Automatically update relevant statistics when requests or donations change.

### 🏦 Blood Bank Management

- Add and manage blood banks through the admin dashboard.
- Track blood inventory by blood group, including A+, A-, B+, B-, AB+, AB-, O+, and O-.
- Allow donors to check blood availability before visiting a blood bank.
- Keep blood stock information updated through the management system.

### 🎨 Modern UI/UX

- Responsive design for desktop, tablet, and mobile devices.
- Modern blood-themed gradients and animations.
- Smooth transitions powered by Framer Motion.
- Toast notifications for user actions.
- Custom animated confirmation modals.
- Skeleton loaders and loading spinners.
- Role-specific dashboard sidebars:
  - 🔴 Donor: Red theme
  - 🔵 Hospital: Blue theme
  - 🟣 Admin: Purple theme

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 15+ | React framework and App Router |
| JavaScript / JSX | Application development |
| Tailwind CSS v4.1 | Styling and responsive UI |
| React Context API | Global authentication and socket state |
| Axios | HTTP requests |
| React Icons | Icons |
| Framer Motion | Animations |
| Socket.io Client | Real-time communication |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API and server |
| MongoDB | Database |
| MongoDB Native Driver | Database operations without Mongoose |
| JSON Web Token (JWT) | Authentication |
| bcryptjs | Password hashing |
| Socket.io | Real-time notifications and chat |
| Multer | File upload handling |
| ImgBB API | Profile image hosting |

## 📂 Project Structure

```text
blood-donation-system/
├── backend/
│   ├── index.js              # Express server, API routes & Socket.io
│   ├── package.json
│   └── .env                  # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── (auth)/       # Login and registration pages
│   │       ├── admin/        # Admin dashboard and management
│   │       ├── donor/        # Donor dashboard and donation features
│   │       ├── hospital/     # Hospital dashboard and blood requests
│   │       ├── messages/     # Messaging and chat
│   │       ├── profile/      # Profile settings
│   │       ├── components/   # Reusable UI components
│   │       ├── context/      # AuthContext and SocketContext
│   │       ├── globals.css   # Global styles
│   │       ├── layout.js     # Root layout
│   │       └── page.js       # Landing page
│   ├── package.json
│   └── .env.local            # Frontend environment variables
│
└── README.md
```

## ⚙️ Prerequisites

Before running the project, make sure you have installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a MongoDB Atlas account
- npm (included with Node.js)
- Git

An ImgBB API key is required if you want to use ImgBB for profile image uploads.

## 🚀 Installation & Setup

### Step 1: Clone the Repository

Replace `your-username` with your GitHub username or use your actual repository URL.

```bash
git clone https://github.com/Sakibur59/blood-donation-system.git
cd blood-donation-system
```

### Step 2: Configure the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory and add the following configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=blood_donation
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
IMGBB_API_KEY=your_imgbb_api_key_here
```

**Environment variable details:**

- `PORT`: Port on which the backend server runs.
- `MONGODB_URI`: MongoDB connection URI.
- `DB_NAME`: Name of the database.
- `JWT_SECRET`: Secret key used to sign JWTs.
- `JWT_EXPIRE`: JWT expiration duration.
- `IMGBB_API_KEY`: API key for ImgBB image uploads.

Get your free ImgBB API key from [ImgBB](https://api.imgbb.com/).

Start the backend server:

```bash
npm run dev
```

The backend should run at:

`http://localhost:5000`

### Step 3: Configure the Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend should run at:

`http://localhost:3000`

### Step 4: Open the Application

Visit the following URL in your browser:

**[http://localhost:3000](http://localhost:3000)**

Make sure MongoDB is running and the backend has successfully connected to the database.



New users can register through the application as donors or hospitals.

## 🔄 How It Works

The following workflow illustrates how BloodLink coordinates emergency blood requests.

1. **Hospital Creates a Request:** A hospital logs in and creates an emergency blood request, such as two units of O+ blood.
2. **Request Matching:** The backend identifies registered donors with the matching blood group and checks relevant blood bank inventory.
3. **Real-Time Notification:** Matching donors receive notifications about the new request.
4. **Donor Responds:** A donor views the request and chooses to help.
5. **Hospital Notification:** The hospital receives an update when a donor responds to the request.
6. **Live Communication:** The donor and hospital can use the built-in chat system to coordinate the donation.
7. **Request and Dashboard Updates:** Relevant request statuses and dashboard statistics update as supported by the application.

## 🔔 Real-Time Communication Flow

```text
Hospital Creates Blood Request
              |
              v
       Express.js API
              |
              v
       MongoDB Database
              |
              v
       Socket.io Events
              |
       +------+------+
       |             |
       v             v
   Donor Alert   Dashboard Update
       |
       v
   Donor Responds
       |
       v
 Hospital Notified
       |
       v
   Live Chat
```

## 🩸 Supported Blood Groups

BloodLink's inventory and request system is designed to support all eight major blood groups:

- A+
- A-
- B+
- B-
- AB+
- AB-
- O+
- O-

Actual blood compatibility and donation eligibility should always be verified by qualified healthcare professionals.

## 🔒 Security Features

- JWT-based authentication.
- Password hashing with bcryptjs.
- Role-based access control for donors, hospitals, and admins.
- Protected dashboards and API routes.
- Environment variables for sensitive configuration.
- Input validation and authorization checks where implemented.

**Note:** Production deployments should also enforce secure cookie or token handling, request validation, rate limiting, CORS restrictions, and appropriate access controls for chat and blood request data.

## 🌐 Deployment

BloodLink can be deployed using services that support Next.js, Node.js, and MongoDB.

Potential deployment options include:

- **Frontend:** [Vercel](https://vercel.com/)
- **Backend:** [Render](https://render.com/) or [Railway](https://railway.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas)
- **Image Hosting:** [ImgBB](https://imgbb.com/)

For deployment:

1. Deploy the backend and configure its environment variables.
2. Connect the backend to a hosted MongoDB database.
3. Deploy the Next.js frontend.
4. Update `NEXT_PUBLIC_API_URL` to the deployed backend API URL.
5. Update `NEXT_PUBLIC_SOCKET_URL` to the deployed backend origin.
6. Configure CORS and Socket.io to accept connections from the deployed frontend.
7. Verify authentication, image uploads, real-time notifications, chat, and dashboard updates.

The frontend environment variables must contain the correct public deployment URLs rather than localhost addresses.

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

To contribute:

1. Fork the repository.
2. Create a new branch.

   ```bash
   git checkout -b feature/your-feature
   ```

3. Commit your changes.

   ```bash
   git commit -m "Add your feature"
   ```

4. Push the branch.

   ```bash
   git push origin feature/your-feature
   ```

5. Open a pull request.

## 📄 License

This project is licensed under the **MIT License**.

If the repository does not already contain a `LICENSE` file, add one before distributing the project under that license.

---

Made with ❤️ to help save lives through technology.

**BloodLink — Connecting Donors, Hospitals, and Hope.** 🩸
