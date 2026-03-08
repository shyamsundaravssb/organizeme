# OrganizeMe

A full-stack web application for creating, organizing, and sharing playlists of items — built with **Next.js 15**, **TypeScript**, **MongoDB**, and **Tailwind CSS**.

## ✨ Features

- **Authentication** — Register, login, and logout with JWT cookie-based sessions.
- **Email Verification** — OTP-based email verification via Nodemailer.
- **Password Reset** — Forgot password flow with secure token-based reset links.
- **Playlists** — Create, edit, and delete playlists with optional descriptions.
- **Nested Playlists** — Organize playlists hierarchically with sub-playlists.
- **Visibility Control** — Toggle playlists between **public** and **private**.
- **Items** — Add items to playlists with titles, descriptions, and rich-text notes.
- **Rich Text Editor** — Write formatted notes using a TipTap-powered editor.
- **User Profiles** — Search for users and browse their public playlists.
- **Responsive UI** — Clean, modern interface with skeleton loaders, modals, and error states.

## 🛠 Tech Stack

| Layer        | Technology                                                                  |
| ------------ | --------------------------------------------------------------------------- |
| Framework    | [Next.js 15](https://nextjs.org/) (App Router)                              |
| Language     | [TypeScript](https://www.typescriptlang.org/)                               |
| Database     | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| Styling      | [Tailwind CSS v4](https://tailwindcss.com/)                                 |
| Auth         | [JWT](https://jwt.io/) + [bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| Email        | [Nodemailer](https://nodemailer.com/)                                       |
| Rich Text    | [TipTap](https://tiptap.dev/)                                               |
| Sanitization | [DOMPurify](https://github.com/cure53/DOMPurify)                            |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # login, register, logout, verify-otp, forgot/reset password, me
│   │   ├── items/          # CRUD operations for items
│   │   ├── playlists/      # CRUD operations for playlists (including nested)
│   │   ├── protected/      # Protected route helpers
│   │   └── users/          # User lookup
│   ├── components/
│   │   ├── ui/             # Button, Card, Spinner, ErrorState, Skeletons, RichTextEditor
│   │   └── Modal.tsx
│   ├── dashboard/          # Authenticated user dashboard
│   ├── forgot-password/    # Forgot password page
│   ├── item/               # Individual item view
│   ├── login/              # Login page
│   ├── playlist/           # Playlist detail view
│   ├── profile/            # Public user profile
│   ├── register/           # Registration page
│   ├── reset-password/     # Reset password page
│   ├── verify-otp/         # OTP verification page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── db/
│   └── dbConnect.ts        # MongoDB connection helper
├── lib/
│   └── getAuthenticatedUser.ts  # JWT token verification utility
├── models/
│   ├── Item.ts             # Item schema (title, description, notes, parentPlaylist)
│   ├── Playlist.ts         # Playlist schema (title, description, visibility, parent)
│   └── User.ts             # User schema (name, username, email, password, OTP fields)
└── middleware.ts           # Route protection & auth redirects
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) instance (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/organizeme.git
cd organizeme
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

| Variable               | Description                         |
| ---------------------- | ----------------------------------- |
| `MONGODB_URI`          | MongoDB connection string           |
| `JWT_SECRET`           | Secret key for signing JWT tokens   |
| `EMAIL_USER`           | Email address used for sending OTPs |
| `EMAIL_PASS`           | App password for the email account  |
| `NEXT_PUBLIC_BASE_URL` | Base URL of the application         |

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📡 API Routes

### Auth (`/api/auth/`)

| Method | Endpoint           | Description                |
| ------ | ------------------ | -------------------------- |
| POST   | `/register`        | Create a new user account  |
| POST   | `/login`           | Authenticate and get token |
| POST   | `/logout`          | Clear auth cookie          |
| POST   | `/verify-otp`      | Verify email with OTP      |
| POST   | `/forgot-password` | Send password reset email  |
| POST   | `/reset-password`  | Reset password with token  |
| GET    | `/me`              | Get current user info      |

### Playlists (`/api/playlists/`)

| Method | Endpoint        | Description                   |
| ------ | --------------- | ----------------------------- |
| GET    | `/`             | List current user's playlists |
| POST   | `/`             | Create a new playlist         |
| GET    | `/[playlistId]` | Get playlist details          |
| PUT    | `/[playlistId]` | Update a playlist             |
| DELETE | `/[playlistId]` | Delete a playlist             |

### Items (`/api/items/`)

| Method | Endpoint | Description               |
| ------ | -------- | ------------------------- |
| CRUD   | `/`      | Manage items in playlists |

## 📜 Scripts

| Script      | Command         | Description             |
| ----------- | --------------- | ----------------------- |
| Development | `npm run dev`   | Start dev server        |
| Build       | `npm run build` | Create production build |
| Start       | `npm run start` | Start production server |
| Lint        | `npm run lint`  | Run ESLint              |

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
