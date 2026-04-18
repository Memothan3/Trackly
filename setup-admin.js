// Admin Setup Configuration Script
// Run this in your browser console to automatically configure admin email

function setupAdmin() {
  const email = prompt("Enter your email address for admin access:");
  
  if (!email || !email.includes('@')) {
    alert("Please enter a valid email address");
    return;
  }
  
  console.log("Setting up admin access for:", email);
  
  // Instructions for manual setup
  const instructions = `
ADMIN SETUP INSTRUCTIONS:

1. In trackly_dashboard.html, find line ~1684 and change:
   email: "your-email@gmail.com"
   TO:
   email: "${email}"

2. In auth_fixed.html, find line ~518 and change:
   const isAdminUser = email === "your-email@gmail.com";
   TO:
   const isAdminUser = email === "${email}";

3. In auth_fixed.html, find line ~1010 and change:
   const isAdminUser = user.email === "your-email@gmail.com";
   TO:
   const isAdminUser = user.email === "${email}";

4. Save both files and refresh the page

5. Go to auth_fixed.html and sign up with email: ${email}
   (No email verification required for admin accounts)

6. Sign in to access admin features!
  `;
  
  console.log(instructions);
  alert("Setup instructions logged to console. Check the console for details.");
  
  // Try to copy to clipboard if possible
  if (navigator.clipboard) {
    navigator.clipboard.writeText(instructions).then(() => {
      console.log("Instructions copied to clipboard!");
    }).catch(() => {
      console.log("Could not copy to clipboard, but instructions are above.");
    });
  }
}

// Auto-run if this script is loaded
console.log("Admin Setup Script Loaded");
console.log("Run setupAdmin() to configure your admin email");

// Uncomment the line below to auto-run the setup
// setupAdmin();