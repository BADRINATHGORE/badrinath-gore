// Wait until page loads
document.addEventListener("DOMContentLoaded", () => {

    // Initialize EmailJS
    emailjs.init("2jAwNzHJGwYSaZTMe");

    let num1, num2;
    const form = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submit-btn");

    // ---------------- CAPTCHA ----------------
    function generateCaptcha() {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        document.getElementById("captcha-question").innerText =
            `${num1} + ${num2} = ?🤔`;
    }

    generateCaptcha();

    // ---------------- EMAIL VALIDATION ----------------
    async function validateEmail(email) {
        // 1️⃣ Regex format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("❌ Oops! Please enter a valid email address: " + email);
            return false; // stop submission
        }

        // 2️⃣ Call API to check SMTP
        try {
            const response = await fetch(`https://apilayer.net/api/check?access_key=56fc7ddf40b8ac5b7890c7e639268bd4&email=${encodeURIComponent(email)}`);
            const data = await response.json();

            // 3️⃣ Check SMTP and warn user if fails
            if (data.smtp_check !== true) {
                const proceed = confirm(
                    "❌ Incorrect email!\nPlease enter the correct email.\n\nYour email: " + email
                );
                if (!proceed) return false;
            }

            return true; // email passed validation

        } catch (error) {
            console.error("Email validation error:", error);
            alert("❌ Sorry! We couldn't verify your email right now. Please try again later.");
            return false;
        }
    }

    // ---------------- FORM SUBMIT ----------------
    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const subject = form.subject.value.trim();
        const message = form.message.value.trim();
        const userAnswer = parseInt(document.getElementById("captcha-answer").value);

        // -------- VALIDATIONS --------

        // Name validation
        if (!/^[A-Za-z\s]+$/.test(name) || name.split(/\s+/).length < 2) {
            alert("❌ Name must include at least first name and surname.\nExample: Badrinath Gore");
            return;
        }

        // Email validation with SMTP check
        const isEmailValidResult = await validateEmail(email);
        if (!isEmailValidResult) return;

        // Phone validation
        if (!/^\d{10}$/.test(phone)) {
            alert("📱 Please enter a valid 10-digit mobile number.");
            return;
        }

        // Subject validation
        if (subject.length < 2) {
            alert("📝 Subject must be at least 2 characters long.");
            return;
        }

        // Message validation
        if (message.split(/\s+/).length < 2) {
            alert("💬 Message must contain at least 2 words.");
            return;
        }

        // CAPTCHA validation
        if (userAnswer !== (num1 + num2)) {
            alert("❌ Incorrect captcha answer. Try again! 🤓");
            generateCaptcha();
            document.getElementById("captcha-answer").value = "";
            return;
        }

        // Prevent multiple submissions
        if (sessionStorage.getItem("email_sent") === "true") {
            alert("✅ You have already submitted the form. Thank you! 🙏");
            return;
        }

        // -------- ADD FULL DATE + TIME --------
        const now = new Date();
        const formattedTime = now.toLocaleString("en-IN", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZoneName: "short"
        });

        document.getElementById("time").value = formattedTime;
        document.getElementById("year").value = now.getFullYear();

        // Disable button while submitting
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting... ⏳";

        // -------- SEND EMAIL --------
        emailjs.sendForm(
            "service_vzpsmcs",
            "template_hxlnzk1",
            form
        ).then(() => {

            alert("🎉 Hi " + name + "!\n\nYour form has been submitted successfully.\nThank you for reaching out! 😊");

            sessionStorage.setItem("email_sent", "true");

            form.reset();
            generateCaptcha();
            resetButton();

        }).catch((error) => {

            console.error("EmailJS Error:", error);
            alert("❌ Form submission failed. Please try again later. 🙏");

            generateCaptcha();
            resetButton();
        });

        // -------- RESET BUTTON --------
        function resetButton() {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Submit";
        }

    });


});

