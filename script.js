// Password visibility toggle
document.addEventListener('DOMContentLoaded', function() {
  const togglePassword = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('password');
  const visibilityIcon = togglePassword ? togglePassword.querySelector('.material-symbols-outlined') : null;
  
  // Handle "Remember Me" functionality
  const rememberMeCheckbox = document.querySelector('.ui-bookmark input');
  const emailInput = document.getElementById('email');
  
  // Check if user's email is stored
  if (emailInput) {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      emailInput.value = rememberedEmail;
      // If email is remembered, focus on password field
      const passwordInput = document.getElementById('password');
      if (passwordInput) {
        passwordInput.focus();
      }
    }
  }
  
  if (togglePassword && passwordInput && visibilityIcon) {
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle icon
      if (type === 'password') {
        visibilityIcon.textContent = 'visibility';
      } else {
        visibilityIcon.textContent = 'visibility_off';
      }
    });
  }
  
  // Handle form submission for sign in button
  const signInBtn = document.getElementById('signInBtn');
  if (signInBtn) {
    signInBtn.addEventListener('click', function() {
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const rememberMeCheckbox = document.querySelector('.ui-bookmark input');
      
      const email = emailInput.value;
      const password = passwordInput.value;
      
      // Validate inputs
      if (!email || !password) {
        showPopup('Please provide both your email address and password to continue.', 'Authentication Required');
        return;
      }
      
      // Handle "Remember Me" functionality
      if (rememberMeCheckbox && rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Show animation and process authentication
      showAnimationAndAuthenticate(email, password);
    });
    
    // Also handle Enter key press
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        signInBtn.click();
      });
    }
  }
  
  // Handle Google Sign In
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', function() {
      // Show animation immediately when Google sign in is clicked
      showAnimationAndAuthenticateWithGoogle();
    });
  }
  
  // Handle Forgot Password link
  const forgotPasswordLink = document.querySelector('.forgot-password-link');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(event) {
      event.preventDefault();
      
      // Get the email from the email input field
      const emailInput = document.getElementById('email');
      const email = emailInput ? emailInput.value.trim() : '';
      
      // Validate email
      if (!email) {
        showPopup('Please enter your email address in the email field first.', 'Email Required');
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showPopup('Please enter a valid email address.', 'Invalid Email');
        return;
      }
      
      // Send password reset email
      sendPasswordResetEmail(email);
    });
  }
});

// Show animation and authenticate with email/password
function showAnimationAndAuthenticate(email, password) {
  // Show the animation overlay
  const animationOverlay = document.getElementById('animationOverlay');
  if (animationOverlay) {
    animationOverlay.style.display = 'flex';
  }
  
  // Process authentication after a short delay to show animation
  setTimeout(() => {
    processAuthentication(email, password);
  }, 3000);
}

// Show animation and authenticate with Google
function showAnimationAndAuthenticateWithGoogle() {
  // Show the animation overlay
  const animationOverlay = document.getElementById('animationOverlay');
  if (animationOverlay) {
    animationOverlay.style.display = 'flex';
  }
  
  // Process Google authentication after a short delay to show animation
  setTimeout(() => {
    processGoogleAuthentication();
  }, 3000);
}

// Send password reset email
async function sendPasswordResetEmail(email) {
  // Check if we have Firebase auth available
  if (typeof window.firebaseAuth !== 'undefined' && window.firebaseAuth !== null) {
    try {
      // Dynamically import the required Firebase auth functions
      const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js");
      
      const auth = window.firebaseAuth;
      
      // Send password reset email
      sendPasswordResetEmail(auth, email)
        .then(() => {
          showPopup(`Password reset email sent to ${email}. Please check your inbox.`, 'Email Sent');
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          
          // Handle specific error codes
          if (errorCode === 'auth/user-not-found') {
            showPopup('No account found with this email address.', 'Email Not Found');
          } else {
            showPopup(`Failed to send password reset email: ${errorMessage}`, 'Reset Failed');
          }
        });
    } catch (error) {
      console.error('Failed to import Firebase auth:', error);
      showPopup(`Password reset service unavailable: ${error.message}`, 'Service Error');
    }
  } else {
    // Fallback behavior
    console.log('Firebase not available, using fallback');
    showPopup(`Password reset email would be sent to ${email} in a real implementation.`, 'Email Sent (Demo)');
  }
}

// Process email/password authentication
async function processAuthentication(email, password) {
  // Check if we have Firebase auth available
  if (typeof window.firebaseAuth !== 'undefined' && window.firebaseAuth !== null) {
    try {
      // Dynamically import the required Firebase auth functions
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js");
      
      const auth = window.firebaseAuth;
      
      // Attempt to sign in with Firebase
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Authentication successful - redirect to home page
          console.log('User signed in:', userCredential.user.email);
          window.location.href = 'home.html';
        })
        .catch((error) => {
          // Hide animation overlay
          const animationOverlay = document.getElementById('animationOverlay');
          if (animationOverlay) {
            animationOverlay.style.display = 'none';
          }
          
          const errorCode = error.code;
          const errorMessage = error.message;
          
          // If user doesn't exist, try to create account
          if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
            createUserWithEmailAndPassword(auth, email, password)
              .then((userCredential) => {
                // Account created - redirect to home page
                console.log('User account created:', userCredential.user.email);
                window.location.href = 'home.html';
              })
              .catch((createError) => {
                const createErrorCode = createError.code;
                const createErrorMessage = createError.message;
                showPopup(`Account creation failed: ${createErrorMessage}`, 'Registration Error');
              });
          } else {
            showPopup(`Unable to authenticate: ${errorMessage}`, 'Authentication Failed');
          }
        });
    } catch (error) {
      // Hide animation overlay
      const animationOverlay = document.getElementById('animationOverlay');
      if (animationOverlay) {
        animationOverlay.style.display = 'none';
      }
      
      console.error('Failed to import Firebase auth:', error);
      showPopup(`Authentication service unavailable: ${error.message}`, 'Service Error');
    }
  } else {
    // Fallback to original behavior if Firebase is not available
    // Redirect to home page
    console.log('Firebase not available, using fallback - will redirect anyway');
    window.location.href = 'home.html';
  }
}

// Process Google authentication
async function processGoogleAuthentication() {
  // Check if we have Firebase auth and Google provider available
  if (typeof window.firebaseAuth !== 'undefined' && window.firebaseAuth !== null && 
      typeof window.googleProvider !== 'undefined' && window.googleProvider !== null) {
    try {
      // Dynamically import the required Firebase auth functions
      const { signInWithPopup, GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js");
      
      const auth = window.firebaseAuth;
      const provider = window.googleProvider;
      
      // Attempt to sign in with Google
      signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          
          // Authentication successful - redirect to home page
          console.log('User signed in with Google:', user.email);
          window.location.href = 'home.html';
        })
        .catch((error) => {
          // Hide animation overlay
          const animationOverlay = document.getElementById('animationOverlay');
          if (animationOverlay) {
            animationOverlay.style.display = 'none';
          }
          
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          
          console.error('Google sign in error:', errorCode, errorMessage);
          showPopup(`Google authentication failed: ${errorMessage}`, 'Social Login Error');
        });
    } catch (error) {
      // Hide animation overlay
      const animationOverlay = document.getElementById('animationOverlay');
      if (animationOverlay) {
        animationOverlay.style.display = 'none';
      }
      
      console.error('Failed to import Firebase auth:', error);
      showPopup(`Google authentication service unavailable: ${error.message}`, 'Social Login Error');
    }
  } else {
    // Hide animation overlay
    const animationOverlay = document.getElementById('animationOverlay');
    if (animationOverlay) {
      animationOverlay.style.display = 'none';
    }
    
    console.log('Firebase or Google provider not available');
    showPopup('Google authentication is temporarily unavailable. Please try again later.', 'Service Unavailable');
  }
}

// Show popup function
function showPopup(message = 'You have been successfully authenticated and logged into your account.', title = 'Authentication Successful') {
  // Remove any existing popup
  const existingPopup = document.querySelector('.popup-overlay');
  if (existingPopup) {
    document.body.removeChild(existingPopup);
  }
  
  // Create popup elements
  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'popup-overlay';
  
  const popupContent = document.createElement('div');
  popupContent.className = 'popup-content';
  
  const popupHeader = document.createElement('div');
  popupHeader.className = 'popup-header';
  
  const popupTitle = document.createElement('div');
  popupTitle.className = 'popup-title';
  popupTitle.textContent = title;
  
  const popupClose = document.createElement('button');
  popupClose.className = 'popup-close';
  popupClose.innerHTML = '&times;';
  
  const popupBody = document.createElement('div');
  popupBody.className = 'popup-body';
  popupBody.textContent = message;
  
  const popupFooter = document.createElement('div');
  popupFooter.className = 'popup-footer';
  
  const confirmButton = document.createElement('button');
  confirmButton.className = 'popup-button confirm';
  confirmButton.textContent = 'Continue';
  
  // Assemble popup
  popupHeader.appendChild(popupTitle);
  popupHeader.appendChild(popupClose);
  popupFooter.appendChild(confirmButton);
  popupContent.appendChild(popupHeader);
  popupContent.appendChild(popupBody);
  popupContent.appendChild(popupFooter);
  popupOverlay.appendChild(popupContent);
  document.body.appendChild(popupOverlay);
  
  // Show popup
  popupOverlay.style.display = 'flex';
  
  // Close popup events
  popupClose.addEventListener('click', function() {
    document.body.removeChild(popupOverlay);
  });
  
  confirmButton.addEventListener('click', function() {
    document.body.removeChild(popupOverlay);
  });
  
  popupOverlay.addEventListener('click', function(e) {
    if (e.target === popupOverlay) {
      document.body.removeChild(popupOverlay);
    }
  });
}