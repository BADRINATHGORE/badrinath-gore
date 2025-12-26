// Wait until page loads
document.addEventListener("DOMContentLoaded", () => {

    // Initialize EmailJS AFTER library loads
    emailjs.init("2jAwNzHJGwYSaZTMe");

    let num1, num2;

    // Generate CAPTCHA
    function generateCaptcha() {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        document.getElementById("captcha-question").innerText =
            `${num1} + ${num2} = ?`;
    }

    generateCaptcha();

    const form = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submit-btn");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const subject = form.subject.value.trim();
        const message = form.message.value.trim();
        const userAnswer = parseInt(
            document.getElementById("captcha-answer").value
        );

        // ---- VALIDATIONS ----

        // Name: first + last
        if (!/^[A-Za-z\s]+$/.test(name) || name.split(/\s+/).length < 2) {
            
            alert("Name must include at least first name and surname.\nExample: Badrinath Gore");

            return;
        }

        // Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Phone
        if (!/^\d{10}$/.test(phone)) { 
            alert("Please enter a valid 10-digit mobile number.\nMake sure all digits are correct.");

            return;
        }

        // Subject
        if (subject.length < 2) {
            alert("Subject must be at least 2 characters.");
            return;
        }

        // Message
        if (message.split(/\s+/).length < 2) {
            alert("Message must contain at least 2 words.");
            return;
        }

        // CAPTCHA
        if (userAnswer !== (num1 + num2)) {
            alert("Incorrect captcha answer.\nEnter the correct captcha answer.");

            generateCaptcha();
            document.getElementById("captcha-answer").value = "";
            return;
        }

        // Prevent multiple submissions
        if (sessionStorage.getItem("email_sent") === "true") {
            alert("You have already submitted the form.\nPlease do not submit again.");

            return;
        }

        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        // ---- SEND EMAIL ----
        emailjs.sendForm(
            "service_vzpsmcs",
            "template_hxlnzk1",
            form
        ).then(() => {
            alert("Form submitted successfully!\nThank you for filling out the form 🙏");
            sessionStorage.setItem("email_sent", "true");
            form.reset();
            generateCaptcha();
            resetButton();
            location.reload();
        }).catch((error) => {
           alert("Form submission failed due to a technical issue.\nPlease try again later.");

            console.error("EmailJS Error:", error);
            generateCaptcha();
            resetButton();
            location.reload();
        });

        function resetButton() {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span>Submit</span>
                <div class="position-absolute top-50 end-0 translate-middle-y me-3">
                    <svg class="arrow-right text-white p-1" width="28" height="28">
                        <use xlink:href="#arrow-right"></use>
                    </svg>
                </div>`;
        }
    });

});

