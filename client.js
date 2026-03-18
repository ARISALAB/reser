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

let selectedTime = null;

// 1. Δημιουργία Ωρών (18:00 - 23:30)
const timeContainer = document.getElementById('time-slots-container');
function generateSlots() {
    for (let h = 18; h < 24; h++) {
        [h + ":00", h + ":30"].forEach(t => {
            const div = document.createElement('div');
            div.className = 'time-slot';
            div.innerText = t;
            div.onclick = () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                div.classList.add('selected');
                selectedTime = t;
                document.getElementById('open-modal').style.display = 'block';
            };
            timeContainer.appendChild(div);
        });
    }
}
generateSlots();

// 2. Έλεγχος Modal
const modal = document.getElementById('booking-modal');
document.getElementById('open-modal').onclick = () => {
    if(!document.getElementById('cust-date-only').value) return alert("Επιλέξτε ημερομηνία!");
    modal.style.display = 'flex';
};
document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

// 3. Τελική Αποστολή
document.getElementById('btn-save').onclick = () => {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const email = document.getElementById('cust-email').value;
    const date = document.getElementById('cust-date-only').value;
    const guests = document.getElementById('cust-guests').value;

    if(!name || !phone) return alert("Όνομα και Τηλέφωνο είναι υποχρεωτικά!");

    const bookingRef = ref(db, 'reservations/' + shopID);
    set(push(bookingRef), {
        name, phone, email, date, time: selectedTime, guests,
        timestamp: Date.now()
    }).then(() => {
        alert("Επιτυχία! Η κράτηση στάλθηκε.");
        location.reload();
    });
};
