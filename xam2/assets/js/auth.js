// Line 1: Function to sign up a user
function signup() {
    // Line 2-4: Get the values from the sign-up form
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
  
    // Line 5-6: Load existing users from localStorage (or start with an empty list)
    let users = JSON.parse(localStorage.getItem('users')) || [];
  
    // Line 7-9: Check if the username is already taken
    if (users.some(user => user.username === username)) {
      alert('Username already taken!');
      return;
    }
  
    // Line 10-13: Create a new user and save it
    const user = { username, password, role, id: Date.now() }; // Unique ID with timestamp
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    // Line 14-15: Show pop-up and redirect after
    alert('Sign Up Successful!');
    window.location.href = 'signin.html';
  }
  
  // Line 16: Function to sign in a user
  function signin() {
    // Line 17-19: Get the values from the sign-in form
    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;
    const errorMessage = document.getElementById('error-message');
  
    // Line 20-21: Load users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
  
    // Line 22-26: Check if the username and password match
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
      errorMessage.textContent = 'Wrong username or password!';
      return;
    }
  
    // Line 27-31: Save the current user and redirect to their dashboard
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.role === 'teacher') {
      window.location.href = 'teacher-dashboard.html';
    } else if (user.role === 'student') {
      window.location.href = 'student-dashboard.html';
    }
  }

  function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }