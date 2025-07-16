// ✅ Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ✅ Mobile nav toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// ✅ Theme & Color
const colorPicker = document.getElementById('colorPicker');
const colorThemes = [
  { glow: '#00ffee', accent: '#1f1fff', textDark: '#ffffff', textLight: '#111111' },
  { glow: '#ff0077', accent: '#ff44aa', textDark: '#ffffff', textLight: '#111111' },
  { glow: '#00ff77', accent: '#007744', textDark: '#ffffff', textLight: '#111111' },
  { glow: '#ffaa00', accent: '#ff5500', textDark: '#111111', textLight: '#111111' },
  { glow: '#aa00ff', accent: '#5500aa', textDark: '#ffffff', textLight: '#111111' },
  { glow: '#00ccff', accent: '#0055aa', textDark: '#ffffff', textLight: '#111111' },
  { glow: '#ff2222', accent: '#880000', textDark: '#ffffff', textLight: '#111111' },
  { glow: '#00ffcc', accent: '#006666', textDark: '#ffffff', textLight: '#111111' }
];
let currentThemeIndex = 0;

function applyTheme(index) {
  const theme = colorThemes[index];
  const isLight = document.body.classList.contains('light');
  document.documentElement.style.setProperty('--btn-glow', theme.glow);
  document.documentElement.style.setProperty('--btn-accent', theme.accent);
  const textColor = isLight ? theme.textLight : theme.textDark;
  document.documentElement.style.setProperty('--btn-text', textColor);
}

colorPicker.addEventListener('click', () => {
  currentThemeIndex = (currentThemeIndex + 1) % colorThemes.length;
  applyTheme(currentThemeIndex);
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
  applyTheme(currentThemeIndex);
});

// ✅ ScrollReveal animations
ScrollReveal().reveal('.about h2, .about p', {
  delay: 100, duration: 1000, origin: 'top', distance: '30px', easing: 'ease-out'
});
ScrollReveal().reveal('.about-card, .feature-card, .team-card', {
  delay: 200, duration: 1000, origin: 'bottom', distance: '50px', easing: 'ease-in-out', interval: 200
});
ScrollReveal().reveal('.testimonial-form', {
  delay: 100, duration: 1000, origin: 'top', distance: '30px', easing: 'ease-in-out'
});
ScrollReveal().reveal('.testimonial-card', {
  delay: 200, duration: 1000, origin: 'bottom', distance: '50px', easing: 'ease-in-out', interval: 200
});

// ✅ Load and display testimonials from Firestore
function loadTestimonials() {
  const container = document.getElementById('testimonialList');
  const q = query(collection(db, "testimonials"), orderBy("timestamp", "desc"));
  getDocs(q).then(snapshot => {
    container.innerHTML = '';
    snapshot.forEach(doc => {
      const testimonial = doc.data();
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.innerHTML = `<h4>${testimonial.name}</h4><p>${testimonial.message}</p>`;
      container.appendChild(card);
    });
  });
}

// ✅ Handle form submission
function handleReviewSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('name');
  const messageInput = document.getElementById('message');
  const name = nameInput.value.trim();
  const message = messageInput.value.trim();
  if (!name || !message) return;

  addDoc(collection(db, "testimonials"), {
    name,
    message,
    timestamp: serverTimestamp()
  }).then(() => {
    nameInput.value = '';
    messageInput.value = '';
    loadTestimonials();
  });
}

// ✅ Star Rating System via Firebase
function setupStarRating() {
  const stars = document.querySelectorAll('#starRating span');
  const message = document.getElementById('ratingMessage');
  const userId = getUserId();

  getDocs(collection(db, "ratings")).then(snapshot => {
    let found = false;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId === userId) {
        highlightStars(data.rating);
        message.textContent = `You rated us ${data.rating} stars ⭐`;
        found = true;
      }
    });
    if (!found) {
      attachStarEvents();
    }
    fetchAndDisplayAverageRating();
  });

  function attachStarEvents() {
    stars.forEach(star => {
      star.addEventListener('mouseenter', () => {
        const value = parseInt(star.dataset.star);
        highlightStars(value, 'hovered');
      });
      star.addEventListener('mouseleave', () => {
        highlightStars(0, 'hovered');
      });
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.star);
        addDoc(collection(db, "ratings"), { userId, rating }).then(() => {
          highlightStars(rating, 'selected');
          message.textContent = `Thanks! You rated us ${rating} stars ⭐`;
          fetchAndDisplayAverageRating();
        });
      });
    });
  }

  function highlightStars(count, className = 'selected') {
    stars.forEach(star => {
      star.classList.remove('hovered', 'selected');
      if (parseInt(star.dataset.star) <= count) {
        star.classList.add(className);
      }
    });
  }
}

function fetchAndDisplayAverageRating() {
  getDocs(collection(db, "ratings")).then(snapshot => {
    const ratings = [];
    snapshot.forEach(doc => ratings.push(doc.data().rating));
    if (ratings.length > 0) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      document.getElementById('ratingMessage').textContent =
        `⭐ Average Rating: ${avg.toFixed(1)} (${ratings.length} ratings)`;
    }
  });
}

function getUserId() {
  // Simple device/user ID generator (not secure, but good enough for demo)
  let id = sessionStorage.getItem('userId');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('userId', id);
  }
  return id;
}

// ✅ Be Part of the Future - Submit Form
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

document.getElementById('futureForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('userName').value.trim();
  const gender = document.getElementById('userGender').value;
  const email = document.getElementById('userEmail').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  if (!name || !gender || !email || !phone) return;

  const entry = { name, gender, email, phone };

  addDoc(collection(db, "futureForms"), {
    ...entry,
    timestamp: serverTimestamp()
  });

  const message = `📝 New Submission:\n👤 Name: ${name}\n⚧ Gender: ${gender}\n📧 Email: ${email}\n📞 Phone: ${phone}`;
  const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

  fetch(telegramURL)
    .then(response => {
      if (response.ok) {
        alert("Form submitted successfully!");
        document.getElementById('futureForm').reset();
      } else {
        alert("Failed to send to Telegram.");
      }
    })
    .catch(() => alert("Network error while sending to Telegram."));
});

// ✅ Neon Cursor Movement
const syncPointer = ({ x: pointerX, y: pointerY }) => {
  const x = pointerX.toFixed(2);
  const y = pointerY.toFixed(2);
  const xp = (pointerX / window.innerWidth).toFixed(2);
  const yp = (pointerY / window.innerHeight).toFixed(2);
  document.documentElement.style.setProperty('--x', x);
  document.documentElement.style.setProperty('--xp', xp);
  document.documentElement.style.setProperty('--y', y);
  document.documentElement.style.setProperty('--yp', yp);
}
document.body.addEventListener('pointermove', syncPointer);

// ✅ DOM Ready Init
document.addEventListener('DOMContentLoaded', () => {
  loadTestimonials();
  const form = document.getElementById('reviewForm');
  if (form) form.addEventListener('submit', handleReviewSubmit);
  setupStarRating();
});
