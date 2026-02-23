// Wait until page loads
document.addEventListener("DOMContentLoaded", () => {

    // ---------------- INIT ----------------
    emailjs.init("2jAwNzHJGwYSaZTMe");

    let num1, num2;
    let isSubmitting = false;
    let isEmailValidLive = false; // ✅ real-time email status

    const form = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submit-btn");
    const emailInput = form.email;

    // Create live email status element
    const emailStatus = document.createElement("small");
    emailStatus.style.display = "block";
    emailStatus.style.marginTop = "5px";
    emailInput.parentNode.appendChild(emailStatus);

    // ---------------- CAPTCHA ----------------
    function generateCaptcha() {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        document.getElementById("captcha-question").innerText =
            `${num1} + ${num2} = ?🤔`;
    }

    generateCaptcha();

    // ---------------- REAL-TIME EMAIL VALIDATION ----------------
    let emailCheckTimeout;

    emailInput.addEventListener("input", function() {

        const email = emailInput.value.trim();
        isEmailValidLive = false;
        emailStatus.textContent = "";

        clearTimeout(emailCheckTimeout);

        // Regex quick check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailStatus.textContent = "❌ Invalid email format";
            emailStatus.style.color = "red";
            return;
        }

        emailStatus.textContent = "⏳ Checking email...";
        emailStatus.style.color = "orange";

        // Delay SMTP check (debounce)
        emailCheckTimeout = setTimeout(async() => {
            try {
                // mailnoxlayer api
              //  const response = await fetch(
                //    `https://apilayer.net/api/check?access_key=56fc7ddf40b8ac5b7890c7e639268bd4&email=${encodeURIComponent(email)}`
            //    );

const response = await fetch(
    `https://apilayer.net/api/check?access_key=74f27bc7d6d1f9180206a661f159cc8c&email=${encodeURIComponent(email)}`
);
                
                const data = await response.json();

                if (data.smtp_check === true) {
                    emailStatus.textContent = "✅ Valid email";
                    emailStatus.style.color = "green";
                    isEmailValidLive = true;
                } else {
                    emailStatus.textContent = "❌ Email does not exist";
                    emailStatus.style.color = "red";
                    isEmailValidLive = false;
                }

            } catch (error) {
                emailStatus.textContent = "⚠️ Could not verify email";
                emailStatus.style.color = "red";
                isEmailValidLive = false;
            }
        }, 700); // 700ms debounce

    });

    // ---------------- RESET BUTTON ----------------
    function resetButton() {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit";
    }

    // ---------------- FORM SUBMIT ----------------
    form.addEventListener("submit", async function(e) {

        e.preventDefault();

        if (isSubmitting || sessionStorage.getItem("email_sent") === "true") {
            alert("✅ You have already submitted the form. Thank you! " + name + " 🙏");
            return;
        }

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

        if (!/^[A-Za-z\s]+$/.test(name) || name.split(/\s+/).length < 2) {
            alert("❌ Name must include at least first name and surname.\nExample: Badrinath Gore");
            resetButton();
            return;
        }

        if (!isEmailValidLive) {
            alert("❌ Incorrect email!\nPlease enter the correct email.\n\nYour email: " + email);
            emailInput.focus();
            resetButton();
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            alert("📱 Please enter a valid 10-digit mobile number.");
            resetButton();
            return;
        }

        if (subject.length < 1) {
            alert("📝 Subject must be at least 1 characters long.");
            resetButton();
            return;
        }

        if (message.split(/\s+/).length < 1) {
            alert("💬 Message must contain at least 1 words.");
            resetButton();
            return;
        }

        if (userAnswer !== (num1 + num2)) {
            alert("❌ Incorrect captcha answer. Try again! 🤓");
            generateCaptcha();
            document.getElementById("captcha-answer").value = "";
            resetButton();
            return;
        }

        // 🔐 Lock before sending
        sessionStorage.setItem("email_sent", "true");

        // -------- ADD DATE & TIME --------
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

            submitBtn.innerText = "Submitted";
            form.reset();
            generateCaptcha();
            window.location.reload(true);

        } catch (error) {

            console.error("EmailJS Error:", error);
            alert("❌ Form submission failed. Please try again later. 🙏");

            sessionStorage.removeItem("email_sent");
            generateCaptcha();
            resetButton();
        }

    });


});
