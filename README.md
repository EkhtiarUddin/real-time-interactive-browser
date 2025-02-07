# Real-Time Interactive Browser

This project provides a real-time interactive browser experience where users can control a browser session via a frontend UI. The browser session is streamed to the frontend, and users can navigate, click, and type within the browser.

## Features
- Real-time browser streaming to the frontend.
- Full control of the browser session (navigation, clicks, typing).
- Isolated browser sessions for each user.
- Built with FastAPI (backend) and React (frontend).

## Tech Stack
- **Backend**: FastAPI, Playwright, WebSocket
- **Frontend**: React, TailwindCSS, WebSocket

## Installation

### Backend Setup
1. Navigate to the backend directory:
   cd backend

2. Install dependencies:
   pip install fastapi uvicorn playwright python-dotenv openai
   playwright install chromium

3. Create a .env file in the backend directory:
   OPENAI_API_KEY = openai_api_key
   

### Frontend Setup
1. Install dependencies:
   cd frontend
   yarn install

2. Create a .env file in the frontend directory:
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   API_BASE_URL=http://localhost:8000

## Running the Application

1. Run the FastAPI server::
   cd backend
   python main.py
2. Run the frontend development server:
   cd frontend
   yarn dev or npm run dev

The frontend will start on http://localhost:3000
