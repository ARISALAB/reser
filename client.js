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
const timeContainer = document.getElementById('time-slots-container');
const timeSelect = document.getElementById('time-select');

// Δημιουργία Ωρών (08:00 - 23:30)
function setupTimeElements() {
    for (let h = 8; h <= 23; h++) {
        const hourStr = h < 10 ? '0' + h : h;
        [`${hourStr}:00`, `${hourStr}:30`].forEach(t => {
            const option = document.createElement('option');
            option.value = t; option.innerText = t;
            timeSelect.appendChild(option);

            const div = document.createElement('div');
            div.className = 'time-slot';
            div.innerText = t; div.dataset.time = t;
            div.onclick = () => updateSelection(t);
            timeContainer.appendChild(div);
        });
    }
}

function updateSelection(time) {
    selectedTime = time;
    timeSelect.value = time;
    document.querySelectorAll('.time-slot').forEach(s => s.classList.toggle('selected', s.dataset.time === time));
    document.getElementById('open-modal').style.display = 'block';
}

timeSelect.onchange = (e) => { if(e.target.value) updateSelection(e.target.value); };
setupTimeElements();

const modal = document.getElementById('booking-modal');
document.getElementById('open-modal').onclick = () => {
    if(!document.getElementById('cust-date-only').value) return alert("Επιλέξτε ημερομηνία!");
    modal.style.display = 'flex';
};
document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

document.getElementById('btn-save').onclick = () => {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const email = document.getElementById('cust-email').value;
    const date = document.getElementById('cust-date-only').value;
    const guests = document.getElementById('cust-guests').value;

    if(!name || !phone) return alert("Όνομα και Τηλέφωνο είναι υποχρεωτικά!");

    const bookingData = { name, phone, email, date, time: selectedTime, guests, timestamp: Date.now() };

    set(push(ref(db, 'reservations/' + shopID)), bookingData).then(() => {
        alert("Επιτυχία! Η κράτηση αποθηκεύτηκε.");
        location.reload();
    });
};
        name, phone, guests, date, time, 
        location, occasion, comments,
        timestamp: Date.now()
    }).then(() => {
        alert("Η κράτησή σας ολοκληρώθηκε με επιτυχία!");
        window.location.reload();
    }).catch(err => alert("Σφάλμα κατά την κράτηση."));
};

// Λογική για το κλείσιμο του modal
document.getElementById('close-modal').onclick = () => {
    document.getElementById('booking-modal').style.display = 'none';
};
