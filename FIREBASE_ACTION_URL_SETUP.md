# Firebase Custom Action URL Setup

## 🎯 Overview
This guide will help you configure Firebase to use your Vercel domain for all email actions (password reset, email verification, etc.) instead of the default Firebase page.

## 📝 Setup Instructions

### Step 1: Set Custom Action URL in Firebase

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com
   - Select your project: `rubys-3ca51`

2. **Open Authentication Settings**
   - Click **Authentication** in the left sidebar
   - Click **Templates** tab
   - Select any template (Email verification, Password reset, etc.)

3. **Click "Customize action URL"**
   - You'll see a link that says "Customize action URL" at the bottom
   - Click it

4. **Enter Your Vercel URL**
   ```
   https://trackly-neon.vercel.app/auth_fixed.html
   ```

5. **Save the Settings**
   - Click **Save**
   - This applies to ALL email templates automatically

### Step 2: Configure Authorized Domains (Important!)

1. **Go to Firebase Console** → Authentication → Settings
2. **Scroll to "Authorized domains"**
3. **Add your Vercel domain:**
   ```
   trackly-neon.vercel.app
   ```
4. **Click "Add domain"**
5. This allows Firebase to redirect to your Vercel domain

### Step 3: Set Continue URL (Optional but Recommended)

In Firebase Console → Authentication → Templates → Edit template:

**Continue URL (optional):**
```
https://trackly-neon.vercel.app/trackly_dashboard.html
```

This is where users will be redirected after email actions if they're not already signed in.

### Step 4: Verify It's Working

1. **Test Email Verification:**
   - Sign up with a new email
   - Check the verification email
   - Click the link - it should go to your Vercel domain
   - You should see "Email verified successfully! Redirecting to dashboard..."
   - **Automatically redirects to dashboard** if you're signed in

2. **Test Password Reset:**
   - Click "Forgot Password" on sign-in page
   - Enter your email
   - Check the reset email
   - Click the link - it should go to your Vercel domain
   - You should see a form to enter new password
   - After reset, redirects to sign-in page

## 📋 Firebase Console Settings Summary

### Action URL (Custom URL):
```
https://trackly-neon.vercel.app/auth_fixed.html
```
**Where to set:** Authentication → Templates → Any template → "Customize action URL"

### Continue URL (Callback URL):
```
https://trackly-neon.vercel.app/trackly_dashboard.html
```
**Where to set:** Authentication → Templates → Edit template → "Continue URL" field (optional)

### Authorized Domains:
```
trackly-neon.vercel.app
```
**Where to set:** Authentication → Settings → Authorized domains → Add domain

**Note:** The Continue URL is optional. The code now handles automatic redirection to the dashboard after email verification.

## ✨ What This Does

### Before (Default Firebase):
```
User clicks email link
  ↓
Goes to: https://rubys-3ca51.firebaseapp.com/__/auth/action
  ↓
Generic Firebase page
  ↓
Redirects back to your app
```

### After (Custom URL):
```
User clicks email link
  ↓
Goes to: https://trackly-neon.vercel.app/auth_fixed.html
  ↓
Your branded Trackly page
  ↓
Handles action and stays on your site
```

## 🔧 How It Works

Your `auth_fixed.html` now includes a Firebase action handler that:

1. **Detects URL parameters** from email links:
   - `?mode=verifyEmail&oobCode=ABC123`
   - `?mode=resetPassword&oobCode=XYZ789`
   - `?mode=recoverEmail&oobCode=DEF456`

2. **Handles each action automatically:**
   - **Email Verification**: Verifies email and shows success message
   - **Password Reset**: Shows form to enter new password
   - **Email Recovery**: Restores previous email address

3. **Provides user feedback:**
   - Success messages
   - Error handling
   - Smooth transitions

## 🎨 User Experience

### Email Verification Flow:
1. User signs up → Receives verification email
2. Clicks link → Goes to your Trackly page
3. Email verified automatically → "Email verified successfully!"
4. Can sign in immediately

### Password Reset Flow:
1. User clicks "Forgot Password" → Enters email
2. Receives reset email → Clicks link
3. Goes to your Trackly page → Sees password reset form
4. Enters new password → "Password reset successfully!"
5. Can sign in with new password

## 🔒 Security Features

- ✅ Action codes expire after use
- ✅ Codes have time limits (24 hours for verification, 1 hour for reset)
- ✅ Invalid codes show appropriate error messages
- ✅ All actions are validated by Firebase
- ✅ URL parameters are cleared after successful action

## 🚀 Benefits

1. **Full Branding**: Users never leave your Trackly domain
2. **Better UX**: Seamless experience without redirects
3. **Professional**: No generic Firebase pages
4. **Consistent**: Same design as your auth page
5. **Secure**: All Firebase security features maintained

## 📱 Testing Checklist

- [ ] Set custom action URL in Firebase Console
- [ ] Test email verification with new account
- [ ] Test password reset flow
- [ ] Verify error messages work correctly
- [ ] Check mobile responsiveness
- [ ] Confirm URL parameters are cleared after actions

## 🆘 Troubleshooting

**Issue**: Email links still go to Firebase default page
- **Solution**: Make sure you saved the custom action URL in Firebase Console

**Issue**: "Invalid action code" error
- **Solution**: The link may have expired or already been used. Request a new one.

**Issue**: Password reset form doesn't appear
- **Solution**: Clear browser cache and try again

**Issue**: Success message doesn't show
- **Solution**: Check browser console for errors and ensure Firebase is initialized

## 📧 Email Template Variables

Your email templates use these Firebase variables:
- `%DISPLAY_NAME%` - User's display name
- `%LINK%` - Action link (automatically includes your custom URL)
- `%APP_NAME%` - Your app name (Trackly)

## ✅ You're All Set!

Once you've set the custom action URL in Firebase Console, all email actions will automatically use your Vercel domain and be handled by your `auth_fixed.html` page.

Your users will enjoy a seamless, branded experience! 🎉