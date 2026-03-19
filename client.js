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

// Παίρνουμε το μαγαζί από το URL
const urlParams = new URLSearchParams(window.location.search);
const shopID = urlParams.get('shop') || 'pandroso';
document.getElementById('display-shop-name').innerText = shopID;

let selectedTime = "";

// Δημιουργία ωρών (παράδειγμα 18:00 - 23:00)
const timeContainer = document.getElementById('time-slots');
const hours = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"];

hours.forEach(time => {
    const btn = document.createElement('button');
    btn.innerText = time;
    btn.className = "time-btn";
    btn.onclick = () => {
        selectedTime = time;
        openModal();
    };
    timeContainer.appendChild(btn);
});

function openModal() {
    const date = document.getElementById('selected-date').value;
    const guests = document.getElementById('guests-count').innerText;
    if(!date) return alert("Επιλέξτε ημερομηνία πρώτα!");
    
    document.getElementById('summary-text').innerText = `Κράτηση για ${guests} άτομα στις ${date} και ώρα ${selectedTime}`;
    document.getElementById('booking-modal').style.display = 'block';
}

document.getElementById('close-modal').onclick = () => {
    document.getElementById('booking-modal').style.display = 'none';
};

// Η ΤΕΛΙΚΗ ΕΠΙΒΕΒΑΙΩΣΗ
document.getElementById('confirm-btn').onclick = () => {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const date = document.getElementById('selected-date').value;
    const guests = document.getElementById('guests-count').innerText;
    
    // Τα νέα πεδία
    const locationChoice = document.getElementById('seating-location').value;
    const occasion = document.getElementById('special-occasion').value;
    const comments = document.getElementById('additional-comments').value;

    if(!name || !phone) return alert("Παρακαλώ βάλτε Όνομα και Τηλέφωνο!");

    const resRef = push(ref(db, `reservations/${shopID}`));
    set(resRef, {
        name,
        phone,
        date,
        time: selectedTime,
        guests,
        location: locationChoice,
        occasion: occasion,
        comments: comments,
        timestamp: Date.now()
    }).then(() => {
        alert("Η κράτηση στάλθηκε επιτυχώς!");
        window.location.reload();
    }).catch(err => {
        alert("Σφάλμα σύνδεσης. Δοκιμάστε ξανά.");
    });
};
