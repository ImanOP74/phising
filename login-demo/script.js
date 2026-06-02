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
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    triggerHaptic();
    
    // Blur inputs to hide keyboard on mobile
    document.activeElement.blur();
    
    // Transition to loading screen
    loginScreen.classList.add('exit');
    
    setTimeout(() => {
      loginScreen.classList.add('hidden');
      loadingScreen.classList.remove('hidden');
      
      // Simulate network request (2-3 seconds for realistic loading)
      const delay = Math.floor(Math.random() * 1000) + 2000;
      
      setTimeout(() => {
        // Transition to success screen
        loadingScreen.classList.add('exit');
        
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          successScreen.classList.remove('hidden');
          triggerHaptic();
        }, 320); // Wait for exit animation
        
      }, delay);
      
    }, 320);
  });
});
