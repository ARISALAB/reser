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
const shopID = urlParams.get('shop') || 'default';
document.getElementById('display-shop-name').innerText = shopID;

let selectedTime = null;
const times = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"];
const timeContainer = document.getElementById('time-slots');

times.forEach(t => {
    const btn = document.createElement('button');
    btn.innerText = t;
    btn.className = "time-btn"; // Φτιάξε το στυλ στο CSS σου
    btn.onclick = () => {
        document.querySelectorAll('.time-btn').forEach(b => b.style.background = '#f1f5f9');
        btn.style.background = '#2563eb';
        btn.style.color = 'white';
        selectedTime = t;
    };
    timeContainer.appendChild(btn);
});

document.getElementById('btn-submit').onclick = async () => {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const guests = document.getElementById('guests').value;
    const date = document.getElementById('date').value;
    const location = document.getElementById('seating-location').value;
    const occasion = document.getElementById('special-occasion').value;
    const comments = document.getElementById('additional-comments').value;

    if(!name || !phone || !date || !selectedTime) return alert("Συμπληρώστε τα βασικά στοιχεία!");

    const newBookingRef = push(ref(db, `reservations/${shopID}`));
    await set(newBookingRef, {
        name, phone, guests, date, time: selectedTime,
        location, occasion, comments,
        timestamp: Date.now()
    });

    alert("Η κράτησή σας ολοκληρώθηκε!");
    location.reload();
};        });
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
