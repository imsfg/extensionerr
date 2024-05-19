document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the sign-up form
    document.getElementById('sign-up-form').addEventListener('submit', signUp);
  
   
  });
  
  // Function to handle sign-up logic
  function signUp(event) {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Perform sign-up API call
    // Replace this with your actual sign-up API call
    fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = 'login.html';
    })
    .catch(error => {
      console.error('Sign-up failed:', error);
      // Handle sign-up error (display message to user, etc.)
    });
  }
  
  // Function to handle sign-out logic
  function signOut() {
    // Update the login status in Chrome storage
    chrome.storage.sync.set({ loggedIn: false }, function() {
      console.log('User signed out');
      // Close the popup window
      window.close();
    });
  }
  