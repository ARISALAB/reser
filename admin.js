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

// --- ΕΛΕΓΧΟΣ ΠΡΟΣΒΑΣΗΣ & URL ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlShop = urlParams.get('shop');

        if (!urlShop) {
            alert("Λείπει το όνομα του καταστήματος από το URL!");
            signOut(auth); return;
        }

        const snapshot = await get(ref(db, 'users_to_shops/' + user.uid));
        
        if (snapshot.exists() && snapshot.val() === urlShop) {
            const myShop = snapshot.val();
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('shop-title').innerText = myShop;
            
            // Ορισμός σημερινής ημερομηνίας στα φίλτρα
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('filter-from').value = today;
            document.getElementById('filter-to').value = today;

            listenToReservations(myShop);
        } else {
            alert("ΑΠΑΓΟΡΕΥΕΤΑΙ: Δεν έχετε δικαιώματα για το κατάστημα στο URL!");
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
    
    let filtered = allReservations.filter(res => res.date >= fromDate && res.date <= toDate);
    filtered.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    let totalG = 0;
    filtered.forEach(r => totalG += parseInt(r.guests || 0));
    document.getElementById('stat-count').innerText = filtered.length;
    document.getElementById('stat-guests').innerText = totalG;

    list.innerHTML = "";
    if (filtered.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px;'>Καμία κράτηση γι' αυτό το διάστημα.</p>";
        return;
    }

    filtered.forEach(res => {
        const div = document.createElement('div');
        div.className = "booking-item card";
        div.style = "margin-bottom:12px; border-left:6px solid #2563eb; padding:15px; background:white; position:relative;";
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <span style="font-size:1.1rem; font-weight:800; color:#2563eb;">${res.time}</span>
                    <span style="font-size:0.8rem; color:#94a3b8; margin-left:10px;">${res.date}</span>
                </div>
                <button onclick="deleteBooking('${shop}', '${res.id}')" style="color:#ef4444; border:none; background:none; cursor:pointer;">❌</button>
            </div>
            <div style="margin-top:8px;">
                <div style="font-weight:700; font-size:1.1rem;">${res.name}</div>
                <div style="color:#475569; font-size:0.95rem;">👥 ${res.guests} άτομα | 📍 ${res.location}</div>
                
                ${res.occasion ? `<div style="margin-top:5px; color:#db2777; font-weight:600; font-size:0.9rem;">🎉 Γεγονός: ${res.occasion}</div>` : ''}
                ${res.comments ? `<div style="margin-top:5px; font-style:italic; font-size:0.85rem; background:#f1f5f9; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">💬 ${res.comments}</div>` : ''}
                
                <div style="margin-top:10px; font-weight:bold;">📞 <a href="tel:${res.phone}" style="color:#2563eb; text-decoration:none;">${res.phone}</a></div>
            </div>
        `;
        list.appendChild(div);
    });
}

// --- ΣΥΝΑΡΤΗΣΕΙΣ BUTTONS ---
document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(() => alert("Λάθος στοιχεία!"));
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

window.deleteBooking = (shop, id) => {
    if(confirm("Θέλετε να διαγράψετε αυτή την κράτηση;")) {
        remove(ref(db, `reservations/${shop}/${id}`));
    }
};

// Listeners για τα φίλτρα
document.getElementById('filter-from').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);
document.getElementById('filter-to').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);
