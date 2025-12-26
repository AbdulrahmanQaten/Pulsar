# Pulsar Backend

Backend API for Pulsar social media platform.

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Environment Variables

Set these in Render dashboard:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=5000
```

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

## Deploy to Railway

1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

## Deploy to Vercel

```bash
vercel --prod
```

Make sure to add environment variables in Vercel dashboard.
