const form = document.getElementById("loginForm");
const error = document.getElementById("error");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(email === "admin@confiesa.app" && password === "123456"){
        window.location.href = "superadmin.html";
        return;
    }

    error.textContent = "Correo o contraseña incorrectos";
});