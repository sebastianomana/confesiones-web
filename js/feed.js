import { supabase } from './supabase.js';

export async function loadFeed() {

    const feed = document.getElementById('feed');

    let visitorId =
    localStorage.getItem('visitor_id');

if (!visitorId) {

    visitorId =
        crypto.randomUUID();

    localStorage.setItem(
        'visitor_id',
        visitorId
    );
}

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
    data-liked="${
        localStorage.getItem(
            `liked_${confession.id}`
        )
            ? 'true'
            : 'false'
    }"
    style="cursor:pointer;"
>
    ${
      localStorage.getItem(
        `liked_${confession.id}`
      )
        ? '❤️'
        : '🤍'
    }
    ${confession.likes || 0}
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

            alert(
                'Ya diste like a esta confesión.'
            );

            return;
        }

        const { error } = await supabase
    .from('web_likes')
    .insert({
        confession_id: confessionId,
        visitor_id: visitorId
    });

        if (error) {

            console.error(error);

            alert(
                'Error al registrar el like.'
            );

            return;
        }

        localStorage.setItem(
            localKey,
            'true'
        );

        localStorage.setItem(
    localKey,
    'true'
);

btn.innerHTML =
    btn.innerHTML.replace(
        '🤍',
        '❤️'
    );

alert(
    'Like registrado'
);

    }
);

    });
}