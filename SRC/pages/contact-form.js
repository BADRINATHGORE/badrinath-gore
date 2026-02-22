 // Wait until page loads
document.addEventListener("DOMContentLoaded", () => {

    // Initialize EmailJS
    emailjs.init("2jAwNzHJGwYSaZTMe");

    let num1, num2;
    let isSubmitting = false; // 🔒 Hard lock for one-click submit

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
            return false;
        }

        // 2️⃣ SMTP API check (with timeout for faster fail)
        try {

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(
                `https://apilayer.net/api/check?access_key=56fc7ddf40b8ac5b7890c7e639268bd4&email=${encodeURIComponent(email)}`,
                { signal: controller.signal }
            );

            clearTimeout(timeout);

            const data = await response.json();

            // 3️⃣ Keep your original confirm logic (NOT changed)
            if (data.smtp_check !== true) {
                const proceed = confirm(
                    "❌ Incorrect email!\nPlease enter the correct email.\n\nYour email: " + email
                );
                if (!proceed) return false;
            }

            return true;

        } catch (error) {
            console.error("Email validation error:", error);
            alert("❌ Sorry! We couldn't verify your email right now. Please try again later.");
            return false;
        }
    }

    // ---------------- RESET BUTTON ----------------
    function resetButton() {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit";
        isSubmitting = false;
    }

    // ---------------- FORM SUBMIT ----------------
    form.addEventListener("submit", async function(e) {

        e.preventDefault();

        // 🚫 Prevent multiple clicks instantly
        if (isSubmitting) return;
        isSubmitting = true;

        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting... ⏳";

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
            resetButton();
            return;
        }

        // Email validation with SMTP check
        const isEmailValidResult = await validateEmail(email);
        if (!isEmailValidResult) {
            resetButton();
            return;
        }

        // Phone validation
        if (!/^\d{10}$/.test(phone)) {
            alert("📱 Please enter a valid 10-digit mobile number.");
            resetButton();
            return;
        }

        // Subject validation
        if (subject.length < 2) {
            alert("📝 Subject must be at least 2 characters long.");
            resetButton();
            return;
        }

        // Message validation
        if (message.split(/\s+/).length < 2) {
            alert("💬 Message must contain at least 2 words.");
            resetButton();
            return;
        }

        // CAPTCHA validation
        if (userAnswer !== (num1 + num2)) {
            alert("❌ Incorrect captcha answer. Try again! 🤓");
            generateCaptcha();
            document.getElementById("captcha-answer").value = "";
            resetButton();
            return;
        }

        // Prevent session re-submit
        if (sessionStorage.getItem("email_sent") === "true") {
            alert("✅ You have already submitted the form. Thank you! 🙏");
            resetButton();
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

        // -------- SEND EMAIL --------
        try {

            await emailjs.sendForm(
                "service_vzpsmcs",
                "template_hxlnzk1",
                form
            );

            alert("🎉 Hi " + name + "!\n\nYour form has been submitted successfully.\nThank you for reaching out! 😊");

            sessionStorage.setItem("email_sent", "true");

            form.reset();
            generateCaptcha();
            resetButton();

        } catch (error) {

            console.error("EmailJS Error:", error);
            alert("❌ Form submission failed. Please try again later. 🙏");

            generateCaptcha();
            resetButton();
        }

    });

});
