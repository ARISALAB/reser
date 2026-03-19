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
        const snapshot = await get(ref(db, 'users_to_shops/' + user.uid));
        
        if (snapshot.exists()) {
            const myAssignedShop = snapshot.val(); 

            // ΔΙΑΧΕΙΡΙΣΗ URL: Κρατάμε το ?shop= στο URL για τον επαγγελματισμό
            const urlParams = new URLSearchParams(window.location.search);
            const urlShop = urlParams.get('shop');

            if (urlShop !== myAssignedShop) {
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?shop=' + myAssignedShop;
                window.history.replaceState({path:newUrl}, '', newUrl);
            }

            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('shop-title').innerText = myAssignedShop;
            
            // Προεπιλογή ημερομηνίας: Σήμερα
            const today = new Date().toISOString().split('T')[0];
            if(!document.getElementById('filter-from').value) {
                document.getElementById('filter-from').value = today;
                document.getElementById('filter-to').value = today;
            }

            listenToReservations(myAssignedShop);
        } else {
            alert("Ο λογαριασμός σας δεν έχει αντιστοιχιστεί σε κάποιο κατάστημα!");
            signOut(auth);
        }
    } else {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
});

// --- ΣΥΝΔΕΣΗ ΜΕ ΤΗ ΒΑΣΗ (REAL-TIME) ---
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

// --- ΣΧΕΔΙΑΣΗ ΛΙΣΤΑΣ & ΣΤΑΤΙΣΤΙΚΩΝ ---
function renderDashboard(shop) {
    const fromDate = document.getElementById('filter-from').value;
    const toDate = document.getElementById('filter-to').value;
    const list = document.getElementById('reservation-list');
    
    // 1. Φιλτράρισμα
    let filtered = allReservations.filter(res => res.date >= fromDate && res.date <= toDate);

    // 2. Ταξινόμηση (Πρώτα η ημερομηνία, μετά η ώρα)
    filtered.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    // 3. Στατιστικά
    let totalGuests = 0;
    filtered.forEach(res => totalGuests += parseInt(res.guests || 0));
    
    document.getElementById('stat-count').innerText = filtered.length;
    document.getElementById('stat-guests').innerText = totalGuests;

    // 4. Εμφάνιση
    list.innerHTML = "";
    if (filtered.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px; color:#64748b;'>Καμία κράτηση για αυτές τις ημερομηνίες.</p>";
        return;
    }

    filtered.forEach(res => {
        const div = document.createElement('div');
        div.className = "booking-item card";
        div.style = "margin-bottom:12px; border-left:6px solid #2563eb; padding:15px; background:white; position:relative;";
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <span style="font-size:1.1rem; font-weight:800; color:#2563eb;">${res.time}</span>
                    <span style="font-size:0.8rem; color:#94a3b8; margin-left:10px;">${res.date}</span>
                </div>
                <button onclick="deleteBooking('${shop}', '${res.id}')" style="color:#ef4444; border:none; background:none; cursor:pointer; font-size:0.8rem;">Διαγραφή</button>
            </div>
            <div style="margin-top:8px;">
                <div style="font-weight:700; font-size:1rem;">${res.name}</div>
                <div style="color:#475569; font-size:0.9rem;">👥 ${res.guests} άτομα</div>
                <div style="color:#2563eb; font-size:0.9rem; margin-top:4px;">📞 <a href="tel:${res.phone}">${res.phone}</a></div>
            </div>
        `;
        list.appendChild(div);
    });
}

// --- EVENT LISTENERS ---
document.getElementById('filter-from').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);
document.getElementById('filter-to').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);

document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    if(!email || !pass) return alert("Παρακαλώ συμπληρώστε όλα τα πεδία.");
    signInWithEmailAndPassword(auth, email, pass).catch(() => alert("Λάθος στοιχεία πρόσβασης!"));
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

window.deleteBooking = (shop, id) => {
    if(confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την κράτηση;")) {
        remove(ref(db, `reservations/${shop}/${id}`));
    }
};
