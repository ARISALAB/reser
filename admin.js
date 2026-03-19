import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEkDMQ2Q3N886s8SyG03p6ZgzwO3N4pX4",
    authDomain: "reser-dfb9a.firebaseapp.com",
    databaseURL: "https://reser-dfb9a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "reser-dfb9a",
    appId: "1:326928829934:web:f4c60a81f66f97ca2112ff"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let allReservations = [];

// --- ΑΥΣΤΗΡΟΣ ΕΛΕΓΧΟΣ ΠΡΟΣΒΑΣΗΣ ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlShop = urlParams.get('shop');

        if (!urlShop) {
            alert("Σφάλμα: Πρέπει να υπάρχει το όνομα του μαγαζιού στο URL (?shop=...)");
            signOut(auth); return;
        }

        // Τσεκάρουμε αν το UID του χρήστη ταιριάζει με το shop του URL
        const snapshot = await get(ref(db, 'users_to_shops/' + user.uid));
        const assignedShop = snapshot.val();

        if (snapshot.exists() && assignedShop === urlShop) {
            // ΕΠΙΤΥΧΙΑ: Ο χρήστης είναι ο σωστός για αυτό το URL
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('shop-title').innerText = assignedShop;
            
            // Προεπιλογή Φίλτρου: Σήμερα
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('filter-from').value = today;
            document.getElementById('filter-to').value = today;

            listenToReservations(assignedShop);
        } else {
            // ΑΠΟΤΥΧΙΑ: Οι κωδικοί δεν είναι για αυτό το URL
            alert("ΠΡΟΣΟΧΗ: Δεν έχετε δικαιώματα διαχείρισης για το κατάστημα: " + urlShop);
            signOut(auth);
        }
    } else {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
});

function listenToReservations(shop) {
    onValue(ref(db, 'reservations/' + shop), (snapshot) => {
        allReservations = [];
        if (snapshot.exists()) {
            const data = snapshot.val();
            allReservations = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }
        renderDashboard(shop);
    });
}

function renderDashboard(shop) {
    const fromDate = document.getElementById('filter-from').value;
    const toDate = document.getElementById('filter-to').value;
    const list = document.getElementById('reservation-list');
    
    // Φιλτράρισμα & Ταξινόμηση
    let filtered = allReservations.filter(res => res.date >= fromDate && res.date <= toDate);
    filtered.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    // Στατιστικά
    let totalGuests = 0;
    filtered.forEach(res => totalGuests += parseInt(res.guests || 0));
    document.getElementById('stat-count').innerText = filtered.length;
    document.getElementById('stat-guests').innerText = totalGuests;

    list.innerHTML = "";
    if (filtered.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:30px; color:#94a3b8;'>Δεν βρέθηκαν κρατήσεις.</p>";
        return;
    }

    filtered.forEach(res => {
        const div = document.createElement('div');
        div.className = "res-card";
        div.style = "background:white; border-radius:12px; padding:15px; margin-bottom:15px; border-left:6px solid #2563eb; box-shadow:0 2px 5px rgba(0,0,0,0.05);";
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <span style="font-size:1.2rem; font-weight:800; color:#2563eb;">${res.time}</span>
                    <span style="font-size:0.8rem; color:#64748b; margin-left:8px;">${res.date}</span>
                </div>
                <button onclick="deleteBooking('${shop}', '${res.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.1rem;">❌</button>
            </div>
            
            <div style="margin-top:10px;">
                <div style="font-weight:700; font-size:1.1rem; color:#1e293b;">${res.name}</div>
                <div style="font-size:0.95rem; color:#475569; margin-top:3px;">
                    👥 <strong>${res.guests} άτομα</strong> | 📍 ${res.location}
                </div>
                
                ${res.occasion ? `<div style="margin-top:8px; color:#db2777; font-weight:700; font-size:0.9rem;">🎁 Γεγονός: ${res.occasion}</div>` : ''}
                
                ${res.comments ? `<div style="margin-top:8px; background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0; font-size:0.85rem; font-style:italic;">💬 ${res.comments}</div>` : ''}
                
                <div style="margin-top:12px;">
                    <a href="tel:${res.phone}" style="color:#2563eb; text-decoration:none; font-weight:bold; border:1px solid #2563eb; padding:5px 10px; border-radius:6px; font-size:0.85rem;">📞 Κλήση: ${res.phone}</a>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

// Λοιπές συναρτήσεις
document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(() => alert("Λάθος στοιχεία!"));
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

window.deleteBooking = (shop, id) => {
    if(confirm("Οριστική διαγραφή κράτησης;")) remove(ref(db, `reservations/${shop}/${id}`));
};

document.getElementById('filter-from').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);
document.getElementById('filter-to').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);
