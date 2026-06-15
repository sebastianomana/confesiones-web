// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL = "https://msudwsdzhbqmqhzcxkon.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdWR3c2R6aGJxbXFoemN4a29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTQ5NzcsImV4cCI6MjA5NjE5MDk3N30.wmGUz_ztJ5N_x0gkq1UycN-L2I9_MEBVNFeOQhKp5hA";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ========================================
// VARIABLES
// ========================================

let allConfessions = [];
let users = [];
let currentUser = null;
let currentFilter = "all";

let searchText = "";

// ========================================
// ELEMENTOS
// ========================================

const usersList =
    document.getElementById("usersList");

const confessionsContainer =
    document.getElementById(
        "confessionsContainer"
    );

const searchInput =
    document.getElementById(
        "searchUser"
    );

const displayName =
    document.getElementById(
        "displayName"
    );

const username =
    document.getElementById(
        "username"
    );

const userAvatar =
    document.getElementById(
        "userAvatar"
    );

const feedStatus =
    document.getElementById(
        "feedStatus"
    );

    const totalUsers =
document.getElementById(
"totalUsers"
);

const totalConfessions =
document.getElementById(
"totalConfessions"
);

const totalPending =
document.getElementById(
"totalPending"
);

const totalApproved =
document.getElementById(
"totalApproved"
);

const totalRejected =
document.getElementById(
"totalRejected"
);

const imageModal =
document.getElementById(
"imageModal"
);

const modalImage =
document.getElementById(
"modalImage"
);

const closeModal =
document.getElementById(
"closeModal"
);    

// ========================================
// INIT
// ========================================

init();

async function init() {

const adminEmail =
    localStorage.getItem(
        "superadmin_email"
    );

const adminPassword =
    localStorage.getItem(
        "superadmin_password"
    );

    if(
        !adminEmail ||
        !adminPassword
    ){
        window.location.href = "explorar.html";
        return;
    }

    const { data: admin } =
        await supabaseClient
            .from("super_admins")
            .select("*")
            .eq("email", adminEmail)
            .eq("password", adminPassword)
            .single();

    if(!admin){
        localStorage.clear();

        window.location.href =
            "admin-login.html";

        return;
    }

    await loadData();

    searchInput.addEventListener(
        "input",
        renderUsers
    );
}

// ========================================
// CARGAR DATOS
// ========================================

async function loadData() {

    const { data, error } =
        await supabaseClient
            .from(
                "superadmin_confessions"
            )
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {
        console.error(error);
        alert(error.message);
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

updateDashboard();

    renderUsers();

    if (currentUser) {
    showUser(currentUser);
} else if (users.length > 0) {
    showUser(
        users[0].receiver_profile_id
    );
}
}

// ========================================
// USUARIOS
// ========================================

function updateDashboard(){

    totalUsers.textContent =
        users.length;

    totalConfessions.textContent =
        allConfessions.length;

    totalPending.textContent =
        allConfessions.filter(
            c => c.status === "pending"
        ).length;

    totalApproved.textContent =
        allConfessions.filter(
            c => c.status === "approved"
        ).length;

    totalRejected.textContent =
        allConfessions.filter(
            c => c.status === "rejected"
        ).length;
}

function renderUsers() {

    const query =
        searchInput.value
        .toLowerCase();

    usersList.innerHTML = "";

    users
        .filter(user => {

            const username =
                (
                    user.username || ""
                ).toLowerCase();

            const displayName =
                (
                    user.display_name ||
                    ""
                ).toLowerCase();

            return (
                username.includes(query)
                ||
                displayName.includes(
                    query
                )
            );

        })
        .forEach(user => {

            const total =
                allConfessions.filter(
                    confession =>
                        confession.receiver_profile_id ===
                        user.receiver_profile_id
                ).length;

                const approved =
    allConfessions.filter(
        confession =>
            confession.receiver_profile_id ===
            user.receiver_profile_id &&
            confession.status === "approved"
    ).length;

const pending =
    allConfessions.filter(
        confession =>
            confession.receiver_profile_id ===
            user.receiver_profile_id &&
            confession.status === "pending"
    ).length;

    const rejected =
    allConfessions.filter(
        confession =>
            confession.receiver_profile_id ===
            user.receiver_profile_id &&
            confession.status === "rejected"
    ).length;
    
            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "user-item";

            div.innerHTML = `
                <img
                    src="${
                        user.avatar_url ||
                        'https://placehold.co/100'
                    }"
                >

                <div class="user-info">

                    <h4>
                        ${
                            user.display_name ||
                            'Usuario'
                        }
                    </h4>

                    <p>
                        @${user.username}
                    </p>

<div class="user-stats">

    <small>
        📝 ${total} 
    </small>

    <small>
        ✅ ${approved}
    </small>

    <small>
        ⏳ ${pending}
    </small>

    <small>
        ❌ ${rejected}
    </small>

</div>

                </div>
            `;

            div.onclick = () => {

                document
                    .querySelectorAll(
                        ".user-item"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );

                div.classList.add(
                    "active"
                );

                showUser(
                    user.receiver_profile_id
                );
            };

            usersList.appendChild(div);

        });
}

// ========================================
// MOSTRAR USUARIO
// ========================================

function showUser(profileId) {

    updateCounters(profileId);
    currentUser = profileId;

    const user =
        users.find(
            item =>
                item.receiver_profile_id ===
                profileId
        );

    if (!user) return;

    displayName.textContent =
        user.display_name ||
        "Usuario";

    username.textContent =
        "@" +
        (
            user.username ||
            "usuario"
        );

    userAvatar.src =
        user.avatar_url ||
        "https://placehold.co/100";

    feedStatus.textContent =
        user.show_public_feed
            ? "🟢 Feed Público"
            : "🔒 Feed Oculto";

    renderConfessions(profileId);
}

// ========================================
// CONFESIONES
// ========================================

function renderConfessions(
    profileId
) {

    let confessions =
    allConfessions.filter(
        c =>
            c.receiver_profile_id ===
            profileId
    );

if(currentFilter !== "all"){

    confessions =
        confessions.filter(
            c =>
                c.status ===
                currentFilter
        );
}

if(searchText){

    confessions =
        confessions.filter(
            c =>
                (
                    c.message || ""
                )
                .toLowerCase()
                .includes(
                    searchText
                )
        );
}


    if (
        confessions.length === 0
    ) {

        confessionsContainer.innerHTML = `
            <div class="empty-state">
                No existen confesiones
            </div>
        `;

        return;
    }

    confessionsContainer.innerHTML = "";

    confessions.forEach(
        confession => {

            let statusClass =
                "pending";

            if (
                confession.status ===
                "approved"
            ) {
                statusClass =
                    "approved";
            }

            if (
                confession.status ===
                "rejected"
            ) {
                statusClass =
                    "rejected";
            }

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card";

            card.innerHTML = `
                <div class="card-top">

                    <span class="status ${statusClass}">
                        ${confession.status}
                    </span>

                    <small>
                        ${formatDate(
                            confession.created_at
                        )}
                    </small>

                </div>

                <div class="message-box">
    ${confession.message}
</div>

                ${
                    confession.image_url
                    ?
                    `
                    <img
    src="${confession.image_url}"
    class="card-image"
    onclick="openImage('${confession.image_url}')"
>
                    `
                    :
                    ""
                }

               

                <div class="card-actions">

                    ${
                        confession.status !==
                        "approved"
                        ?
                        `
                        <button
                            class="approve-btn"
                            onclick="approveConfession('${confession.id}')"
                        >
                            Aprobar
                        </button>
                        `
                        :
                        ""
                    }

                    ${
                        confession.status !==
                        "rejected"
                        ?
                        `
                        <button
                            class="reject-btn"
                            onclick="rejectConfession('${confession.id}')"
                        >
                            Rechazar
                        </button>
                        `
                        :
                        ""
                    }

                    <button
                        class="delete-btn"
                        onclick="deleteConfession('${confession.id}')"
                    >
                        Eliminar
                    </button>

                </div>
            `;

            confessionsContainer.appendChild(
                card
            );
        }
    );
}

// ========================================
// APROBAR
// ========================================

async function approveConfession(id) {

    const confirmApprove =
        confirm(
            "¿Deseas aprobar esta confesión?"
        );

    if (!confirmApprove)
        return;

    const { error } =
        await supabaseClient
            .from("confessions")
            .update({
                status: "approved"
            })
            .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadData();
}

// ========================================
// RECHAZAR
// ========================================

async function rejectConfession(
    id
) {

    const confirmReject =
        confirm(
            "¿Deseas rechazar esta confesión?"
        );

    if (!confirmReject)
        return;

    const { error } =
        await supabaseClient
            .from("confessions")
            .update({
                status:
                    "rejected"
            })
            .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadData();
}

// ========================================
// ELIMINAR
// ========================================

async function deleteConfession(
    id
) {

    const confirmDelete =
        confirm(
            "¿Eliminar confesión?"
        );

    if (!confirmDelete)
        return;

    const { error } =
        await supabaseClient
            .from("confessions")
            .delete()
            .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadData();
}

// ========================================
// FECHA
// ========================================

function openImage(src){

    modalImage.src = src;

    imageModal.classList.add(
        "active"
    );
}

closeModal.onclick = () => {

    imageModal.classList.remove(
        "active"
    );

};

imageModal.onclick = (e) => {

    if(
        e.target === imageModal
    ){
        imageModal.classList.remove(
            "active"
        );
    }

};

function filterConfessions(
    status,
    button
){

    currentFilter = status;

    document
    .querySelectorAll(
        ".filter-btn"
    )
    .forEach(btn =>
        btn.classList.remove(
            "active"
        )
    );

    button.classList.add(
        "active"
    );

    renderConfessions(
        currentUser
    );
}

function searchConfessions(){

    searchText =
        document
        .getElementById(
            "confessionSearch"
        )
        .value
        .toLowerCase();

    renderConfessions(
        currentUser
    );
}

function updateCounters(profileId){

    const userConfessions =
        allConfessions.filter(
            c =>
                c.receiver_profile_id ===
                profileId
        );

    document.getElementById(
        "countAll"
    ).textContent =
        userConfessions.length;

    document.getElementById(
        "countApproved"
    ).textContent =
        userConfessions.filter(
            c => c.status === "approved"
        ).length;

    document.getElementById(
        "countPending"
    ).textContent =
        userConfessions.filter(
            c => c.status === "pending"
        ).length;

    document.getElementById(
        "countRejected"
    ).textContent =
        userConfessions.filter(
            c => c.status === "rejected"
        ).length;
}

function formatDate(
    dateString
) {

    return new Date(
        dateString
    ).toLocaleString(
        "es-CO",
        {
            dateStyle:
                "medium",
            timeStyle:
                "short"
        }
    );
}

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if(logoutBtn){

    logoutBtn.onclick = () => {

    localStorage.clear();

    window.location.href =
        "explorar.html";

};

}