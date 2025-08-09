// Initialize EmailJS
emailjs.init("2jAwNzHJGwYSaZTMe"); // Replace with your actual public key

// CAPTCHA
const num1 = Math.floor(Math.random() * 10 + 1);
const num2 = Math.floor(Math.random() * 10 + 1);
const captchaAnswer = num1 + num2;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("captcha-question").innerText = `${num1} + ${num2} = ?`;

  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Field values
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();
    const userAnswer = parseInt(document.getElementById("captcha-answer").value);

    // --- Validation Rules ---

    // Name: at least 2 words, only letters & spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name) || name.split(/\s+/).length < 2) {
      alert("Please enter your full name (first and last).");
      return;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Phone: 10 digits
    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Subject: must be at least 3 characters and not a single word like "Hi"
    if (subject.length < 2 || subject.split(/\s+/).length < 1) {
      alert("Subject must be at least 2 characters long.");
      return;
    }

    // Message: must be 6+ words
    if (message.split(/\s+/).filter(Boolean).length < 4) {
      alert("Message must contain at least 4 words.");
      return;
    }

    // CAPTCHA check
    if (userAnswer !== captchaAnswer) {
      alert("Incorrect CAPTCHA answer.");
      return;
    }

    // Prevent repeat submission
    if (sessionStorage.getItem("email_sent") === "true") {
      alert("You have already sent a message in this session.");
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Submitting...";

    // Add current time
    document.getElementById("time").value = new Date().toLocaleString();

    // Send Email
    emailjs.sendForm("service_vzpsmcs", "template_hxlnzk1", form)
      .then(() => {
        alert("Form Submitted successfully!");
        sessionStorage.setItem("email_sent", "true");
        form.reset();
        resetButton();

        // Optional: Redirect
        // window.location.href = "thank.html";
      })
      .catch((error) => {
        alert("Failed form not submitted:\n" + JSON.stringify(error));
        resetButton();
      });

    function resetButton() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Send</span>
        <div class="position-absolute top-50 end-0 translate-middle-y me-3">
          <svg class="arrow-right text-white p-1" width="28" height="28">
            <use xlink:href="#arrow-right"></use>
          </svg>
        </div>`;
    }
  });
});
