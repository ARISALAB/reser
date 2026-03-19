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

let allReservations = []; // Εδώ θα κρατάμε τα δεδομένα για να τα φιλτράρουμε

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snapshot = await get(ref(db, 'users_to_shops/' + user.uid));
        if (snapshot.exists()) {
            const myShop = snapshot.val();
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('shop-title').innerText = myShop;
            
            // Ορίζουμε σημερινή ημερομηνία στα φίλτρα ως προεπιλογή
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('filter-from').value = today;
            document.getElementById('filter-to').value = today;

            listenToReservations(myShop);
        } else {
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

// Συνάρτηση που "σχεδιάζει" τη λίστα και τα στατιστικά
function renderDashboard(shop) {
    const fromDate = document.getElementById('filter-from').value;
    const toDate = document.getElementById('filter-to').value;
    const list = document.getElementById('reservation-list');
    
    // 1. Φιλτράρισμα βάσει ημερομηνίας
    let filtered = allReservations.filter(res => {
        return res.date >= fromDate && res.date <= toDate;
    });

    // 2. Ταξινόμηση: Πρώτα η Ημερομηνία και μετά η Ώρα (από νωρίς προς αργά)
    filtered.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    // 3. Υπολογισμός Στατιστικών
    let totalGuests = 0;
    filtered.forEach(res => totalGuests += parseInt(res.guests || 0));
    
    document.getElementById('stat-count').innerText = filtered.length;
    document.getElementById('stat-guests').innerText = totalGuests;

    // 4. Εμφάνιση Λίστας
    list.innerHTML = "";
    if (filtered.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#64748b;'>Καμία κράτηση για αυτό το εύρος.</p>";
        return;
    }

    filtered.forEach(res => {
        const div = document.createElement('div');
        div.className = "booking-item card";
        div.style = "margin-bottom:10px; border-left:5px solid #2563eb; padding:12px; background:white;";
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <span style="font-weight:800; color:#2563eb;">${res.time}</span>
                <span style="font-size:0.8rem; color:#64748b;">${res.date}</span>
            </div>
            <div style="margin-top:5px;">
                <strong>${res.name}</strong> (${res.guests} άτομα)<br>
                <small>📞 ${res.phone}</small>
            </div>
            <button onclick="deleteBooking('${shop}', '${res.id}')" style="margin-top:8px; color:#ef4444; border:none; background:none; cursor:pointer; font-size:0.8rem;">Διαγραφή</button>
        `;
        list.appendChild(div);
    });
}

// Event Listeners για τα φίλτρα
document.getElementById('filter-from').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);
document.getElementById('filter-to').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);

document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(() => alert("Λάθος στοιχεία!"));
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

window.deleteBooking = (shop, id) => {
    if(confirm("Διαγραφή κράτησης;")) remove(ref(db, `reservations/${shop}/${id}`));
};
