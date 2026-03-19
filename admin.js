import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Ρυθμίσεις Firebase (Οι δικές σου)
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

// --- ΕΛΕΓΧΟΣ ΠΡΟΣΒΑΣΗΣ (AUTH) ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 1. Μόλις συνδεθεί, τσεκάρουμε στη βάση ποιο μαγαζί του ανήκει
        const userMappingRef = ref(db, 'users_to_shops/' + user.uid);
        const snapshot = await get(userMappingRef);

        if (snapshot.exists()) {
            // Αν το UID υπάρχει στη λίστα "users_to_shops"
            const myAssignedShop = snapshot.val(); 
            
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('shop-title').innerText = myAssignedShop;

            // 2. Φορτώνουμε ΜΟΝΟ τις κρατήσεις αυτού του μαγαζιού
            loadReservations(myAssignedShop);
        } else {
            // Αν το UID ΔΕΝ υπάρχει στη λίστα, τον πετάμε έξω αμέσως
            alert("ΠΡΟΣΒΑΣΗ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ: Ο λογαριασμός σας δεν είναι συνδεδεμένος με κάποιο κατάστημα.");
            signOut(auth); 
        }
    } else {
        // Αν είναι αποσυνδεδεμένος, δείχνουμε τη φόρμα Login
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
});

// --- ΦΟΡΤΩΣΗ ΚΡΑΤΗΣΕΩΝ ---
function loadReservations(shop) {
    const resRef = ref(db, 'reservations/' + shop);
    
    onValue(resRef, (snapshot) => {
        const list = document.getElementById('reservation-list');
        list.innerHTML = "";
        const data = snapshot.val();
        
        if (data) {
            // Μετατρέπουμε σε πίνακα και ταξινομούμε (νέα πάνω)
            Object.keys(data).reverse().forEach(key => {
                const b = data[key];
                const div = document.createElement('div');
                div.className = "booking-item";
                div.style = "background: #f8fafc; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #2563eb; position: relative;";
                
                div.innerHTML = `
                    <strong>👤 ${b.name}</strong> (${b.guests} άτομα)<br>
                    📞 <a href="tel:${b.phone}">${b.phone}</a><br>
                    📅 ${b.date} | ⏰ ${b.time}<br>
                    <button onclick="deleteBooking('${shop}', '${key}')" style="margin-top:10px; color:red; border:none; background:none; cursor:pointer; font-weight:bold;">❌ Διαγραφή</button>
                `;
                list.appendChild(div);
            });
        } else { 
            list.innerHTML = "<p>Δεν υπάρχουν κρατήσεις για αυτό το κατάστημα.</p>"; 
        }
    });
}

// --- ΣΥΝΑΡΤΗΣΕΙΣ LOGIN / LOGOUT ---
document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    
    if(!email || !pass) return alert("Συμπληρώστε Email και Κωδικό");
    
    signInWithEmailAndPassword(auth, email, pass)
        .catch((error) => alert("Λάθος στοιχεία πρόσβασης!"));
};

document.getElementById('btn-logout').onclick = () => {
    signOut(auth);
};

// --- ΔΙΑΓΡΑΦΗ ΚΡΑΤΗΣΗΣ ---
window.deleteBooking = (shop, id) => {
    if(confirm("Θέλετε σίγουρα να διαγράψετε αυτή την κράτηση;")) {
        remove(ref(db, `reservations/${shop}/${id}`));
    }
};
