# 🚀 Vercel Deployment Guide for Trackly

## Quick Deploy (Recommended)

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time)
   - Project name? **trackly** (or your preferred name)
   - Directory? **./** (current directory)
   - Override settings? **N**

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub (Easiest)

1. **Push your code to GitHub** (you've already done this!)

2. **Go to [vercel.com](https://vercel.com)**

3. **Click "Add New Project"**

4. **Import your GitHub repository:**
   - Select "Memothan3/Trackly"
   - Click "Import"

5. **Configure project:**
   - Framework Preset: **Other**
   - Root Directory: **./** (leave as is)
   - Build Command: (leave empty)
   - Output Directory: **./** (leave as is)

6. **Click "Deploy"**

7. **Wait for deployment** (usually takes 1-2 minutes)

## 📝 After Deployment

### 1. Get Your Vercel URL
After deployment, you'll get a URL like:
```
https://trackly-xyz123.vercel.app
```

### 2. Update Firebase Action URL
Go to Firebase Console → Authentication → Templates → Customize action URL:
```
https://your-vercel-url.vercel.app/auth_fixed.html
```

### 3. Update Firebase Authorized Domains
Go to Firebase Console → Authentication → Settings → Authorized domains:
- Add your Vercel domain: `your-vercel-url.vercel.app`

### 4. Add Custom Domain (Optional)
In Vercel dashboard:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain (e.g., trackly.com)
4. Follow DNS configuration instructions

## 🔧 Configuration Files

### vercel.json
Already configured with:
- Static file serving
- Clean URLs (routes)
- Cache headers
- Service worker support

### .vercelignore
Excludes unnecessary files from deployment:
- Development files
- Documentation
- Batch scripts
- Backup files

## 🌐 Environment Variables

If you need to add environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables like:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `FIREBASE_API_KEY`
   - etc.

**Note:** For client-side apps like Trackly, you're using `config.js` which is fine for public keys.

## 🔄 Automatic Deployments

Once connected to GitHub:
- **Every push to `main`** → Automatic production deployment
- **Every push to other branches** → Preview deployment
- **Every pull request** → Preview deployment with unique URL

## 📊 Monitoring

Vercel provides:
- **Analytics**: View page views, performance metrics
- **Logs**: Real-time function logs
- **Speed Insights**: Performance monitoring
- **Web Vitals**: Core Web Vitals tracking

## 🐛 Troubleshooting

### Issue: 404 on routes
**Solution:** The `vercel.json` routes are configured. Make sure all HTML files exist.

### Issue: Service Worker not working
**Solution:** Check the service worker headers in `vercel.json` - already configured.

### Issue: Firebase auth not working
**Solution:** 
1. Add Vercel domain to Firebase authorized domains
2. Update action URL in Firebase email templates

### Issue: CORS errors
**Solution:** Check Firebase and Supabase CORS settings to allow your Vercel domain.

## 🎯 Production Checklist

Before going live:
- [ ] Test all authentication flows
- [ ] Verify email templates work with Vercel URL
- [ ] Test on mobile devices
- [ ] Check all API connections (Firebase, Supabase)
- [ ] Enable Vercel Analytics
- [ ] Set up custom domain (optional)
- [ ] Configure SSL (automatic with Vercel)
- [ ] Test admin mode functionality
- [ ] Verify file uploads work
- [ ] Test PWA installation

## 🚀 Deploy Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm trackly
```

## 📱 PWA on Vercel

Your PWA will work automatically on Vercel:
- Service worker is properly configured
- Manifest.json is served correctly
- HTTPS is enabled by default
- Users can install Trackly as an app

## 🎉 You're Done!

Your Trackly app is now deployed on Vercel with:
- ⚡ Lightning-fast global CDN
- 🔒 Automatic HTTPS
- 🔄 Automatic deployments from GitHub
- 📊 Built-in analytics
- 🌍 Custom domain support
- 💯 99.99% uptime SLA

Visit your app at: `https://your-vercel-url.vercel.app`
