// File: load-colleges.js
import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. LISTEN FOR LOGIN (To get user name and preferences)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // A. Update "Hello, Name" in Header
        const displayName = user.email.split('@')[0];
        const nameElement = document.getElementById('user-display-name');
        if(nameElement) nameElement.innerText = displayName;

        // B. Load User Preferences
        await loadUserPreferences(user.uid);
    } else {
        // Not logged in? Redirect to login
        window.location.href = "login.html";
    }
});

// 2. LOAD PREFERENCES FUNCTION
async function loadUserPreferences(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Helper to set text safely
            const setText = (id, val) => {
                const el = document.getElementById(id);
                if(el) {
                    el.innerText = val || "Not set";
                    // If "Not set", keep it gray. If set, make it black/bold
                    if(val) el.classList.remove('not-set');
                }
            };

            setText('pref-stream', data.stream);
            setText('pref-programme', data.degree); // assuming you saved it as 'degree' or 'programme'
            setText('pref-location', data.location);
            setText('pref-admission', data.admissionYear);
            setText('pref-mode', data.mode);
            setText('pref-type', data.type);
        }
    } catch (error) {
        console.error("Error loading prefs:", error);
    }
}

// 3. LOAD COLLEGES FUNCTION (Runs automatically)
async function loadColleges() {
    const listContainer = document.getElementById('college-list');
    
    try {
        const querySnapshot = await getDocs(collection(db, "colleges"));
        
        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p style="padding:20px;">No colleges found. Admin needs to add data.</p>';
            return;
        }

        // Clear "Loading..." text
        listContainer.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Create the Blue Card
            const card = document.createElement('div');
            card.className = 'college-card';
            
            // You can customize this HTML to match your design perfectly
            card.innerHTML = `
                <h3 style="margin:0 0 10px; font-size:1.2rem;">${data.name}</h3>
                <p style="margin:0; font-size:0.9rem; opacity:0.9;">${data.location}</p>
                <div style="margin-top:15px;">
                    <a href="${data.website}" target="_blank" style="color:white; text-decoration:underline; font-size:0.85rem;">Visit Website</a>
                </div>
            `;
            
            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading colleges:", error);
        listContainer.innerHTML = '<p style="color:red; padding:20px;">Error loading data.</p>';
    }
}

// Start loading colleges immediately (don't wait for login)
loadColleges();