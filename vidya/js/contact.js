import { db } from "./firebase-config.js"; // Adjust path to your Firebase config file
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get values from the form
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        try {
            // Add a new document to a "contactMessages" collection
            await addDoc(collection(db, "contactMessages"), {
                name: name,
                email: email,
                message: message,
                submittedAt: serverTimestamp()
            });

            alert("Thank you! Your message has been sent successfully.");
            contactForm.reset(); // Clear the form
            
        } catch (error) {
            console.error("Error adding message: ", error);
            alert("Oops! Something went wrong. Please try again later.");
        }
    });
}