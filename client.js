import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const urlParams = new URLSearchParams(window.location.search);
const shopID = urlParams.get('shop') || "default_store";
document.getElementById('shop-display').innerText = "Κράτηση στο: " + shopID;

document.getElementById('btn-save').onclick = () => {
    const name = document.getElementById('cust-name').value;
    const guests = document.getElementById('cust-guests').value;
    const date = document.getElementById('cust-date').value;

    if(!name || !date) return alert("Παρακαλώ συμπληρώστε όλα τα πεδία!");

    const newBookingRef = push(ref(db, 'reservations/' + shopID));
    set(newBookingRef, {
        name, guests, date, timestamp: Date.now()
    }).then(() => {
        alert("Η κράτηση στάλθηκε επιτυχώς!");
        document.getElementById('cust-name').value = "";
    });
};
