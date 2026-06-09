import { supabase } from './supabase.js';
function timeAgo(dateString) {

    const date =
        new Date(dateString);

    const seconds =
        Math.floor(
            (Date.now() - date) / 1000
        );

    if (seconds < 60)
        return 'Ahora';

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60)
        return `hace ${minutes} min`;

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24)
        return `hace ${hours} h`;

    const days =
        Math.floor(hours / 24);

    return `hace ${days} días`;
}


let realtimeStarted = false;
const openedComments = new Set();

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
    const {
    data: setting,
    error: settingError
} = await supabase
    .from('moderator_settings')
    .select('show_public_feed')
    .eq(
        'receiver_profile_id',
        window.receiverProfileId
    )
    .single();

console.log(
    'receiverProfileId:',
    window.receiverProfileId
);

console.log(
    'setting:',
    setting
);

console.log(
    'settingError:',
    settingError
);

    if (
    !setting ||
    setting.show_public_feed === false
) {

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
        : (
            confession.display_name ||
            confession.username ||
            'Usuario'
          )
    }
</div>

            <div class="time">
    ${timeAgo(
        confession.created_at
    )}
</div>
        </div>
    </div>

    <div class="message">
    ${confession.message}
</div>

${
    confession.image_url
        ? `
        <div class="confession-image-container">
            <img
                src="${confession.image_url}"
                alt="Imagen de confesión"
                class="confession-image"
            />
        </div>
        `
        : ''
}

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

<div
    class="comments-container"
    id="comments-${confession.id}"
    style="display:none;"
></div>

</div>

</div>
`;
    });

   feed.innerHTML += `
<div class="image-modal" id="image-modal">

    <span
        class="image-modal-close"
        id="image-modal-close"
    >
        ✕
    </span>

    <img
        id="image-modal-img"
        src=""
        alt=""
    />

</div>
`;

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

openedComments.delete(
    confessionId
);

return;
            }

            container.style.display =
    'block';

openedComments.add(
    confessionId
);

await loadComments(
    confessionId,
    container
);

            

        }
    );

});

document
.querySelectorAll('.confession-image')
.forEach(img => {

    img.addEventListener(
        'click',
        () => {

            const modal =
                document.getElementById(
                    'image-modal'
                );

            const modalImg =
                document.getElementById(
                    'image-modal-img'
                );

            modalImg.src =
                img.src;

            modal.classList.add(
                'active'
            );

        }
    );

});

const modal =
    document.getElementById(
        'image-modal'
    );

const closeBtn =
    document.getElementById(
        'image-modal-close'
    );

if (modal && closeBtn) {

    closeBtn.onclick = () => {

        modal.classList.remove(
            'active'
        );

    };

    modal.onclick = e => {

        if (e.target === modal) {

            modal.classList.remove(
                'active'
            );

        }

    };

}
subscribeRealtime();
}



async function loadComments(
    confessionId,
    container
) {

    const { data, error } =
        await supabase
            .from('confession_comments_feed')
            .select('*')
            .eq(
                'confession_id',
                confessionId
            )
            .order(
                'created_at',
                {
                    ascending: false
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
            ${comment.author_name || 'Anónimo'}
        </div>

<div class="comment-time">
    ${timeAgo(comment.created_at)}
</div>

        <div class="comment-text">
            ${comment.message}
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

const commentBtn =
    document.querySelector(
        `.comment-btn[data-id="${confessionId}"]`
    );

if (commentBtn) {

    const totalActual =
        parseInt(
            commentBtn.textContent.match(/\d+/)?.[0] || 0
        );

    commentBtn.innerHTML =
        `💬 ${totalActual + 1}`;
}

};

function subscribeRealtime() {

    if (realtimeStarted) return;

    realtimeStarted = true;

    supabase
        .channel(
    'public-feed-' +
    Date.now()
)

        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'web_comments'
            },
            async () => {

                console.log(
                    'Comentario detectado'
                );

                await loadFeed();

                await new Promise(
    resolve =>
        setTimeout(resolve, 200)
);

for (const confessionId of openedComments) {

    const container =
        document.getElementById(
            `comments-${confessionId}`
        );

    if (container) {

        container.style.display =
            'block';

        await loadComments(
            confessionId,
            container
        );
    }
}
            }
        )

        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'web_likes'
            },
            () => {

                console.log(
                    'Like detectado'
                );

                loadFeed();
            }
        )

        .on(
    'postgres_changes',
    {
        event: 'UPDATE',
        schema: 'public',
        table: 'moderator_settings'
    },
    payload => {

        console.log(
            'Configuración de moderador actualizada'
        );

        if (
            payload.new.receiver_profile_id ===
            window.receiverProfileId
        ) {
            loadFeed();
        }
    }
)

.subscribe((status) => {
    console.log(
        'Realtime status:',
        status
    );
});
}