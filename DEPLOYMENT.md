# Deployment Guide

## Environment Configuration

The shareable link URL is now **automatically detected** based on your environment:

### How It Works

- **Browser (Client-side)**: Uses `window.location.origin` to automatically detect the current domain
- **Server-side Rendering**: Falls back to environment variables in this order:
  1. `NEXT_PUBLIC_APP_URL` (if set)
  2. `VERCEL_URL` (automatically provided by Vercel)
  3. `http://localhost:5000` (default fallback)

### Local Development

1. Copy `.env.example` to `env.local`:
   ```bash
   cp .env.example env.local
   ```

2. Update `env.local` with your Insforge backend URL:
   ```env
   NEXT_PUBLIC_INSFORGE_URL=https://your-insforge-instance.us-east.insforge.app
   NEXT_PUBLIC_APP_URL=http://localhost:5000
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Vercel Deployment

1. **No additional configuration needed!** The app will automatically detect the Vercel URL.

2. If you have a custom domain, you can optionally set it in Vercel's environment variables:
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add `NEXT_PUBLIC_APP_URL` with your custom domain (e.g., `https://fileshare.example.com`)

3. Make sure to set your `NEXT_PUBLIC_INSFORGE_URL` in Vercel's environment variables:
   ```
   NEXT_PUBLIC_INSFORGE_URL=https://your-insforge-instance.us-east.insforge.app
   ```

### Other Hosting Platforms

For platforms other than Vercel, set the `NEXT_PUBLIC_APP_URL` environment variable to your production URL:

```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## Testing

To test the shareable link generation:

1. Upload a file
2. Copy the shareable link
3. Verify the URL matches your current domain:
   - Local: `http://localhost:5000/share/[token]`
   - Vercel: `https://your-app.vercel.app/share/[token]`
   - Custom domain: `https://your-domain.com/share/[token]`

## Benefits

✅ **Automatic detection** - No manual URL configuration needed  
✅ **Environment-aware** - Works in dev, staging, and production  
✅ **Vercel-optimized** - Uses Vercel's built-in `VERCEL_URL`  
✅ **Custom domain support** - Override with `NEXT_PUBLIC_APP_URL` if needed  
