const SUPABASE_URL = "TU_URL";
const SUPABASE_KEY = "TU_ANON_KEY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let allConfessions = [];
let users = [];

const usersList = document.getElementById("usersList");
const confessionsContainer = document.getElementById("confessionsContainer");

const displayName = document.getElementById("displayName");
const username = document.getElementById("username");
const userAvatar = document.getElementById("userAvatar");
const feedStatus = document.getElementById("feedStatus");

init();

async function init() {

    await loadData();

}

async function loadData() {

    const { data, error } = await supabaseClient
        .from("superadmin_confessions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    allConfessions = data;

    users = [
        ...new Map(
            data.map(user => [
                user.receiver_profile_id,
                user
            ])
        ).values()
    ];

    renderUsers();

}

function renderUsers() {

    usersList.innerHTML = "";

    users.forEach(user => {

        const div = document.createElement("div");

        div.className = "user-item";

        div.innerHTML = `
            <img src="${user.avatar_url || 'https://placehold.co/100'}">

            <div class="user-info">
                <h4>${user.display_name}</h4>
                <p>@${user.username}</p>
            </div>
        `;

        div.addEventListener("click", () => {

            document
                .querySelectorAll(".user-item")
                .forEach(x => x.classList.remove("active"));

            div.classList.add("active");

            showUser(user.receiver_profile_id);

        });

        usersList.appendChild(div);

    });

}

function showUser(profileId) {

    const user = users.find(
        u => u.receiver_profile_id === profileId
    );

    if (!user) return;

    displayName.textContent =
        user.display_name;

    username.textContent =
        "@" + user.username;

    userAvatar.src =
        user.avatar_url ||
        "https://placehold.co/100";

    feedStatus.textContent =
        user.show_public_feed
            ? "Feed Público"
            : "Feed Oculto";

    const userConfessions =
        allConfessions.filter(
            c => c.receiver_profile_id === profileId
        );

    renderConfessions(userConfessions);

}

function renderConfessions(confessions) {

    confessionsContainer.innerHTML = "";

    confessions.forEach(confession => {

        let statusClass = "pending";

        if (confession.status === "approved")
            statusClass = "approved";

        if (confession.status === "rejected")
            statusClass = "rejected";

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <div class="card-top">

                <span class="status ${statusClass}">
                    ${confession.status}
                </span>

                <small>
                    ${formatDate(confession.created_at)}
                </small>

            </div>

            ${
                confession.image_url
                ?
                `<img
                    src="${confession.image_url}"
                    class="card-image"
                >`
                :
                ""
            }

            <p class="message">
                ${confession.message}
            </p>

            <div class="card-actions">

                <button
                    class="approve-btn"
                    onclick="approveConfession('${confession.id}')"
                >
                    Aprobar
                </button>

                <button
                    class="reject-btn"
                    onclick="rejectConfession('${confession.id}')"
                >
                    Rechazar
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteConfession('${confession.id}')"
                >
                    Eliminar
                </button>

            </div>
        `;

        confessionsContainer.appendChild(card);

    });

}

function formatDate(date) {

    return new Date(date)
        .toLocaleString("es-CO");

}