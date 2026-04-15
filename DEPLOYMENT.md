# 🚀 Deployment Guide

## GitHub Pages Deployment

### Quick Setup

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/trackly.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `/ (root)`
   - Click Save

3. **Access Your App**
   - Your app will be available at: `https://yourusername.github.io/trackly/trackly_dashboard.html`
   - Landing page: `https://yourusername.github.io/trackly/`

### Custom Domain (Optional)

1. **Add CNAME file**
   ```bash
   echo "your-domain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configure DNS**
   - Add CNAME record pointing to `yourusername.github.io`
   - Wait for DNS propagation (up to 24 hours)

## Alternative Deployment Options

### Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: (leave empty)
   - Publish directory: `/` (root)
   - Click "Deploy site"

3. **Custom Domain**
   - Go to Site settings → Domain management
   - Add custom domain

### Vercel

1. **Import Project**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Deploy Settings**
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: `./`
   - Install Command: (leave empty)

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure firebase.json**
   ```json
   {
     "hosting": {
       "public": ".",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

## Environment Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication → Google Sign-in

2. **Update Configuration**
   - Copy your Firebase config
   - Update `trackly_dashboard.html` with your config
   - Update `auth_fixed.html` with your config

3. **Add Authorized Domains**
   - Go to Authentication → Settings → Authorized domains
   - Add your deployment domain

### Supabase Setup

1. **Create Supabase Project**
   - Go to [Supabase](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Database Scripts**
   - Execute scripts from `/backend/` folder
   - Set up Row Level Security (RLS)

3. **Update Configuration**
   - Update Supabase URL and key in `trackly_dashboard.html`

## Security Considerations

### Production Checklist

- [ ] Update Firebase configuration with production keys
- [ ] Update Supabase configuration with production keys
- [ ] Enable HTTPS (automatic with GitHub Pages/Netlify/Vercel)
- [ ] Configure proper CORS settings
- [ ] Set up proper authentication domains
- [ ] Review and update security rules
- [ ] Test all functionality in production environment

### Environment Variables

For platforms that support environment variables:

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_domain
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

## Monitoring and Analytics

### GitHub Pages Analytics

- Use Google Analytics
- Add tracking code to `trackly_dashboard.html`

### Performance Monitoring

- Use Lighthouse for performance audits
- Monitor Core Web Vitals
- Set up error tracking (Sentry, LogRocket)

## Troubleshooting

### Common Issues

1. **404 Errors**
   - Check file paths are correct
   - Ensure all files are committed and pushed

2. **Authentication Issues**
   - Verify Firebase configuration
   - Check authorized domains
   - Ensure HTTPS is enabled

3. **Database Connection Issues**
   - Verify Supabase configuration
   - Check RLS policies
   - Ensure proper CORS settings

### Support

- Check GitHub Issues
- Review deployment logs
- Test locally first with `python -m http.server 8000`

---

**Happy Deploying! 🚀**