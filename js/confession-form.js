import { supabase } from './supabase.js';

let lastSubmission = 0;

window.sendConfession = async function () {

    const now = Date.now();

    if (now - lastSubmission < 30000) {
        document.getElementById('status').innerHTML =
            '<div class="error">Espera 30 segundos antes de enviar otra confesión.</div>';
        return;
    }

    const message = document
        .getElementById('message')
        .value
        .trim();

    if (message.length < 3) {

        document.getElementById('status').innerHTML =
            '<div class="error">Escribe una confesión válida.</div>';

        return;
    }

    const { error } = await supabase
        .from('confessions')
       .insert({
    message: message,
    profile_id: null,
    receiver_profile_id:
        window.receiverProfileId ?? null,
    is_anonymous: true,
    source: 'event',
    status: 'pending',
});

    if (error) {

        console.error(error);

        document.getElementById('status').innerHTML =
            '<div class="error">Error al enviar la confesión.</div>';

        return;
    }

    lastSubmission = now;

    document.getElementById('message').value = '';

    document.getElementById('status').innerHTML =
        '<div class="success">✅ Confesión enviada correctamente.</div>';
};