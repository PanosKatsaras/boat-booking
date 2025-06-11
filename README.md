![Screenshot (boat-booking1)](https://github.com/user-attachments/assets/a3f1c5be-bf50-4b0e-a6f3-1bbd6c2976a4)

![Screenshot (4230)](https://github.com/user-attachments/assets/5e6e0ca7-7654-426c-af28-3dca63c60013)

![Screenshot (boat-booking2)](https://github.com/user-attachments/assets/e9ac4713-34c5-4614-8abe-875882626f2a)

![Screenshot (boat-booking4)](https://github.com/user-attachments/assets/38652dc6-fab2-4e46-8d97-3c58a005059e)

![Screenshot (boat-booking5)](https://github.com/user-attachments/assets/fbba57af-f51d-4fec-93dd-d9fc5418f2b1)

![Screenshot (boat-booking3)](https://github.com/user-attachments/assets/f35ad4cb-29b7-4bf8-ab91-918b977ed65b)


⛵ Boat Booking App

A full-stack web application for seamless boat rental bookings, built with React, Node.js, Prisma (PostgreSQL), and Stripe payment integration. It comes complete with user authentication, role-based access control, and a secure JWT/HttpOnly cookie system. Users can browse available boats, book them for various durations, and manage their bookings. Admins have comprehensive control over boats, ports, and user accounts through dedicated dashboards.

✨ Features

    User Authentication: Secure registration, login, and logout.

    JWT & HttpOnly Cookies: Robust authentication using JSON Web Tokens stored in secure, HttpOnly cookies.

    Role-Based Access Control (RBAC):

        User Role: Browse boats, make bookings, view personal booking history.

        Manager Role: (Future expansion: e.g., view all bookings, manage booking statuses) - Currently, manager functionality is limited, primarily for potential future features or aggregated views.

        Admin Role: Full administrative control via a dedicated dashboard.

    Boat Catalog: View details of available boats, including rates and captain options.

    Flexible Booking Options: Book boats per hour, half-day, or full-day.

    Captain Option: Option to include a captain for an additional fee.

    Stripe Payment Integration: Secure and seamless checkout process using Stripe for payment processing.

    Interactive Port Map:

        Displays all registered ports on an interactive map using Leaflet.

        Clickable markers for each port.

        Popups on marker click showing port name, coordinates, and a list of available boats at that port.

        Boat listings within popups include boat name, type, and an image preview (clickable to open full image).

        Admin users have the ability to delete ports directly from the map popup.

        The map dynamically centers itself based on the locations of the fetched ports.

    Admin Dashboard:

        Boat Management: Create, Read, Delete operations for boats.

        Port Management: Create, Read, Delete operations for departure/return ports.

        User Management: Create, Read, Update, Delete operations for user accounts, including assigning roles (User, Manager, Admin).

🚀 Technologies Used

This application leverages a modern full-stack architecture, 
with TypeScript as the primary language for both the frontend and backend, 
ensuring type safety and improved developer experience.

Frontend:

    React: A declarative, component-based JavaScript library for building user interfaces.

    Material-UI (MUI): A popular React UI framework for beautiful and responsive designs.

    Axios: Promise-based HTTP client for making API requests.

    @mui/x-date-pickers & date-fns: For date selection and formatting.

    Stripe.js: Client-side library for Stripe payment integration.

    React Leaflet: React components for Leaflet maps.

    Leaflet: An open-source JavaScript library for mobile-friendly interactive maps.

Backend:

    Node.js (Express): A fast, unopinionated, minimalist web framework for building APIs.

    Prisma ORM: A next-generation ORM for Node.js and TypeScript, making database access easy and type-safe.

    PostgreSQL: A powerful, open-source relational database.

    jsonwebtoken: For creating and verifying JWTs.

    bcryptjs: For hashing passwords securely.

    cookie-parser: Middleware for parsing cookies from incoming requests.

    Stripe Node.js Library: Server-side library for interacting with the Stripe API.

📦 Getting Started

Follow these instructions to set up and run the project locally.
Prerequisites

Before you begin, ensure you have the following installed:

    Node.js (LTS version recommended)

    npm (comes with Node.js) or Yarn

    PostgreSQL

    Git

1. Clone the Repository

git clone <your-repository-url>
cd boat-booking-app

2. Backend Setup

Navigate to the backend directory:

cd backend

2.1. Environment Variables

Create a .env file in the backend directory with the following variables:

DATABASE_URL="postgresql://user:password@localhost:5432/boatbookingdb?schema=public"
JWT_SECRET="your_jwt_secret_key" # Use a strong, random string
SERVER_PORT=5000
CLIENT_URL="http://localhost:3000" # URL of your frontend application
STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_SECRET_KEY" # Get this from your Stripe Dashboard

    DATABASE_URL: Replace user, password, and boatbookingdb with your PostgreSQL credentials and database name.

    JWT_SECRET: Generate a strong, random string.

    STRIPE_SECRET_KEY: Obtain your test secret key from your Stripe Dashboard.

2.2. Install Dependencies

npm install # or yarn install

2.3. Setup Database with Prisma

Run Prisma migrations to create the database schema:

npx prisma migrate dev --name init_database # Or a more descriptive name if you already have migrations

If you want to populate your database with some initial data (e.g., sample users, boats, ports), create a prisma/seed.ts file and run:

npx prisma db seed

(You'll need to create prisma/seed.ts first if it doesn't exist, and add seeding logic there).
2.4. Start the Backend Server

npm start # or npm run dev if you have a dev script using nodemon

The server will run on http://localhost:5000 (or your specified SERVER_PORT).
3. Frontend Setup

Open a new terminal and navigate to the frontend directory (or your React project root):

cd ../frontend # From backend directory

3.1. Environment Variables

Create a .env file in the frontend directory with the following variables:

REACT_APP_SERVER_URL=http://localhost:5000 # Must match your backend's URL and port
REACT_APP_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY" # Get this from your Stripe Dashboard

    REACT_APP_SERVER_URL: This is crucial. It must point to where your backend server is running.

    REACT_APP_STRIPE_PUBLISHABLE_KEY: Obtain your test publishable key from your Stripe Dashboard.


3.2. Install Dependencies

npm install # or yarn install

3.4. Start the Frontend Application

npm start # or yarn start

The frontend application will open in your browser, typically at http://localhost:3000.

👩‍💻 User Roles & Dashboards

The application implements three distinct user roles:

    User:

        Can register, log in, and log out.

        Browse and view details of all available boats and ports.

        Select boats, specify booking type (hourly, half-day, full-day), and duration.

        Option to include a captain.

        Proceed to Stripe checkout for payment.

        View their personal booking history.

    Manager:

        Has access to a dedicated dashboard.

        Viewing all bookings.
        
        View all Users.
        
        Without administrative CRUD access to core entities.

    Admin:

        Has full administrative privileges via a dedicated dashboard.

        Boat Management: Create, view, and delete boat records.

        Port Management: Create, view,  and delete port records.

        User Management: View all user accounts, create new users, update user details (including changing roles to User, Manager, or Admin), and delete users.

💳 Testing with Stripe

When testing the payment flow, ensure your Stripe keys are in test mode (pk_test_... and sk_test_...). You can use the following test card numbers (with any future expiration date and any 3-digit CVC, or 4 for Amex):

    Visa: 4242 4242 4242 4242

    Mastercard: 5100 0000 0000 0000
    

For a comprehensive list of test cards and scenarios (e.g., failed payments), refer to the official Stripe documentation.
