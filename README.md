# eBay Clone

A full-stack auction platform built with Next.js, TypeScript, Tailwind CSS, Node.js, Express, and Socket.io for real-time bidding.

## Features

- 🔐 User authentication with login screen
- 📦 Item listings with images and details
- 💰 Real-time bidding system
- 👀 Live bid watching - see bids as they happen
- ⏰ Auction countdown timers
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Real-time**: Socket.io
- **Authentication**: JWT with HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development servers:

Option 1: Run both servers separately (in separate terminals):
```bash
# Terminal 1: Start Next.js frontend
npm run dev

# Terminal 2: Start Express backend
npm run server
```

Option 2: Run both servers concurrently:
```bash
npm run dev:all
```

3. Open your browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Test Credentials

You can use any of these accounts to log in:

- **Username**: `buyer1` | **Password**: `password123`
- **Username**: `buyer2` | **Password**: `password123`
- **Username**: `buyer3` | **Password**: `password123`

## Usage

1. **Login**: Use one of the test credentials above
2. **Browse Items**: View all active auctions on the home page
3. **View Item**: Click on any item to see details and place bids
4. **Place Bids**: Enter a bid amount higher than the current price
5. **Watch Live**: Open the same item in multiple browser windows/tabs with different users to see real-time bidding updates

## Project Structure

```
ebay/
├── app/                    # Next.js app directory
│   ├── login/             # Login page
│   ├── items/[id]/        # Item detail page with bidding
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page with item listings
│   └── globals.css        # Global styles
├── server/                # Express backend
│   └── index.ts           # Server with Socket.io
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Real-time Features

The application uses Socket.io to provide real-time updates:
- When a user places a bid, all users viewing that item see the update instantly
- Bid history updates in real-time
- Current price updates automatically

## Notes

- The backend uses in-memory storage (items, users, bids). In production, you would use a database.
- JWT secret should be changed to a secure value in production.
- CORS is configured for localhost:3000. Update for production deployment.

