// =================== CONFIG ===================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycM5dI7Qi8Dg8LPIxGPOvpt-OFMNWQNRdTj4WZ6AdYXVg6yfPMvBvKgaHD4CSChR7Q/exec";
const ABSOLUTE_MAX_GUESTS = 10;
// ==============================================

// =================== ELEMENTS ===================
const slides = Array.from(document.querySelectorAll(".slide"));
const dotsEl = document.getElementById("dots");
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const langBtn = document.getElementById("langBtn");
const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");
const siteVideo = document.getElementById("siteVideo");

const nameInput = document.getElementById("rsvpName");
const attendingInput = document.getElementById("attending");
const guestsInput = document.getElementById("guests");
const phoneInput = document.getElementById("phone");
const noteInput = document.getElementById("note");

const reservedNameEl = document.getElementById("reservedName");
const invitationCountEl = document.getElementById("invitationCount");
const sealCardEl = document.getElementById("sealCard");
const sealOpenBtnEl = document.getElementById("sealOpenBtn");
// ==============================================

// =================== GLOBAL STATE ===================
let index = 0;
let musicOn = false;
let lang = "en";
let cachedAllowedGuests = 1;
// ==============================================

// =================== INVITE SETTINGS ===================
function getInviteSettings() {
  const p = new URLSearchParams(window.location.search);

  const name = (p.get("to") || "").trim();

  let maxGuests = parseInt(p.get("max") || "1", 10);
  if (!Number.isFinite(maxGuests) || maxGuests < 0) maxGuests = 1;
  if (maxGuests > ABSOLUTE_MAX_GUESTS) maxGuests = ABSOLUTE_MAX_GUESTS;

  let defaultLang = (p.get("lang") || "en").trim().toLowerCase();
  if (defaultLang !== "en" && defaultLang !== "ar") defaultLang = "en";

  const customLabel = (p.get("label") || "").trim();

  return { name, maxGuests, defaultLang, customLabel };
}

const inviteSettings = getInviteSettings();
// ==============================================

// =================== HELPERS ===================
function isFormElement(el) {
  return !!(el && el.closest && el.closest("input, textarea, select, button, label, a"));
}

function clampNumber(value, min, max) {
  let n = parseInt(value, 10);
  if (!Number.isFinite(n)) n = min;
  if (n < min) n = min;
  if (n > max) n = max;
  return n;
}

function setText(el, value) {
  if (el) el.textContent = value;
}

function formatInvitationText(count, currentLang) {
  if (inviteSettings.customLabel) return inviteSettings.customLabel;

  if (currentLang === "ar") {
    if (count === 0) return "الدعوة مخصّصة لشخص غير مؤكد بعد";
    if (count === 1) return "الدعوة مخصّصة لشخص واحد";
    if (count === 2) return "الدعوة مخصّصة لشخصين";
    return `الدعوة مخصّصة لـ ${count} أشخاص`;
  }

  if (count === 1) return "Invitation for 1 guest";
  return `Invitation for ${count} guests`;
}
// ==============================================

// =================== BACKGROUNDS ===================
function applySlideBackgrounds() {
  document.querySelectorAll(".slide").forEach((slide) => {
    const bg = slide.dataset.bg;
    if (bg) {
      slide.style.setProperty("--bg-image", `url(${bg})`);
    }
  });
}
// ==============================================

// =================== DOTS ===================
function buildDots() {
  if (!dotsEl) return;
  dotsEl.innerHTML = "";

  slides.forEach((_, i) => {
    const d = document.createElement("div");
    d.className = "dot" + (i === index ? " active" : "");
    d.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(d);
  });
}

function animateActiveSlide() {
  slides.forEach((slide) => {
    slide.querySelectorAll("[data-reveal]").forEach((el) => el.classList.remove("show"));
  });

  const activeSlide = slides[index];
  if (!activeSlide) return;

  const reveals = Array.from(activeSlide.querySelectorAll("[data-reveal]"));
  reveals.forEach((el, i) => {
    setTimeout(() => el.classList.add("show"), 180 + i * 130);
  });
}

function goTo(i) {
  index = Math.max(0, Math.min(slides.length - 1, i));

  slides.forEach((s, n) => {
    s.classList.toggle("is-active", n === index);
  });

  if (dotsEl) {
    Array.from(dotsEl.children).forEach((d, n) => {
      d.classList.toggle("active", n === index);
    });
  }

  animateActiveSlide();
}

function next() { goTo(index + 1); }
function prev() { goTo(index - 1); }
// ==============================================

// =================== MUSIC ===================
async function toggleMusic(forceOn = null) {
  const shouldOn = forceOn === null ? !musicOn : forceOn;

  try {
    if (shouldOn) {
      if (music) {
        await music.play();
      }
      if (siteVideo) {
        try { await siteVideo.play(); } catch (_) {}
      }
      musicOn = true;
      if (musicBtn) musicBtn.textContent = "🔊";
    } else {
      if (music) music.pause();
      musicOn = false;
      if (musicBtn) musicBtn.textContent = "🔈";
    }
  } catch (e) {
    musicOn = false;
    if (musicBtn) musicBtn.textContent = "🔈";
  }
}

if (musicBtn) {
  musicBtn.addEventListener("click", () => toggleMusic());
}
// ==============================================

// =================== START EXPERIENCE ===================
function startExperience() {
  toggleMusic(true);

  if (sealCardEl) {
    sealCardEl.classList.add("opening");

    setTimeout(() => {
      sealCardEl.classList.add("opened");
    }, 860);

    setTimeout(() => {
      next();
    }, 1280);

    return;
  }

  next();
}

if (startBtn) {
  startBtn.addEventListener("click", startExperience);
  startBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startExperience();
    }
  });
}

if (sealOpenBtnEl) {
  sealOpenBtnEl.addEventListener("click", (e) => {
    e.stopPropagation();
    startExperience();
  });
}
// ==============================================

// =================== LANGUAGE ===================
function updatePlaceholders() {
  if (phoneInput) phoneInput.placeholder = "+961 …";
  if (noteInput) {
    noteInput.placeholder = (lang === "ar") ? "أي ملاحظة تودّون إضافتها؟" : "Anything we should know?";
  }
}

function updateInvitationUI() {
  if (reservedNameEl) {
    reservedNameEl.textContent = inviteSettings.name || ((lang === "ar") ? "ضيفنا العزيز" : "Our dear guest");
  }

  const invitationText = formatInvitationText(cachedAllowedGuests, lang);
  setText(invitationCountEl, invitationText);
}

function setLang(newLang) {
  lang = newLang;
  document.body.classList.toggle("ar", lang === "ar");

  if (langBtn) langBtn.textContent = (lang === "ar") ? "EN" : "AR";

  document.querySelectorAll("[data-en]").forEach((el) => {
    const value = el.getAttribute(lang === "ar" ? "data-ar" : "data-en");
    if (value !== null) el.innerHTML = value;
  });

  updatePlaceholders();
  updateInvitationUI();
  animateActiveSlide();
}

if (langBtn) {
  langBtn.addEventListener("click", () => {
    setLang(lang === "en" ? "ar" : "en");
  });
}
// ==============================================

// =================== RSVP GUEST RULES ===================
function enforceGuestRules() {
  if (!guestsInput) return;

  const allowedMaxGuests = cachedAllowedGuests;
  const attending = attendingInput ? attendingInput.value === "yes" : true;

  if (!attending) {
    guestsInput.value = "0";
    guestsInput.max = "0";
    guestsInput.min = "0";
    guestsInput.dataset.lastValid = "0";
    return;
  }

  const minGuests = allowedMaxGuests > 0 ? 1 : 0;
  guestsInput.min = String(minGuests);
  guestsInput.max = String(allowedMaxGuests);

  if (guestsInput.value === "") {
    guestsInput.dataset.lastValid = String(minGuests);
    return;
  }

  const clamped = clampNumber(guestsInput.value, minGuests, allowedMaxGuests);
  guestsInput.value = String(clamped);
  guestsInput.dataset.lastValid = String(clamped);
}

function onGuestsTyping() {
  if (!guestsInput) return;

  const attending = attendingInput ? attendingInput.value === "yes" : true;
  const allowedMaxGuests = cachedAllowedGuests;

  if (!attending) {
    guestsInput.value = "0";
    guestsInput.dataset.lastValid = "0";
    return;
  }

  const raw = guestsInput.value.trim();
  if (raw === "") return;

  let n = parseInt(raw, 10);
  const minGuests = allowedMaxGuests > 0 ? 1 : 0;

  if (!Number.isFinite(n)) {
    guestsInput.value = guestsInput.dataset.lastValid || String(minGuests);
    return;
  }

  if (n > allowedMaxGuests) n = allowedMaxGuests;
  if (n < minGuests) n = minGuests;

  guestsInput.value = String(n);
  guestsInput.dataset.lastValid = String(n);
}

if (guestsInput) {
  guestsInput.addEventListener("input", onGuestsTyping);
  guestsInput.addEventListener("change", enforceGuestRules);
  guestsInput.addEventListener("blur", enforceGuestRules);
}

if (attendingInput) {
  attendingInput.addEventListener("change", enforceGuestRules);
}
// ==============================================

// =================== APPLY INVITE SETTINGS ===================
function applyInviteSettings() {
  cachedAllowedGuests = inviteSettings.maxGuests;

  setLang(inviteSettings.defaultLang);

  if (inviteSettings.name && nameInput) {
    nameInput.value = inviteSettings.name;
  }

  if (guestsInput) {
    guestsInput.max = String(cachedAllowedGuests);
    if (cachedAllowedGuests === 0) {
      guestsInput.value = "0";
      guestsInput.dataset.lastValid = "0";
    } else {
      guestsInput.value = "1";
      guestsInput.dataset.lastValid = "1";
    }
  }

  updateInvitationUI();
  enforceGuestRules();
}
// ==============================================

// =================== SWIPE HANDLING ===================
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;

const slider = document.getElementById("slider");

if (slider) {
  slider.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    if (isFormElement(e.target)) return;

    touchActive = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  slider.addEventListener("touchend", (e) => {
    if (!touchActive) return;
    if (isFormElement(e.target)) {
      touchActive = false;
      return;
    }

    touchActive = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (dx < -40) next();
    else if (dx > 40) prev();
  }, { passive: true });
}
// ==============================================

// =================== KEYBOARD NAVIGATION ===================
document.addEventListener("keydown", (e) => {
  const active = document.activeElement;
  if (isFormElement(active)) return;

  if (e.key === "ArrowLeft") next();
  if (e.key === "ArrowRight") prev();
});
// ==============================================

// =================== RSVP SUBMIT ===================
async function submitRSVP() {
  if (!statusEl) return;

  statusEl.textContent = (lang === "ar") ? "جارٍ الإرسال..." : "Sending...";

  const name = nameInput ? nameInput.value.trim() : "";
  const attendingValue = attendingInput ? attendingInput.value : "yes";
  const attending = attendingValue === "yes";

  let guests = guestsInput ? parseInt(guestsInput.value || "0", 10) : 0;
  if (!Number.isFinite(guests) || guests < 0) guests = 0;

  const allowedMaxGuests = cachedAllowedGuests;

  if (attending) {
    if (allowedMaxGuests === 0) {
      guests = 0;
    } else {
      if (guests < 1) guests = 1;
      if (guests > allowedMaxGuests) guests = allowedMaxGuests;
    }
  } else {
    guests = 0;
  }

  if (guestsInput) {
    guestsInput.value = String(guests);
    guestsInput.dataset.lastValid = String(guests);
  }

  const phone = phoneInput ? phoneInput.value.trim() : "";
  const note = noteInput ? noteInput.value.trim() : "";

  if (!name) {
    statusEl.textContent = (lang === "ar") ? "رابط الدعوة يفتقد الاسم." : "The invite link is missing the guest name.";
    return;
  }

  const payload = {
    name,
    attending,
    guests,
    phone,
    note,
    maxGuests: allowedMaxGuests,
    lang
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const txt = await res.text();

    let out;
    try { out = JSON.parse(txt); } catch (_) { out = null; }

    if (!out) {
      statusEl.textContent = (lang === "ar") ? "الرد ليس بصيغة صحيحة ❌" : "Response not JSON ❌";
      console.log("Non-JSON response:", txt);
      return;
    }

    if (!out.ok) {
      statusEl.textContent = (lang === "ar") ? `خطأ ❌ ${out.error || ""}` : `Error ❌ ${out.error || ""}`;
      console.log("Server returned ok:false", out);
      return;
    }

    statusEl.textContent = (lang === "ar") ? "تم الإرسال ✅" : "Sent ✅";
  } catch (err) {
    statusEl.textContent = (lang === "ar") ? "تعذر الإرسال. تحقق من الرابط." : "Could not send. Check the script URL.";
    console.error(err);
  }
}

if (submitBtn) submitBtn.addEventListener("click", submitRSVP);
// ==============================================

// =================== DECOR EFFECTS ===================
function createGoldParticles() {
  const containers = document.querySelectorAll(".gold-particles");
  if (!containers.length) return;

  containers.forEach((container) => {
    setInterval(() => {
      const p = document.createElement("span");
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = (6 + Math.random() * 5) + "s";
      p.style.opacity = String(0.4 + Math.random() * 0.6);
      p.style.transform = `scale(${0.7 + Math.random() * 0.8})`;
      container.appendChild(p);
      setTimeout(() => p.remove(), 12000);
    }, 340);
  });
}

function createGlobalHearts() {
  const container = document.querySelector(".hearts-global");
  if (!container) return;

  setInterval(() => {
    const heart = document.createElement("div");
    heart.className = "heart-global";
    heart.innerHTML = "♡";
    heart.style.left = (Math.random() * 100) + "vw";
    heart.style.fontSize = (10 + Math.random() * 12) + "px";
    heart.style.animationDuration = (8 + Math.random() * 6) + "s";
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 16000);
  }, 1000);
}
// ==============================================

// =================== INIT ===================
applySlideBackgrounds();
buildDots();
createGoldParticles();
createGlobalHearts();
applyInviteSettings();
animateActiveSlide();
// ==============================================