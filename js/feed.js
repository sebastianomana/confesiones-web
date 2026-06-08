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

    const { data: webLikes } = await supabase
    .from('web_likes')
    .select('confession_id');

    if (error) {
        console.error(error);
        return;
    }

    const likesMap = {};

webLikes?.forEach(like => {

    likesMap[like.confession_id] =
        (likesMap[like.confession_id] || 0) + 1;

});


const { data: comments } =
    await supabase
        .from('web_comments')
        .select(
            'confession_id'
        );

const commentsMap = {};

comments?.forEach(comment => {

    commentsMap[
        comment.confession_id
    ] =
        (
            commentsMap[
                comment.confession_id
            ] || 0
        ) + 1;

});

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
    ${likesMap[confession.id] || 0}
</span>

    <span
    class="comment-btn"
    data-id="${confession.id}"
    style="cursor:pointer;"
>
    💬 ${commentsMap[confession.id] || 0}
</span>

<div
    class="comments-container"
    id="comments-${confession.id}"
    style="display:none;"
></div>

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

const likesActuales =
    parseInt(
        btn.textContent.match(/\d+/)?.[0] || 0
    );

btn.innerHTML = `
    ❤️ ${likesActuales + 1}
`;

    }
);

    });

    document
.querySelectorAll('.comment-btn')
.forEach(btn => {

    btn.addEventListener(
        'click',
        async () => {

            const confessionId =
                btn.dataset.id;

            const container =
                document.getElementById(
                    `comments-${confessionId}`
                );

            if (
                container.style.display ===
                'block'
            ) {

                container.style.display =
                    'none';

                return;
            }

            container.style.display =
                'block';

            await loadComments(
                confessionId,
                container
            );

        }
    );

});
}

async function loadComments(
    confessionId,
    container
) {

    const { data, error } =
        await supabase
            .from('web_comments')
            .select('*')
            .eq(
                'confession_id',
                confessionId
            )
            .order(
                'created_at',
                {
                    ascending: true
                }
            );

    if (error) {

        console.error(error);

        return;
    }

    container.innerHTML = `
        <div class="comments-box">

            ${
                data.length
                    ? data.map(comment => `
    <div class="comment-item">

        <div class="comment-author">
            🎭 ${comment.alias || 'Anónimo'}
        </div>

        <div class="comment-text">
            ${comment.comment}
        </div>

    </div>
`).join('')
                    : `
                        <div
                            class="comment-empty"
                        >
                            Sin comentarios
                        </div>
                    `
            }

            <textarea
    class="comment-input"
    id="comment-input-${confessionId}"
    placeholder="Escribe un comentario..."
></textarea>

            <button
    class="comment-button"
                onclick="
                    submitComment(
                        '${confessionId}'
                    )
                "
            >
                Comentar
            </button>

        </div>
    `;
}

window.submitComment =
async function (
    confessionId
) {

    let visitorId =
        localStorage.getItem(
            'visitor_id'
        );

    let anonymousAlias =
        localStorage.getItem(
            'anonymous_alias'
        );

if (!anonymousAlias) {

    anonymousAlias =
        'Anónimo #' +
        Math.floor(
            Math.random() * 1000
        );

    localStorage.setItem(
        'anonymous_alias',
        anonymousAlias
    );
}

    const input =
        document.getElementById(
            `comment-input-${confessionId}`
        );

    const comment =
        input.value.trim();

    if (!comment) return;

    const bannedWords = [
        'puta',
        'marica',
        'gonorrea'
    ];

    const invalid =
        bannedWords.some(word =>
            comment
                .toLowerCase()
                .includes(word)
        );

    if (invalid) {

        alert(
            'Comentario bloqueado.'
        );

        return;
    }

    const { error } =
        await supabase
            .from('web_comments')
            .insert({
    confession_id:
        confessionId,
    visitor_id:
        visitorId,
    alias:
        anonymousAlias,
    comment
});

    if (error) {

        console.error(error);

        alert(
            'Error al comentar.'
        );

        return;
    }

    const container =
        document.getElementById(
            `comments-${confessionId}`
        );

    await loadComments(
        confessionId,
        container
    );

};