const SUPABASE_URL = "https://msudwsdzhbqmqhzcxkon.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdWR3c2R6aGJxbXFoemN4a29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTQ5NzcsImV4cCI6MjA5NjE5MDk3N30.wmGUz_ztJ5N_x0gkq1UycN-L2I9_MEBVNFeOQhKp5hA";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const form = document.getElementById("loginForm");
const error = document.getElementById("error");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    error.textContent = "";

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    try {

        const { data, error: queryError } =
            await supabaseClient
                .from("super_admins")
                .select("*")
                .eq("email", email)
                .eq("password", password)
                .single();

        if (queryError || !data) {

            error.textContent =
                "Correo o contraseña incorrectos";

            return;
        }

localStorage.setItem(
    "superadmin",
    "true"
);

localStorage.setItem(
    "superadmin_email",
    email
);

localStorage.setItem(
    "superadmin_password",
    password
);

        window.location.href =
            "superadmin.html";

    } catch (err) {

        console.error(err);

        error.textContent =
            "Error al iniciar sesión";
    }
});