# EcoSync Vercel Deployment Guide

This guide explains how to deploy the EcoSync frontend to Vercel and connect it to your backend.

## Architecture

```
┌─────────────────┐         ┌─────────────┐         ┌─────────────────┐
│   Vercel        │ ──────► │  ngrok      │ ──────► │  Your Computer  │
│   (HTTPS)       │         │  Cloud      │         │  localhost:8000 │
│   Next.js       │         │             │         │  FastAPI        │
└─────────────────┘         └─────────────┘         └─────────────────┘
```

## Prerequisites

1. Vercel account (free)
2. ngrok account (free)
3. GitHub repository connected to Vercel

## Step 1: Frontend Environment Variables (Vercel)

In your Vercel dashboard, go to **Project Settings → Environment Variables**:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-ngrok-url.ngrok-free.app` | Production |
| `NEXT_PUBLIC_WS_URL` | `wss://your-ngrok-url.ngrok-free.app/ws` | Production |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Development |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000/ws` | Development |

> **Note:** Use `wss://` (secure WebSocket) for production, `ws://` for local development.

## Step 2: Backend Environment Variables

Create a `.env` file in your `backend/` folder:

```bash
# Copy from example
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-vercel-app-git-main.vercel.app,*
```

> **Note:** The `*` allows all origins for development. For production, specify exact URLs.

## Step 3: Start the Backend

```bash
cd backend
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

You should see:
```
Uvicorn running on http://0.0.0.0:8000
```

## Step 4: Start ngrok Tunnel

Download ngrok from https://ngrok.com/download

```bash
# Configure with your auth token (one-time setup)
ngrok config add-authtoken YOUR_AUTHTOKEN

# Start the tunnel
ngrok http 8000
```

Copy the **HTTPS URL** shown:
```
Forwarding  https://abc123-def.ngrok-free.app -> http://localhost:8000
```

## Step 5: Update Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` with your ngrok HTTPS URL
3. Update `NEXT_PUBLIC_WS_URL` with `wss://your-ngrok-url.ngrok-free.app/ws`
4. Click **Save**
5. Redeploy the project (Vercel will auto-deploy on next push, or manually redeploy)

## Step 6: Verify Connection

1. Open your Vercel app URL
2. Scroll to the **Dashboard** section
3. You should see the **"Live EcoSync Data"** panel
4. Check the connection status:
   - 🟢 **Green dot** = Connected
   - 🟡 **Yellow dot** = Connecting
   - 🔴 **Red dot** = Error

### Browser DevTools Verification

Press **F12** → **Console**:
```
✓ Attempting to connect to: wss://abc123-def.ngrok-free.app/ws
✓ WebSocket connected
✓ Received message: {...}
```

Press **F12** → **Network** → Filter by **"WS"**:
- You should see WebSocket connection with status `101 Switching Protocols`
- Messages should be flowing every 2 seconds

## Troubleshooting

### Connection Refused
- Backend not running? Start it with `uvicorn src.main:app --host 0.0.0.0 --port 8000`
- ngrok not running? Start it with `ngrok http 8000`

### CORS Error
```
Access to WebSocket at 'wss://...' from origin 'https://...' has been blocked
```
**Fix:** Add your Vercel URL to `backend/.env`:
```env
ALLOWED_ORIGINS=https://your-app.vercel.app
```
Restart the backend.

### Mixed Content Error
```
Mixed Content: The page was loaded over HTTPS, but attempted to connect to WS:
```
**Fix:** Use `wss://` (not `ws://`) in Vercel environment variables.

### WebSocket Shows "Connecting" Forever
- Check ngrok URL hasn't changed (free tier changes on restart)
- Update Vercel environment variables with new URL
- Redeploy Vercel app

## Important Notes

### ngrok Free Tier Limitations
- URL changes every time you restart ngrok
- ~40 connections/minute limit
- For stable URL, upgrade to ngrok Pro or use Cloudflare Tunnel

### Multiple Concurrent Users
Your backend supports unlimited concurrent connections. Each user connects to the same ngrok URL and receives broadcasted data.

### Security
- Don't commit `.env` files to Git
- Use `ALLOWED_ORIGINS` to restrict CORS in production
- Consider upgrading to ngrok Pro for persistent URLs

## Files Modified for Vercel Deployment

### Frontend
- `frontend/src/app/page.tsx` - Added EcoSyncWebSocket component import and usage
- `frontend/src/app/EcoSyncWebSocket.tsx` - WebSocket client with environment variable support

### Backend
- `backend/src/main.py` - CORS middleware with ALLOWED_ORIGINS environment variable
- `backend/.env.example` - Documented required environment variables

## Quick Checklist

- [ ] Backend running on `http://localhost:8000`
- [ ] ngrok tunnel active with HTTPS URL
- [ ] Vercel environment variables set with ngrok URL
- [ ] Backend `.env` has `ALLOWED_ORIGINS` with Vercel URL
- [ ] Frontend redeployed after env var changes
- [ ] Dashboard shows "Live EcoSync Data" panel
- [ ] WebSocket connection status is green
