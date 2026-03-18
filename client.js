import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEkDMQ2Q3N886s8SyG03p6ZgzwO3N4pX4",
    authDomain: "reser-dfb9a.firebaseapp.com",
    databaseURL: "https://reser-dfb9a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "reser-dfb9a",
    appId: "1:326928829934:web:f4c60a81f66f97ca2112ff"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const urlParams = new URLSearchParams(window.location.search);
const shopID = urlParams.get('shop') || "default_store";
document.getElementById('shop-display').innerText = "Κράτηση στο: " + shopID;

const modal = document.getElementById('booking-modal');

// Άνοιγμα Modal
document.getElementById('open-modal').onclick = () => {
    const date = document.getElementById('cust-date').value;
    if(!date) return alert("Παρακαλώ επιλέξτε ημερομηνία και ώρα");
    modal.style.display = 'flex';
};

// Κλείσιμο Modal
document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

// Τελική Αποθήκευση
document.getElementById('btn-save').onclick = () => {
    const name = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const phone = document.getElementById('cust-phone').value;
    const guests = document.getElementById('cust-guests').value;
    const date = document.getElementById('cust-date').value;

    if(!name || !phone) return alert("Το όνομα και το τηλέφωνο είναι υποχρεωτικά");

    const newBookingRef = push(ref(db, 'reservations/' + shopID));
    set(newBookingRef, {
        name, email, phone, guests, date, 
        timestamp: Date.now(),
        status: "pending" // Χρήσιμο για το μέλλον (επιβεβαιωμένη ή όχι)
    }).then(() => {
        alert("Η κράτησή σας καταχωρήθηκε! Θα επικοινωνήσουμε μαζί σας.");
        location.reload(); // Ανανέωση για καθαρισμό των πεδίων
    });
};
