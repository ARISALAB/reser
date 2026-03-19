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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlShop = urlParams.get('shop');

        if (!urlShop) {
            alert("ΣΦΑΛΜΑ: Δεν έχει οριστεί κατάστημα στο URL!");
            signOut(auth);
            return;
        }

        const snapshot = await get(ref(db, 'users_to_shops/' + user.uid));
        
        if (snapshot.exists()) {
            const myAssignedShop = snapshot.val(); 

            if (urlShop !== myAssignedShop) {
                alert("ΑΠΑΓΟΡΕΥΕΤΑΙ: Δεν έχετε πρόσβαση για το κατάστημα: " + urlShop);
                signOut(auth);
                return;
            }

            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('shop-title').innerText = myAssignedShop;
            
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('filter-from').value = today;
            document.getElementById('filter-to').value = today;

            listenToReservations(myAssignedShop);
        } else {
            alert("Ο λογαριασμός δεν είναι συνδεδεμένος με κατάστημα!");
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
    const toToDate = document.getElementById('filter-to').value;
    const list = document.getElementById('reservation-list');
    
    let filtered = allReservations.filter(res => res.date >= fromDate && res.date <= toToDate);

    filtered.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    let totalGuests = 0;
    filtered.forEach(res => totalGuests += parseInt(res.guests || 0));
    
    document.getElementById('stat-count').innerText = filtered.length;
    document.getElementById('stat-guests').innerText = totalGuests;

    list.innerHTML = "";
    if (filtered.length === 0) {
        list.innerHTML = "<div class='no-data'>Δεν βρέθηκαν κρατήσεις για το επιλεγμένο διάστημα.</div>";
        return;
    }

    filtered.forEach(res => {
        const div = document.createElement('div');
        div.className = "booking-card"; // Χρήση του νέου CSS class
        
        div.innerHTML = `
            <div class="card-header">
                <div class="time-badge">${res.time}</div>
                <div class="date-text">${res.date}</div>
                <button class="delete-link" onclick="deleteBooking('${shop}', '${res.id}')">Διαγραφή</button>
            </div>
            <div class="card-body">
                <div class="customer-name">${res.name}</div>
                <div class="info-row">
                    <span>👥 <strong>${res.guests} άτομα</strong></span>
                    <span>📍 ${res.location || 'Εσωτερικός'}</span>
                </div>
                ${res.occasion ? `<div class="occasion-tag">🎉 ${res.occasion}</div>` : ''}
                ${res.comments ? `<div class="comments-box">${res.comments}</div>` : ''}
                <a href="tel:${res.phone}" class="call-button">📞 Κλήση: ${res.phone}</a>
            </div>
        `;
        list.appendChild(div);
    });
}

document.getElementById('filter-from').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);
document.getElementById('filter-to').onchange = () => renderDashboard(document.getElementById('shop-title').innerText);

document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(() => alert("Λάθος στοιχεία!"));
};

document.getElementById('btn-logout').onclick = () => signOut(auth);

window.deleteBooking = (shop, id) => {
    if(confirm("Οριστική διαγραφή κράτησης;")) {
        remove(ref(db, `reservations/${shop}/${id}`));
    }
};
