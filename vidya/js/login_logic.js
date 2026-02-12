import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Updated ID from 'identifier' to 'email' to match new HTML
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorBox = document.getElementById('errorMsg'); // Updated ID match

    errorBox.style.display = 'none';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Optional: Block login if email is not verified
        if (!userCredential.user.emailVerified) {
             throw new Error("Please verify your email before logging in.");
        }

        window.location.href = "index.html";
    } catch (error) {
        errorBox.innerText = error.message;
        errorBox.style.display = 'block';
    }
});