import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get values from the form
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Check for Terms Agreement
    const agreeTerms = document.getElementById('agreeTerms').checked;

    const errorBox = document.getElementById('error-msg');
    const successBox = document.getElementById('success-msg');

    // Reset messages
    errorBox.style.display = 'none';
    successBox.style.display = 'none';

    // Validation
    if (!agreeTerms) {
        errorBox.innerText = "You must agree to the Terms of Use & Privacy Policy.";
        errorBox.style.display = 'block';
        return;
    }

    try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Auth Profile (Display Name)
        await updateProfile(user, { displayName: username });

        // 3. Send Verification Email
        await sendEmailVerification(user);

        // 4. Create User Document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            
            // --- CHANGE WAS MADE HERE ---
            name: username,  // Saved as 'name' to match register.html
            // ----------------------------
            
            email: email,
            role: 'student', 
            
            // Timestamps
            created_at: new Date(),
            lastLogin: new Date(),

            // Legal & Status
            agreedToTerms: true,
            agreedAt: new Date(),
            isVerified: false,
            profileSetup: false,

            // Empty fields for future
            stream: "", 
            degree: "", 
            location: "", 
            admissionYear: "",
            savedColleges: []
        });

        // 5. Success Message & Sign Out
        await signOut(auth); 
        
        successBox.innerText = `Account created! Verification email sent to ${email}. Please check your inbox.`;
        successBox.style.display = 'block';
        
        // Redirect to Login after delay
        setTimeout(() => { window.location.href = "login.html"; }, 3000);

    } catch (error) {
        let msg = error.message;
        if(msg.includes("email-already-in-use")) msg = "This email is already registered.";
        errorBox.innerText = msg;
        errorBox.style.display = 'block';
    }
});