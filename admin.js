import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

const urlParams = new URLSearchParams(window.location.search);
const shopID = urlParams.get('shop') || "default_store";

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('shop-title').innerText = shopID;

        // Φόρτωση Κρατήσεων
        onValue(ref(db, 'reservations/' + shopID), (snapshot) => {
            const list = document.getElementById('reservation-list');
            list.innerHTML = "";
            const data = snapshot.val();
            if (data) {
                Object.values(data).reverse().forEach(b => {
                    list.innerHTML += `
                        <div class="booking-item">
                            <strong>${b.name}</strong> - ${b.guests} άτομα<br>
                            <small>${new Date(b.date).toLocaleString('el-GR')}</small>
                        </div>`;
                });
            } else { list.innerHTML = "Καμία κράτηση."; }
        });
    } else {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
});

document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(() => alert("Λάθος στοιχεία!"));
};

document.getElementById('btn-logout').onclick = () => signOut(auth);
