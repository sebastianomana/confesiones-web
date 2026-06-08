import { supabase } from './supabase.js';

export async function loadFeed() {

    const feed = document.getElementById('feed');

    // Revisar configuración
    const { data: setting } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'show_public_feed')
        .single();

    if (setting?.value !== 'true') {

        feed.innerHTML = `
            <div style="
                text-align:center;
                padding:20px;
                color:#666;
            ">
                🔒 Las confesiones están ocultas por el moderador.
            </div>
        `;

        return;
    }

    if (!window.receiverProfileId) {
    feed.innerHTML = `
        <div style="
            text-align:center;
            padding:20px;
            color:#666;
        ">
            Usuario no encontrado.
        </div>
    `;
    return;
}

    const { data: confessions, error } = await supabase
    .from('confession_feed')
    .select('*')
    .eq('status', 'approved')
    .eq(
        'receiver_profile_id',
        window.receiverProfileId
    )
    .order('created_at', {
        ascending: false,
    })
    .limit(50);

    if (error) {
        console.error(error);
        return;
    }

    feed.innerHTML = '';

    confessions.forEach(confession => {

        feed.innerHTML += `
<div class="confession-card">

    <div class="confession-header">
        <div class="avatar">
            ${
              confession.is_anonymous
                ? '🎭'
                : '👤'
            }
        </div>

        <div>
            <div class="author">
                ${
                  confession.is_anonymous
                    ? 'Usuario Anónimo'
                    : 'Usuario'
                }
            </div>

            <div class="time">
                ${new Date(
                  confession.created_at
                ).toLocaleString()}
            </div>
        </div>
    </div>

    <div class="message">
        ${confession.message}
    </div>

    <hr>

    <div class="actions">

    <span
        class="like-btn"
        data-id="${confession.id}"
        style="cursor:pointer;"
    >
        ❤️ ${confession.likes || 0}
    </span>

    <span
        class="comment-btn"
        data-id="${confession.id}"
        style="cursor:pointer;"
    >
        💬 ${confession.comments_count || 0}
    </span>

</div>

</div>
`;
    });

    document
    .querySelectorAll('.like-btn')
    .forEach(btn => {

        btn.addEventListener(
            'click',
            async () => {

                const confessionId = btn.dataset.id;

const localKey = `liked_${confessionId}`;

if (localStorage.getItem(localKey)) {

    alert('Ya diste like a esta confesión.');

    return;
}

localStorage.setItem(localKey, 'true');

alert('Like registrado');

            }
        );

    });
}