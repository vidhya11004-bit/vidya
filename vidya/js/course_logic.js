// 1. IMPORT FIREBASE DIRECTLY (No local config file needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. CONFIGURATION (Copied from your Admin page)
const firebaseConfig = {
    apiKey: "AIzaSyBt5DvViwm5ls_B4CWKYIYhMutJJ9opw_Y",
    authDomain: "vidyaproject-c4a1d.firebaseapp.com",
    projectId: "vidyaproject-c4a1d",
    storageBucket: "vidyaproject-c4a1d.firebasestorage.app",
    messagingSenderId: "637214484165",
    appId: "1:637214484165:web:f23e84c08cd6069f6fb2ac",
    measurementId: "G-647MPHBDGW"
};

// 3. INITIALIZE APP
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. GET URL PARAMETERS
const params = new URLSearchParams(window.location.search);
let rawCode = params.get('c') || params.get('course') || 'bca';
const currentSem = parseInt(params.get('sem')) || 1;

// 5. SMART FIX: Map 'bcom' (URL) to 'B.Com' (Database)
// This fixes the "Loading" issue caused by capitalization mismatch
const courseMap = {
    'bcom': 'B.Com',
    'bca': 'BCA',
    'bba': 'BBA',
    'mba': 'MBA',
    'mca': 'MCA',
    'mcom': 'M.Com'
};

// Use the mapped name if it exists, otherwise use the raw code
const dbCourseName = courseMap[rawCode.toLowerCase()] || rawCode;

// 6. UPDATE UI TITLE
document.getElementById('courseTitle').innerText = dbCourseName + " Study Materials";

// 7. GENERATE SEMESTER LINKS
const totalSems = ['mba', 'mca', 'mcom'].includes(rawCode.toLowerCase()) ? 4 : 6;
const nav = document.getElementById('semNav');
nav.innerHTML = ''; 

for (let i = 1; i <= totalSems; i++) {
    const a = document.createElement('a');
    a.innerText = `Semester ${i}`;
    a.className = `sem-link ${currentSem === i ? 'active' : ''}`;
    // Keep URL simple (lowercase)
    a.href = `course.html?c=${rawCode.toLowerCase()}&sem=${i}`;
    nav.appendChild(a);
}

// 8. LOAD DATA
async function loadSubjects() {
    const grid = document.getElementById('subjectGrid');
    
    console.log(`Searching DB for: Course="${dbCourseName}", Sem=${currentSem}`); // Debugging Log

    const q = query(
        collection(db, "content_hub_materials"), 
        where("course_code", "==", dbCourseName), 
        where("semester", "==", currentSem)
    );
    
    try {
        const snap = await getDocs(q);
        grid.innerHTML = "";
        
        if (snap.empty) {
            grid.innerHTML = `<div style="text-align:center; width:100%; padding:20px;">
                <h3 style="color:#666;">No materials found.</h3>
                <p>We looked for <b>${dbCourseName}</b> (Semester ${currentSem}).</p>
                <p>Check back later!</p>
            </div>`;
            return;
        }

        snap.forEach(doc => {
            const data = doc.data();
            
            grid.innerHTML += `
                <div class="sub-card">
                    <small style="color:#ff2c92; font-weight:bold;">${data.subject_name || 'Subject'}</small>
                    <h3 style="margin: 10px 0;">${data.title}</h3>
                    
                    <a href="${data.file_path}" target="_blank" 
                       style="display:block; text-align:center; padding:10px; background:#6e1bd6; color:white; text-decoration:none; border-radius:5px; margin-top:10px;">
                       <i class="fas fa-file-pdf"></i> View Material
                    </a>
                </div>`;
        });
    } catch (e) {
        console.error("Firebase Error:", e);
        grid.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
}

loadSubjects();