function scrollToInvitation() {
    document.getElementById('invitation-content').scrollIntoView({ behavior: 'smooth' });
}

// Countdown Timer
const targetDate = new Date("December 15, 2026 10:10:00").getTime();

setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }
}, 1000);

// Strict Validations
function handleRSVPSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    const guestCount = document.getElementById('guestCount').value;
    const notes = document.getElementById('notes').value.trim();

    let isValid = true;

    // Reset error messages
    document.getElementById('nameError').innerText = '';
    document.getElementById('phoneError').innerText = '';
    document.getElementById('emailError').innerText = '';

    // Name Validation
    if (name.length < 3) {
        document.getElementById('nameError').innerText = 'අඩුම තරමින් අකුරු 3 ක් ඇතුළත් කරන්න.';
        isValid = false;
    }

    // Phone Validation (Sri Lanka 10 digit regex or general 10 digit)
    const phoneRegex = /^(?:0|94|\+94)?^(?:7[0-8]|0[1-9])\d{7}$|^07\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        document.getElementById('phoneError').innerText = 'නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 0771234567).';
        isValid = false;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').innerText = 'නිවැරදි Email ලිපිනයක් ඇතුළත් කරන්න.';
        isValid = false;
    }

    if (isValid) {
        const newEntry = {
            id: Date.now(),
            name,
            phone,
            email,
            attendance,
            guestCount: attendance === 'Yes' ? guestCount : '0',
            notes,
            timestamp: new Date().toLocaleString('si-LK')
        };

        // Save to LocalStorage
        let rsvpList = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
        rsvpList.push(newEntry);
        localStorage.setItem('wedding_rsvps', JSON.stringify(rsvpList));

        // UI response
        document.getElementById('rsvpForm').style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
    }
}

// Admin Panel Logic
function toggleAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        document.getElementById('adminLoginSection').style.display = 'block';
        document.getElementById('adminDashboardSection').style.display = 'none';
        document.getElementById('adminPassword').value = '';
    }
}

function verifyAdminLogin() {
    const pass = document.getElementById('adminPassword').value;
    if (pass === 'admin123') { // Simple local admin password
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'block';
        loadAdminData();
    } else {
        document.getElementById('adminPassError').innerText = 'මුරපදය වැරදියි! (Default: admin123)';
    }
}

function loadAdminData() {
    const rsvpList = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    const tbody = document.getElementById('rsvpTableBody');
    tbody.innerHTML = '';

    let totalAttending = 0;
    let totalGuests = 0;

    rsvpList.forEach(item => {
        if (item.attendance === 'Yes') {
            totalAttending++;
            totalGuests += parseInt(item.guestCount || 0);
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(item.name)}</strong><br><small>${escapeHtml(item.email)}</small></td>
            <td>${escapeHtml(item.phone)}</td>
            <td><span style="color:${item.attendance === 'Yes' ? 'green' : 'red'}">${item.attendance}</span></td>
            <td>${item.guestCount}</td>
            <td>${escapeHtml(item.notes || '-')}</td>
            <td><small>${item.timestamp}</small></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('statTotal').innerText = rsvpList.length;
    document.getElementById('statAttending').innerText = totalAttending;
    document.getElementById('statGuests').innerText = totalGuests;
}

function clearAllRSVPs() {
    if (confirm('ඔබට සියලුම RSVP දත්ත මකා දැමීමට අවශ්‍යද?')) {
        localStorage.removeItem('wedding_rsvps');
        loadAdminData();
    }
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}
