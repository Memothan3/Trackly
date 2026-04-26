# 🧙 Wizard Mode - Multi-Step Signup Guide

## Overview

The auth form now includes a **modern multi-step wizard mode** for signup, providing a better user experience with:

- ✅ **Split-screen layout** with visual branding panel
- ✅ **4-step signup process** with progress indicator
- ✅ **Google account merging** with email validation
- ✅ **Real-time validation** and feedback
- ✅ **Smooth animations** and transitions

## How to Access

1. Go to `auth_fixed.html`
2. Click the **"🧙 Try Wizard Mode"** button in the top-right corner
3. The form will switch to the multi-step wizard interface

## Wizard Steps

### Step 1: Email Address
- Enter your email address
- **Google Account Detection**: If you enter a Gmail address, you'll see an option to link your Google account
- **Email Matching**: If you link Google, the system verifies the Google email matches your entered email

### Step 2: Password
- Create a secure password (minimum 6 characters)
- Confirm your password
- Real-time password matching validation

### Step 3: Profile Details
- **Full Name** (required)
- **Username** (required, auto-validated for availability)
- **Phone Number** (optional)
- **Country** (optional)
- **Default Currency** (optional, defaults to USD)

### Step 4: Email Confirmation
- Confirmation screen with email verification instructions
- Resend email option if needed
- **Admin bypass**: Admin users (memothan3@gmail.com) skip this step

## Google Account Merging

### How It Works

1. **Enter Email**: Type your email in Step 1
2. **Gmail Detection**: If it's a Gmail address, a merge option appears
3. **Click "Link with Google Account"**: Opens Google Sign-In popup
4. **Email Validation**: System checks if Google email matches entered email
5. **Success**: If emails match, account is linked and you can use Google Sign-In
6. **Error**: If emails don't match, you'll see an error message with retry option

### Email Mismatch Handling

If the Google account email doesn't match:
```
❌ Google account email (different@gmail.com) doesn't match 
   the entered email (yours@gmail.com). 
   Please use the same email or try again.
```

You can then:
- Correct your email address
- Try linking again with the correct Google account
- Continue without linking

## Features

### Progress Indicator
- Visual progress bar showing completion percentage
- Step numbers with checkmarks for completed steps
- Active step highlighted in gold
- Smooth transitions between steps

### Navigation
- **Back Button**: Return to previous step (hidden on step 1)
- **Next Button**: Advance to next step with validation
- **Create Account**: Final button on step 3
- **Enter Key**: Press Enter to advance (works on all steps)

### Validation
- **Real-time**: Username availability checked as you type
- **Inline Messages**: Success/error messages appear below fields
- **Step Validation**: Can't proceed without completing required fields
- **Password Matching**: Confirms passwords match before proceeding

### Admin Features
- **Email Verification Bypass**: Admin users skip email confirmation
- **Direct Dashboard Access**: Redirects immediately after signup
- **No Waiting**: Instant access to all features

## Switching Modes

### Classic Mode → Wizard Mode
Click **"🧙 Try Wizard Mode"** button

### Wizard Mode → Classic Mode
Click **"📋 Classic Mode"** button

The button toggles between modes, preserving your place in the signup process.

## Technical Details

### Data Storage
Wizard data is temporarily stored in the `wizardData` object:
```javascript
{
  email: '',
  password: '',
  name: '',
  username: '',
  phone: '',
  country: '',
  currency: 'USD',
  googleLinked: false
}
```

### Firebase Integration
- Creates Firebase Authentication account
- Sends email verification (except admin)
- Syncs profile data to Supabase
- Links Google account if merged

### Supabase Sync
All profile data is synced to Supabase `profiles` table:
- `id`: Firebase UID
- `username`: Unique username
- `full_name`: User's full name
- `phone`: Phone number (optional)
- `country`: Country (optional)
- `currency`: Default currency

## Styling

### Colors
- **Gold/Amber**: `#f59e0b` (primary actions, highlights)
- **Success Green**: `oklch(0.74 0.14 151)`
- **Error Red**: `oklch(0.6368 0.2078 25.3313)`

### Animations
- **Fade In**: Steps fade in when activated
- **Progress Bar**: Smooth width transition (0.4s)
- **Button Hover**: Subtle transform and opacity changes

### Responsive
- Mobile-friendly with adjusted padding
- Touch-optimized button sizes
- Smooth scrolling on small screens

## Error Handling

### Common Errors
1. **Email already in use**: Suggests signing in instead
2. **Username taken**: Prompts to choose another
3. **Weak password**: Requires stronger password
4. **Google popup blocked**: Asks to allow popups
5. **Email mismatch**: Shows retry option with correct email

### Error Messages
All errors display in a styled message box with:
- Clear error description
- Actionable next steps
- Appropriate color coding

## Best Practices

### For Users
1. Use a valid email address you can access
2. Choose a unique username (3+ characters)
3. Create a strong password (6+ characters)
4. Link Google account for easier future sign-ins

### For Developers
1. Test email verification flow
2. Verify Google OAuth configuration
3. Check Supabase RLS policies
4. Monitor Firebase Auth quotas

## Troubleshooting

### Wizard Not Showing
- Check if `wizard-signup-form` element exists
- Verify JavaScript is loaded
- Check browser console for errors

### Google Merge Not Working
- Verify Firebase Google OAuth is configured
- Check popup blocker settings
- Ensure correct redirect URIs in Firebase Console

### Email Not Sending
- Check Firebase email templates
- Verify action URL is set correctly
- Check spam folder

### Username Validation Failing
- Verify Supabase connection
- Check `profiles` table exists
- Ensure RLS policies allow SELECT

## Future Enhancements

Potential improvements:
- [ ] Password strength indicator
- [ ] Email domain validation
- [ ] Profile picture upload in wizard
- [ ] Social media account linking
- [ ] Two-factor authentication setup
- [ ] Welcome tour after signup

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase and Supabase configuration
3. Review `ADMIN_SETUP.md` for admin features
4. Check `FIREBASE_ACTION_URL_SETUP.md` for email setup

---

**Version**: 1.0.0  
**Last Updated**: April 26, 2026  
**Compatible With**: Trackly Dashboard v2.2.0
