import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBt5DvViwm5ls_B4CWKYIYhMutJJ9opw_Y",
    authDomain: "vidyaproject-c4a1d.firebaseapp.com",
    projectId: "vidyaproject-c4a1d",
    storageBucket: "vidyaproject-c4a1d.firebasestorage.app",
    messagingSenderId: "637214484165",
    appId: "1:637214484165:web:f23e84c08cd6069f6fb2ac",
    measurementId: "G-647MPHBDGW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const favGrid = document.getElementById('favGrid');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        loadFavorites(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

async function loadFavorites(uid) {
    try {
        const querySnapshot = await getDocs(collection(db, "users", uid, "favorites"));
        
        if (querySnapshot.empty) {
            favGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <i class="far fa-heart fa-3x" style="color: #e0e0e0; margin-bottom: 20px;"></i>
                    <h3 style="color: #888;">No favorites yet</h3>
                    <p style="color: #aaa;">Go explore colleges and click the heart icon!</p>
                    <a href="index.html" style="display:inline-block; margin-top:10px; color:#6e1bd6; font-weight:bold;">Explore Now</a>
                </div>`;
            return;
        }

        favGrid.innerHTML = ""; 
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const finalId = data.collegeId || docSnap.id; 
            const name = data.name || "Unknown";
            const loc = data.location || "Kerala";
            const logo = data.logo || "assets/default-college.png";

            const card = document.createElement('div');
            // IMPORTANT: We use the exact class names defined in favorites.html CSS
            card.className = 'college-card'; 
            
            card.innerHTML = `
                <button class="btn-remove" onclick="removeFavorite('${uid}', '${docSnap.id}', this)" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${logo}" alt="Logo">
                <h3>${name}</h3>
                <p>${loc}</p>
                <a href="college.html?id=${finalId}" class="view-btn">View Details</a>
            `;
            favGrid.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

// Global Remove Function
window.removeFavorite = async function(uid, docId, btn) {
    if(!confirm("Remove from favorites?")) return;
    try {
        await deleteDoc(doc(db, "users", uid, "favorites", docId));
        // Remove from UI with animation
        const card = btn.closest('.college-card');
        card.style.transform = "scale(0)";
        setTimeout(() => card.remove(), 300);
    } catch(e) {
        alert("Error removing: " + e.message);
    }
};