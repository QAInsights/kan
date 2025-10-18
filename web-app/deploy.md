# Deployment Guide 🚀

Complete guide to deploying your Eye Blink Tracker web app to various platforms.

---

## 🌐 GitHub Pages (FREE)

### Method 1: Via GitHub Website (Easiest)

1. **Create GitHub Repository**
   - Go to github.com
   - Click "New Repository"
   - Name it `eye-blink-tracker`
   - Make it public
   - Click "Create repository"

2. **Upload Files**
   - Click "uploading an existing file"
   - Drag all files from `web-app` folder
   - Commit changes

3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / `root`
   - Click Save

4. **Access Your App**
   - URL: `https://yourusername.github.io/eye-blink-tracker`
   - Wait 1-2 minutes for deployment

### Method 2: Via Git (Command Line)

```bash
# Navigate to web-app folder
cd web-app

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/eye-blink-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main

# Enable Pages in GitHub Settings
```

**Pros:**
- ✅ Free forever
- ✅ Custom domain support
- ✅ HTTPS included
- ✅ Easy to update

**Cons:**
- ❌ Public repository required (for free)
- ❌ Manual updates

---

## 🎨 Netlify (FREE)

### Method 1: Drag & Drop (Fastest)

1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)
3. Click "Add new site" → "Deploy manually"
4. Drag `web-app` folder to upload area
5. Done! Your site is live

**Your URL:** `https://random-name-123.netlify.app`

### Method 2: GitHub Integration

1. Push code to GitHub (see above)
2. Go to Netlify
3. Click "Add new site" → "Import from Git"
4. Connect GitHub
5. Select repository
6. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `/`
7. Click "Deploy"

**Pros:**
- ✅ Instant deployment
- ✅ Auto-deploy on git push
- ✅ Custom domain (free)
- ✅ HTTPS automatic
- ✅ CDN included
- ✅ Form handling
- ✅ Serverless functions

**Cons:**
- ❌ Build minutes limited (generous free tier)

### Custom Domain on Netlify

1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Enter your domain
4. Update DNS records at your registrar
5. SSL certificate auto-generated

---

## ⚡ Vercel (FREE)

### Method 1: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to web-app folder
cd web-app

# Deploy
vercel

# Follow prompts
# - Setup and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? eye-blink-tracker
# - Directory? ./
# - Override settings? No

# Production deployment
vercel --prod
```

**Your URL:** `https://eye-blink-tracker.vercel.app`

### Method 2: GitHub Integration

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select GitHub repository
5. Click "Deploy"

**Pros:**
- ✅ Fastest CDN
- ✅ Auto-deploy on push
- ✅ Preview deployments
- ✅ Custom domains
- ✅ Edge functions
- ✅ Analytics

**Cons:**
- ❌ Bandwidth limits (generous)

---

## 🔶 Cloudflare Pages (FREE)

### Deployment Steps

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign up/login
3. Click "Create a project"
4. Connect GitHub
5. Select repository
6. Build settings:
   - Build command: (empty)
   - Build output: `/`
7. Click "Save and Deploy"

**Your URL:** `https://eye-blink-tracker.pages.dev`

**Pros:**
- ✅ Cloudflare's global CDN
- ✅ Unlimited bandwidth
- ✅ Unlimited requests
- ✅ DDoS protection
- ✅ Web analytics

**Cons:**
- ❌ Build time limits

---

## 🔷 Azure Static Web Apps (FREE)

### Deployment Steps

1. Install Azure CLI
2. Login: `az login`
3. Create resource group
4. Deploy:

```bash
az staticwebapp create \
  --name eye-blink-tracker \
  --resource-group myResourceGroup \
  --source web-app \
  --location "eastus2" \
  --branch main
```

**Pros:**
- ✅ Microsoft infrastructure
- ✅ Custom domains
- ✅ API support
- ✅ Authentication

**Cons:**
- ❌ More complex setup
- ❌ Azure account required

---

## 🟢 Firebase Hosting (FREE)

### Deployment Steps

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
cd web-app
firebase init hosting

# Select:
# - Create new project or use existing
# - Public directory: .
# - Single-page app: No
# - GitHub deploys: Optional

# Deploy
firebase deploy
```

**Your URL:** `https://your-project.web.app`

**Pros:**
- ✅ Google infrastructure
- ✅ Free SSL
- ✅ CDN included
- ✅ Easy rollbacks

**Cons:**
- ❌ Requires Firebase account
- ❌ CLI setup needed

---

## 🐳 Docker (Self-Hosted)

### Dockerfile

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy

```bash
# Build
docker build -t eye-blink-tracker .

# Run
docker run -d -p 80:80 eye-blink-tracker
```

**Access:** `http://localhost`

---

## 📱 Mobile App (PWA)

Convert to Progressive Web App for mobile installation.

### Add manifest.json

```json
{
  "name": "Eye Blink Tracker",
  "short_name": "Blink Tracker",
  "description": "Track your eye blinks",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Add to index.html

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#667eea">
```

### Add Service Worker

```javascript
// sw.js
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('blink-tracker-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/app.js',
        '/blink-detector.js',
        '/db.js'
      ]);
    })
  );
});
```

---

## 🔒 HTTPS Requirement

**Important:** Camera access requires HTTPS or localhost!

All deployment platforms above provide free HTTPS:
- ✅ GitHub Pages: Automatic
- ✅ Netlify: Automatic
- ✅ Vercel: Automatic
- ✅ Cloudflare: Automatic
- ✅ Firebase: Automatic

For self-hosting, use:
- Let's Encrypt (free SSL)
- Cloudflare (free SSL proxy)
- Caddy (auto HTTPS)

---

## 🎯 Recommended Platform

### For Beginners
**Netlify** - Drag & drop, instant deployment

### For Developers
**Vercel** - Best DX, fast deploys, great CLI

### For Scale
**Cloudflare Pages** - Unlimited bandwidth

### For GitHub Users
**GitHub Pages** - Integrated, simple

### For Google Ecosystem
**Firebase** - Good integration with Google services

---

## 📊 Comparison Table

| Platform | Setup | Speed | Free Tier | Custom Domain | Auto Deploy |
|----------|-------|-------|-----------|---------------|-------------|
| **Netlify** | ⭐⭐⭐⭐⭐ | Fast | 100GB/mo | ✅ | ✅ |
| **Vercel** | ⭐⭐⭐⭐ | Fastest | 100GB/mo | ✅ | ✅ |
| **GitHub Pages** | ⭐⭐⭐⭐ | Fast | 100GB/mo | ✅ | ⚠️ |
| **Cloudflare** | ⭐⭐⭐ | Fastest | Unlimited | ✅ | ✅ |
| **Firebase** | ⭐⭐⭐ | Fast | 10GB/mo | ✅ | ✅ |

---

## 🔄 Update Deployment

### GitHub Pages
```bash
git add .
git commit -m "Update"
git push
# Wait 1-2 minutes
```

### Netlify (Drag & Drop)
1. Go to Deploys tab
2. Drag new folder
3. Instant update

### Netlify (Git)
```bash
git push
# Auto-deploys
```

### Vercel
```bash
vercel --prod
# Or git push (auto-deploys)
```

---

## 🐛 Troubleshooting

### Camera Not Working After Deploy
- ✅ Ensure HTTPS is enabled
- ✅ Check browser permissions
- ✅ Test on localhost first

### 404 Errors
- ✅ Check file paths are relative
- ✅ Ensure all files uploaded
- ✅ Check build directory settings

### Slow Loading
- ✅ Use CDN for libraries
- ✅ Enable compression
- ✅ Optimize images (if any)

### CORS Issues
- ✅ Shouldn't happen (no API calls)
- ✅ If using custom domain, check DNS

---

## 📈 Post-Deployment

### Analytics (Optional)

Add Google Analytics:
```html
<!-- In index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Performance Monitoring

Use Lighthouse:
```bash
npm install -g lighthouse
lighthouse https://your-site.com
```

### SEO

Add meta tags:
```html
<meta name="description" content="Track your eye blinks with AI">
<meta property="og:title" content="Eye Blink Tracker">
<meta property="og:description" content="AI-powered blink tracking">
<meta property="og:image" content="preview.png">
```

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Test locally
- [ ] Check all features work
- [ ] Test on different browsers
- [ ] Verify camera access
- [ ] Test data persistence
- [ ] Check mobile responsiveness
- [ ] Optimize loading speed
- [ ] Add meta tags
- [ ] Create favicon
- [ ] Test export functionality

After deploying:
- [ ] Test on live URL
- [ ] Verify HTTPS works
- [ ] Test camera on live site
- [ ] Check mobile devices
- [ ] Share with testers
- [ ] Monitor performance
- [ ] Set up analytics (optional)

---

## 🎉 You're Live!

Your Eye Blink Tracker is now accessible worldwide! 🌍

Share your URL and help others track their eye health! 👁️✨
