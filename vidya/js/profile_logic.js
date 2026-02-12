import { db, auth } from './firebase-config.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let currentUserUid = null;

// 1. Load User Data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUid = user.uid;
        const docRef = doc(db, "users", currentUserUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('firstName').value = data.first_name || '';
            document.getElementById('lastName').value = data.last_name || '';
            document.getElementById('stream').value = data.stream || '';
            document.getElementById('programme').value = data.programme || '';
            document.getElementById('location').value = data.preferred_location || '';
            document.getElementById('year').value = data.admission_year || '';
            document.getElementById('eduMode').value = data.education_mode || '';
            document.getElementById('eduType').value = data.education_type || '';
        }
    } else {
        window.location.href = "login.html"; // Redirect if not logged in
    }
});

// 2. Save User Data
window.saveProfile = async function() {
    if (!currentUserUid) return;
    
    const msg = document.getElementById('msg');
    msg.innerText = "Saving...";
    msg.style.color = "blue";

    const profileData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        stream: document.getElementById('stream').value,
        programme: document.getElementById('programme').value,
        preferred_location: document.getElementById('location').value,
        admission_year: document.getElementById('year').value,
        education_mode: document.getElementById('eduMode').value,
        education_type: document.getElementById('eduType').value,
        updated_at: new Date()
    };

    try {
        // 'setDoc' with merge:true updates existing fields without deleting others
        await setDoc(doc(db, "users", currentUserUid), profileData, { merge: true });
        msg.innerText = "Profile Updated Successfully!";
        msg.style.color = "green";
    } catch (error) {
        msg.innerText = "Error: " + error.message;
        msg.style.color = "red";
    }
}