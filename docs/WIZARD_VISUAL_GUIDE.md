# 🎨 Wizard Mode - Visual Guide

## Interface Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  LEFT PANEL (Branding)          │  RIGHT PANEL (Form)          │
│                                  │                              │
│  ┌──────────────────────┐       │  [🧙 Try Wizard Mode]       │
│  │ Trackly Logo         │       │                              │
│  └──────────────────────┘       │  ●───●───●───○  Progress    │
│                                  │  1   2   3   4              │
│  Your money,                     │                              │
│  starts here.                    │  Create Your Account         │
│                                  │  Let's get you started...    │
│  Join Trackly and build a        │                              │
│  clear financial life...         │  ┌────────────────────┐     │
│                                  │  │ Email Address      │     │
│  ✓ All accounts in one place    │  │ [input field]      │     │
│  ✓ Reason-based tracking         │  └────────────────────┘     │
│  ✓ Receipt extraction            │                              │
│  ✓ Scheduled reminders           │  [Next →]                   │
│  ✓ Synced across devices         │                              │
│                                  │                              │
│  $ € £ ¥ ₹ ₿ (floating)        │                              │
│                                  │                              │
└─────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Visual Flow

### Step 1: Email Address

```
Progress: ●───○───○───○ (25%)

┌─────────────────────────────────┐
│ Email Address *                 │
│ ┌─────────────────────────────┐ │
│ │ you@example.com             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔗 Link with Google Account │ │
│ │                             │ │
│ │ We found a Google account   │ │
│ │ with this email. Link them  │ │
│ │ together for easy sign-in.  │ │
│ │                             │ │
│ │ [🔵 Link with Google]       │ │
│ └─────────────────────────────┘ │
│                                 │
│           [Next →]              │
└─────────────────────────────────┘
```

### Step 2: Password

```
Progress: ●───●───○───○ (50%)

┌─────────────────────────────────┐
│ Create Password *               │
│ ┌─────────────────────────────┐ │
│ │ ••••••••                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Confirm Password *              │
│ ┌─────────────────────────────┐ │
│ │ ••••••••                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ [← Back]      [Next →]          │
└─────────────────────────────────┘
```

### Step 3: Profile Details

```
Progress: ●───●───●───○ (75%)

┌─────────────────────────────────┐
│ Full Name *                     │
│ ┌─────────────────────────────┐ │
│ │ Mohammed                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Username *                      │
│ ┌─────────────────────────────┐ │
│ │ mohammed123                 │ │
│ └─────────────────────────────┘ │
│ ✓ Username is available         │
│                                 │
│ Phone Number                    │
│ ┌─────────────────────────────┐ │
│ │ +251 9xx xxx xxx            │ │
│ └─────────────────────────────┘ │
│                                 │
│ Country                         │
│ ┌─────────────────────────────┐ │
│ │ Ethiopia                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Default Currency                │
│ ┌─────────────────────────────┐ │
│ │ USD                         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [← Back]  [Create Account →]    │
└─────────────────────────────────┘
```

### Step 4: Email Confirmation

```
Progress: ●───●───●───● (100%)

┌─────────────────────────────────┐
│         ┌───────┐               │
│         │  📧   │               │
│         └───────┘               │
│                                 │
│    Check your email             │
│                                 │
│ We sent a confirmation link to  │
│ you@example.com                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ℹ️ Click the link in the    │ │
│ │   email to confirm your     │ │
│ │   account and sign in.      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Didn't receive the email?       │
│ Check your spam folder or       │
│ click below to resend.          │
│                                 │
│ [Resend Confirmation Email]     │
└─────────────────────────────────┘
```

## Google Account Merging Flow

### Scenario 1: Email Match ✅

```
User enters: john@gmail.com
Clicks: "Link with Google Account"
Google popup: john@gmail.com

Result:
┌─────────────────────────────────┐
│ ✅ Success!                     │
│                                 │
│ Google account linked           │
│ successfully! You can now use   │
│ Google Sign-In.                 │
│                                 │
│ [Advancing to next step...]     │
└─────────────────────────────────┘
```

### Scenario 2: Email Mismatch ❌

```
User enters: john@gmail.com
Clicks: "Link with Google Account"
Google popup: jane@gmail.com

Result:
┌─────────────────────────────────┐
│ ❌ Email Mismatch               │
│                                 │
│ Google account email            │
│ (jane@gmail.com) doesn't match  │
│ the entered email               │
│ (john@gmail.com).               │
│                                 │
│ Please use the same email or    │
│ try again.                      │
│                                 │
│ [Try Again]                     │
└─────────────────────────────────┘
```

## Progress Indicator States

### Step 1 Active
```
●───○───○───○
1   2   3   4
↑ Active (gold circle)
```

### Step 2 Active
```
✓───●───○───○
1   2   3   4
↑   ↑
│   Active (gold circle)
Completed (checkmark)
```

### Step 3 Active
```
✓───✓───●───○
1   2   3   4
        ↑
        Active (gold circle)
```

### Step 4 Complete
```
✓───✓───✓───●
1   2   3   4
            ↑
            Active (gold circle)
```

## Button States

### Next Button
```
Normal:     [Next →]           (Gold background)
Hover:      [Next →]           (Slightly transparent)
Loading:    [⟳ Please wait…]   (Disabled, spinner)
Disabled:   [Next →]           (Faded, not clickable)
```

### Back Button
```
Normal:     [← Back]           (Gray background)
Hover:      [← Back]           (White background)
Hidden:     (Not shown on step 1)
```

### Create Account Button
```
Normal:     [Create Account →]     (Gold background)
Loading:    [⟳ Creating account…]  (Disabled, spinner)
```

## Validation Messages

### Success Messages
```
┌─────────────────────────────────┐
│ ✓ Username is available         │
└─────────────────────────────────┘
(Green text, small font)
```

### Error Messages
```
┌─────────────────────────────────┐
│ ❌ Username is already taken    │
└─────────────────────────────────┘
(Red text, small font)
```

### Info Messages
```
┌─────────────────────────────────┐
│ ℹ️ Username must be at least    │
│   3 characters                  │
└─────────────────────────────────┘
(Gray text, small font)
```

## Mode Toggle Button

### Classic Mode (Default)
```
┌─────────────────────┐
│ 🧙 Try Wizard Mode  │
└─────────────────────┘
(Top-right corner, gold border)
```

### Wizard Mode (Active)
```
┌─────────────────────┐
│ 📋 Classic Mode     │
└─────────────────────┘
(Top-right corner, gold border)
```

## Mobile View

```
┌─────────────────────┐
│ [🧙 Wizard Mode]    │
│                     │
│ ●───●───○───○       │
│ 1   2   3   4       │
│                     │
│ Create Your Account │
│                     │
│ Email Address *     │
│ ┌─────────────────┐ │
│ │ you@example.com │ │
│ └─────────────────┘ │
│                     │
│ [Next →]            │
│                     │
│ (Left panel hidden) │
└─────────────────────┘
```

## Color Palette

```
Primary Gold:    ████ #f59e0b (oklch(0.7686 0.1647 70.0804))
Success Green:   ████ oklch(0.74 0.14 151)
Error Red:       ████ oklch(0.6368 0.2078 25.3313)
Muted Gray:      ████ oklch(0.5510 0.0234 264.3637)
Background:      ████ oklch(1.0000 0 0) / oklch(0.2046 0 0)
Border:          ████ oklch(0.9276 0.0058 264.5313)
```

## Typography

```
Headings:        Cormorant Garamond (serif)
                 Font Size: 2rem (32px)
                 Font Weight: 300 (light)

Body Text:       JetBrains Mono (monospace)
                 Font Size: 0.72rem (11.5px)
                 Font Weight: 400 (regular)

Labels:          JetBrains Mono (monospace)
                 Font Size: 0.57rem (9px)
                 Letter Spacing: 0.12em
                 Text Transform: UPPERCASE
```

## Animations

### Step Transition
```
From: opacity: 0, translateY(10px)
To:   opacity: 1, translateY(0)
Duration: 0.3s
Easing: ease
```

### Progress Bar Fill
```
Property: width
From: 0%
To: 25% / 50% / 75% / 100%
Duration: 0.4s
Easing: ease
```

### Button Hover
```
Transform: translateY(-1px)
Opacity: 0.88
Duration: 0.2s
```

## Accessibility

### Keyboard Navigation
- **Tab**: Move between fields
- **Enter**: Advance to next step
- **Shift+Tab**: Move backwards
- **Escape**: Close popups

### Screen Reader Support
- Progress indicator has aria-labels
- Form fields have proper labels
- Error messages have role="alert"
- Loading states announced

### Focus States
```
Input Focus:     Gold border (2px)
Button Focus:    Gold outline (2px)
Link Focus:      Gold underline
```

## Responsive Breakpoints

```
Desktop:   > 768px   (Split-screen layout)
Tablet:    768px     (Adjusted padding)
Mobile:    < 768px   (Single column, left panel hidden)
```

---

**Visual Guide Version**: 1.0.0  
**Last Updated**: April 26, 2026  
**For**: Trackly Wizard Mode Implementation
