import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEkDMQ2Q3N886s8SyG03p6ZgzwO3N4pX4",
    authDomain: "reser-dfb9a.firebaseapp.com",
    databaseURL: "https://reser-dfb9a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "reser-dfb9a",
    storageBucket: "reser-dfb9a.firebasestorage.app",
    messagingSenderId: "326928829934",
    appId: "1:326928829934:web:f4c60a81f66f97ca2112ff"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// 1. Εύρεση Μαγαζιού από το URL (π.χ. ?shop=pizzeria)
const urlParams = new URLSearchParams(window.location.search);
const shopID = urlParams.get('shop') || "default_store";
document.getElementById('shop-name').innerText = "Κράτηση στο: " + shopID;

// 2. Λειτουργία Κράτησης (Πελάτης)
document.getElementById('btn-save').addEventListener('click', () => {
    const name = document.getElementById('cust-name').value;
    const guests = document.getElementById('cust-guests').value;
    const date = document.getElementById('cust-date').value;

    if(!name || !date) return alert("Παρακαλώ συμπληρώστε όλα τα πεδία");

    const bookingRef = ref(db, 'reservations/' + shopID);
    const newBooking = push(bookingRef);
    
    set(newBooking, {
        name, guests, date, timestamp: Date.now()
    }).then(() => {
        alert("Επιτυχής Κράτηση!");
        document.getElementById('cust-name').value = "";
    });
});

// 3. Λειτουργία Login (Μαγαζάτορας)
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert("Σφάλμα σύνδεσης"));
});

// 4. Παρακολούθηση Κατάστασης Login & Φόρτωση Κρατήσεων
onAuthStateChanged(auth, (user) => {
    const loginForm = document.getElementById('login-form');
    const dashboard = document.getElementById('admin-dashboard');

    if (user) {
        loginForm.style.display = 'none';
        dashboard.style.display = 'block';
        
        // Φόρτωση Κρατήσεων σε Πραγματικό Χρόνο
        const bookingsRef = ref(db, 'reservations/' + shopID);
        onValue(bookingsRef, (snapshot) => {
            const list = document.getElementById('reservation-list');
            list.innerHTML = "";
            const data = snapshot.val();
            for (let id in data) {
                list.innerHTML += `
                    <div class="booking-item">
                        <strong>${data[id].name}</strong> - ${data[id].guests} άτομα<br>
                        <small>${new Date(data[id].date).toLocaleString('el-GR')}</small>
                    </div>`;
            }
        });
    } else {
        loginForm.style.display = 'block';
        dashboard.style.display = 'none';
    }
});

// 5. Logout
document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));
