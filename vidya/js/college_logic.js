import { db, auth } from './firebase-config.js';
import { doc, getDoc, setDoc, deleteDoc, collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
const colId = params.get('id');
let collegeData = null;

// 1. Load College Data
async function loadCollege() {
    if (!colId) {
        document.getElementById('loading').innerText = "Error: No college ID provided.";
        return;
    }
    
    try {
        const snap = await getDoc(doc(db, "colleges", colId));
        
        if (snap.exists()) {
            collegeData = snap.data();
            
            // Basic Info
            document.getElementById('cName').innerText = collegeData.name;
            document.getElementById('cDesc').innerText = collegeData.description;
            document.getElementById('cLoc').innerText = collegeData.district || 'Kerala';
            document.getElementById('cRating').innerText = (collegeData.rating || '0') + " ★";
            document.getElementById('cLogo').src = collegeData.logo || 'assets/default-college.png';
            
            // LOGIC: Only show ranking if it exists
            if (collegeData.ranking && collegeData.ranking.trim() !== "") {
                document.getElementById('cRank').innerText = collegeData.ranking;
                document.getElementById('cRankWrapper').style.display = 'inline';
            } else {
                document.getElementById('cRankWrapper').style.display = 'none';
            }

            // Expanded Details
            document.getElementById('cElig').innerText = collegeData.eligibility || 'Contact college';
            document.getElementById('cAdmin').innerText = collegeData.admission_process || 'Contact college';
            document.getElementById('cPlace').innerText = collegeData.placement_info || 'Not listed';
            document.getElementById('cSeats').innerText = collegeData.seats_offered || 'Not listed';
            document.getElementById('cCourseSummary').innerText = collegeData.courses_summary || '';
            document.getElementById('cInstType').innerText = collegeData.institution_type || '-';
            document.getElementById('cEduMode').innerText = collegeData.education_mode || '-';
            
            // Contact
            const setLink = (id, url) => {
                const el = document.getElementById(id);
                if(url && url.trim() !== '') { el.href = url; } 
                else { el.removeAttribute('href'); el.style.textDecoration='none'; el.style.color='gray'; el.innerText='Not available'; }
            };
            setLink('cWeb', collegeData.website);
            setLink('cSocial', collegeData.social_link);
            
            document.getElementById('cPhone').innerText = collegeData.phone || 'Not available';
            document.getElementById('cEmail').innerText = collegeData.email || 'Not available';

            // Facilities (Split by comma if it's a string, or handle as string)
            const facList = document.getElementById('cFacil');
            let facs = collegeData.facilities || "Not listed";
            // If it's a long string with commas, split it
            if (facs.includes(',')) {
                facs.split(',').forEach(f => facList.innerHTML += `<li class="fac-item">${f.trim()}</li>`);
            } else {
                facList.innerHTML = `<li class="fac-item">${facs}</li>`;
            }

            // Hero Media
            const mediaContainer = document.getElementById('mediaContainer');
            if (collegeData.video) {
                mediaContainer.innerHTML = `<video autoplay muted loop playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.6;"><source src="${collegeData.video}" type="video/mp4"></video>`;
            } else {
                // If specific background images exist, use the first one, otherwise default
                let bgImg = 'assets/bg.jpg';
                if(collegeData.images && collegeData.images.length > 0) bgImg = collegeData.images[0];
                mediaContainer.innerHTML = `<img class="bg-img" src="${bgImg}">`;
            }

            // Gallery
            if (collegeData.images && collegeData.images.length > 0) {
                document.getElementById('gallerySection').style.display = 'block';
                const gGrid = document.getElementById('galleryGrid');
                collegeData.images.forEach(imgUrl => {
                    gGrid.innerHTML += `<img src="${imgUrl}" class="gallery-img" onclick="window.open('${imgUrl}')">`;
                });
            }

            // Show Content
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'flex';
            
            // Trigger Sub-loaders
            loadCourses();
            loadReviews();
            
        } else {
            document.getElementById('loading').innerText = "College not found.";
        }
    } catch (e) {
        console.error(e);
        document.getElementById('loading').innerText = "Error loading data.";
    }
}

// 2. Load Courses (Subjects List)
async function loadCourses() {
    const container = document.getElementById('coursesContainer');
    // We check the 'subjects' collection for this college's course offerings if you structured it that way
    // But mostly you might just use the summary from the college doc for now.
    // For specific subjects, we query the 'subjects' collection.
    // This part can remain simple for now unless you added a 'courses' subcollection.
}

// 3. Load Reviews
async function loadReviews() {
    const list = document.getElementById('reviews-list');
    const q = query(collection(db, "reviews"), where("college_id", "==", colId), orderBy("date", "desc"));
    const snap = await getDocs(q);
    
    list.innerHTML = "";
    if (snap.empty) {
        list.innerHTML = "<p>No reviews yet.</p>";
        return;
    }
    snap.forEach(doc => {
        const r = doc.data();
        list.innerHTML += `
            <div class="review-item">
                <div class="review-head"><strong>${r.user_name}</strong> <span class="rev-stars">${'★'.repeat(r.rating)}</span></div>
                <p style="margin:5px 0;">${r.text}</p>
            </div>`;
    });
}

// 4. Submit Review
window.submitReview = async function() {
    if (!auth.currentUser) {
        alert("Please login to write a review.");
        window.location.href = "login.html";
        return;
    }
    const txt = document.getElementById('revText').value;
    if(!txt) return alert("Write something!");
    
    await addDoc(collection(db, "reviews"), {
        college_id: colId,
        user_name: auth.currentUser.displayName || "User",
        text: txt,
        rating: parseInt(document.getElementById('revRating').value),
        date: new Date()
    });
    alert("Review submitted!");
    location.reload();
}

// 5. Favorites
const favBtn = document.getElementById('favBtn');
onAuthStateChanged(auth, async (user) => {
    if (user && colId) {
        const favRef = doc(db, "users", user.uid, "favorites", colId);
        const snap = await getDoc(favRef);
        if (snap.exists()) {
            favBtn.innerText = "❤️ Remove Favorite";
            favBtn.style.color = "#ff2c92";
            favBtn.style.background = "white";
        }
    }
});

favBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return alert("Login required");
    
    const favRef = doc(db, "users", user.uid, "favorites", colId);
    if (favBtn.innerText.includes("Remove")) {
        await deleteDoc(favRef);
        favBtn.innerText = "🤍 Add to Favorites";
        favBtn.style.color = "white";
        favBtn.style.background = "rgba(255,255,255,0.2)";
    } else {
        await setDoc(favRef, {
            name: collegeData.name,
            logo: collegeData.logo || '',
            location: collegeData.district || ''
        });
        favBtn.innerText = "❤️ Remove Favorite";
        favBtn.style.color = "#ff2c92";
        favBtn.style.background = "white";
    }
});

loadCollege();