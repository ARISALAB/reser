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

document.getElementById('confirm-btn').onclick = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopID = urlParams.get('shop') || 'pandroso';

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const guests = document.getElementById('guests-count').innerText;
    const date = document.getElementById('selected-date').value;
    const time = document.getElementById('selected-time').innerText;
    
    // Νέα Δεδομένα
    const location = document.getElementById('seating-location').value;
    const occasion = document.getElementById('special-occasion').value;
    const comments = document.getElementById('additional-comments').value;

    if(!name || !phone) {
        alert("Παρακαλώ συμπληρώστε Όνομα και Τηλέφωνο!");
        return;
    }

    const newResRef = push(ref(db, `reservations/${shopID}`));
    set(newResRef, {
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
