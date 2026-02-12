import { db } from './firebase-config.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const subjectId = params.get('subject_id');
<script type="module" src="js/materials_logic.js"></script>
async function loadMaterials() {
    if (!subjectId) {
        document.body.innerHTML = "<h1>Error: No Subject ID Provided</h1>";
        return;
    }

    // A. Fetch Subject Details
    const subDocRef = doc(db, "subjects", subjectId);
    const subSnap = await getDoc(subDocRef);

    if (subSnap.exists()) {
        const subData = subSnap.data();
        document.getElementById('subName').innerText = subData.subject_name;
        document.getElementById('subMeta').innerText = `${subData.subject_code || ''} — Semester ${subData.semester}`;
        document.getElementById('backBtn').href = `course.html?course=${subData.course_code}&sem=${subData.semester}`;
    } else {
        document.getElementById('subName').innerText = "Subject Not Found";
    }

    // B. Fetch Materials
    const q = query(collection(db, "materials"), where("subject_id", "==", subjectId));
    const list = document.getElementById('resources-list');
    
    try {
        const querySnapshot = await getDocs(q);
        list.innerHTML = ""; 

        if (querySnapshot.empty) {
            list.innerHTML = "<p style='color:#999; text-align:center; padding:40px;'>No study materials uploaded yet.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            list.innerHTML += `
                <div class="resource-item">
                    <div>
                        <span class="type-badge">${data.material_type || 'PDF'}</span>
                        <h4 style="margin:4px 0; color:#333;">${data.title}</h4>
                        <p style="margin:0; font-size:0.8rem; color:#888;">${data.description || ''}</p>
                    </div>
                    <a href="${data.file_path}" class="btn-view" target="_blank">View PDF</a>
                </div>
            `;
        });
    } catch (error) {
        list.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
    }
}
loadMaterials();