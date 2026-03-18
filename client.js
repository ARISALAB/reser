import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Ρυθμίσεις Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCEkDMQ2Q3N886s8SyG03p6ZgzwO3N4pX4",
    authDomain: "reser-dfb9a.firebaseapp.com",
    databaseURL: "https://reser-dfb9a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "reser-dfb9a",
    appId: "1:326928829934:web:f4c60a81f66f97ca2112ff"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Ρυθμίσεις Telegram (Με τα δικά σου στοιχεία)
const telegramToken = "8738423907:AAG7kflGAD3fEtyLIe--AgJhIkEI7nOXS0w";
const chatId = "8145219232"; // Το Chat ID σου από το screenshot

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

// ΣΥΝΑΡΤΗΣΗ ΕΙΔΟΠΟΙΗΣΗΣ TELEGRAM
async function sendTelegramNotification(data) {
    const message = `🔔 *Νέα Κράτηση!*\n📍 Μαγαζί: *${shopID}*\n👤 Πελάτης: ${data.name}\n📞 Τηλέφωνο: ${data.phone}\n👥 Άτομα: ${data.guests}\n📅 Ημερομηνία: ${data.date}\n⏰ Ώρα: ${data.time}\n📧 Email: ${data.email || '---'}`;

    try {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
        });
    } catch (e) { console.error("Telegram error", e); }
}

// ΑΠΟΘΗΚΕΥΣΗ ΚΑΙ ΕΙΔΟΠΟΙΗΣΗ
document.getElementById('btn-save').onclick = () => {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const email = document.getElementById('cust-email').value;
    const date = document.getElementById('cust-date-only').value;
    const guests = document.getElementById('cust-guests').value;

    if(!name || !phone) return alert("Όνομα και Τηλέφωνο είναι υποχρεωτικά!");

    const bookingData = { name, phone, email, date, time: selectedTime, guests, timestamp: Date.now() };

    set(push(ref(db, 'reservations/' + shopID)), bookingData).then(() => {
        sendTelegramNotification(bookingData);
        alert("Η κράτηση στάλθηκε! Δες το Telegram σου!");
        location.reload();
    });
};
