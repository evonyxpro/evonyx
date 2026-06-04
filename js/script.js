/* ====================================================================
   EVONYX — script.js
   Features:
   1. Custom cursor with magnetic effect
   2. Constellation particle canvas (mouse-reactive)
   3. Nav scroll effect + mobile burger
   4. Staggered scroll-reveal with IntersectionObserver
   5. Contact form validation
   6. Notify form
   7. Footer year
==================================================================== */

(function () {
  "use strict";

  /* ─────────────────────────────
     1. CUSTOM CURSOR
  ───────────────────────────── */
  var cursor   = document.getElementById("cursor");
  var follower = document.getElementById("cursorFollower");

  if (cursor && follower && window.matchMedia("(hover: hover)").matches) {
    var mx = -100, my = -100;
    var fx = -100, fy = -100;

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + "px";
      cursor.style.top  = my + "px";
    });

    (function animFollower() {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + "px";
      follower.style.top  = fy + "px";
      requestAnimationFrame(animFollower);
    })();

    // Expand cursor on interactive elements
    var interactives = document.querySelectorAll("a, button, input, textarea, select, .svc-item, .phi-card");
    interactives.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.style.width  = "14px";
        cursor.style.height = "14px";
        follower.style.width  = "48px";
        follower.style.height = "48px";
        follower.style.opacity = ".3";
      });
      el.addEventListener("mouseleave", function () {
        cursor.style.width  = "8px";
        cursor.style.height = "8px";
        follower.style.width  = "32px";
        follower.style.height = "32px";
        follower.style.opacity = ".5";
      });
    });
  }

  /* ─────────────────────────────
     2. CONSTELLATION CANVAS
  ───────────────────────────── */
  var canvas = document.getElementById("constellation");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var W, H;
    var mouse = { x: -9999, y: -9999 };
    var PARTICLE_COUNT = 90;
    var CONNECT_DIST   = 140;
    var MOUSE_DIST     = 200;
    var particles = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Particle() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * .35;
      this.vy = (Math.random() - .5) * .35;
      this.r  = Math.random() * 1.4 + .6;
      this.alpha = Math.random() * .5 + .2;
    }

    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;

      // Gentle repulsion from mouse
      var dx = this.x - mouse.x;
      var dy = this.y - mouse.y;
      var d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MOUSE_DIST) {
        var force = (MOUSE_DIST - d) / MOUSE_DIST * .015;
        this.vx += (dx / d) * force;
        this.vy += (dy / d) * force;
        // clamp velocity
        var speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        if (speed > 1.2) { this.vx = (this.vx/speed)*1.2; this.vy = (this.vy/speed)*1.2; }
      }
    };

    // Gold palette for particles
    var COLORS = ["rgba(198,162,94,", "rgba(223,192,122,", "rgba(180,145,80,"];

    Particle.prototype.draw = function () {
      var col = COLORS[Math.floor(Math.random() * COLORS.length)];
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = col + this.alpha + ")";
      ctx.fill();
    };

    function initParticles() {
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    }

    function drawLines() {
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var d  = Math.sqrt(dx*dx + dy*dy);
          if (d < CONNECT_DIST) {
            var alpha = (1 - d / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "rgba(198,162,94," + alpha + ")";
            ctx.lineWidth = .7;
            ctx.stroke();
          }
        }

        // Line from mouse to nearby particles
        var mdx = particles[i].x - mouse.x;
        var mdy = particles[i].y - mouse.y;
        var md  = Math.sqrt(mdx*mdx + mdy*mdy);
        if (md < MOUSE_DIST) {
          var ma = (1 - md / MOUSE_DIST) * 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = "rgba(198,162,94," + ma + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    var rafActive = true;
    function loop() {
      if (!rafActive) return;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(loop);
    }

    window.addEventListener("resize", function () { resize(); initParticles(); });
    document.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    document.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });

    resize();
    initParticles();
    loop();

    // Pause when tab hidden for perf
    document.addEventListener("visibilitychange", function () {
      rafActive = !document.hidden;
      if (rafActive) loop();
    });
  }

  /* ─────────────────────────────
     3. NAV — SCROLL + BURGER
  ───────────────────────────── */
  var nav    = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var mMenu  = document.getElementById("mobileMenu");

  if (nav) {
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 30);
    }, { passive: true });
  }

  if (burger && mMenu) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      mMenu.classList.toggle("open");
    });
    mMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("open");
        mMenu.classList.remove("open");
      });
    });
  }

  /* ─────────────────────────────
     4. SCROLL REVEAL (staggered)
  ───────────────────────────── */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (!entry.isIntersecting) return;
        // group siblings so cards stagger
        var delay = 0;
        var siblings = entry.target.parentElement.querySelectorAll(".reveal");
        siblings.forEach(function (sib, i) { if (sib === entry.target) delay = i; });
        setTimeout(function () {
          entry.target.classList.add("visible");
        }, Math.min(delay * 80, 400));
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ─────────────────────────────
     5. CONTACT FORM
  ───────────────────────────── */
  var contactForm = document.getElementById("contactForm");
  var formNote    = document.getElementById("formNote");

  if (contactForm && formNote) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name  = (contactForm.elements["name"]    || {}).value || "";
      var email = (contactForm.elements["email"]   || {}).value || "";
      var msg   = (contactForm.elements["message"] || {}).value || "";

      if (!name.trim() || !email.trim() || !msg.trim()) {
        formNote.style.color = "#e07070";
        formNote.textContent = "Please complete all required fields.";
        return;
      }
      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        formNote.style.color = "#e07070";
        formNote.textContent = "Please enter a valid email address.";
        return;
      }

      // Success state (connect Formspree for real email delivery — see README)
      formNote.style.color = "var(--gold)";
      formNote.textContent = "Thank you, " + name.split(" ")[0] + ". We'll be in touch within 24 hours.";
      contactForm.reset();
    });
  }

  /* ─────────────────────────────
     6. NOTIFY FORM (coming soon)
  ───────────────────────────── */
  var notifyForm = document.getElementById("notifyForm");
  var notifyNote = document.getElementById("notifyNote");

  if (notifyForm && notifyNote) {
    notifyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailInput = notifyForm.querySelector("input[type='email']");
      if (!emailInput || !emailInput.value.trim()) return;
      notifyNote.textContent = "You're on the list. We'll notify you when we launch.";
      notifyForm.reset();
    });
  }

  /* ─────────────────────────────
     7. FOOTER YEAR
  ───────────────────────────── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
