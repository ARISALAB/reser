// script.js
document.getElementById('reservationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Συλλογή δεδομένων
    const reservation = {
        name: document.getElementById('name').value,
        guests: document.getElementById('guests').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value
    };

    console.log("Νέα Κράτηση:", reservation);

    // Εμφάνιση μηνύματος επιτυχίας
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = `Ευχαριστούμε ${reservation.name}! Η κράτηση για ${reservation.guests} άτομα στάλθηκε.`;
    msgDiv.className = "success";
    
    // Καθαρισμός φόρμας
    this.reset();
});