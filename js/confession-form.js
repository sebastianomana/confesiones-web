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

        const imageFile =
    document.getElementById('image').files[0];

    if (message.length < 3) {

        document.getElementById('status').innerHTML =
            '<div class="error">Escribe una confesión válida.</div>';

        return;
    }

    let imageUrl = null;

    let confessionStatus = 'approved';

if (imageFile) {

    const fileName =
        `${Date.now()}-${imageFile.name}`;

    const { error: uploadError } =
        await supabase.storage
            .from('confession-images')
            .upload(
                fileName,
                imageFile
            );

    if (uploadError) {

        console.error(uploadError);

        document.getElementById('status').innerHTML =
            '<div class="error">Error al subir imagen.</div>';

        return;
    }

    const { data } =
        supabase.storage
            .from('confession-images')
            .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
}

const { data: settings } =
    await supabase
        .from('moderator_settings')
        .select('safe_mode')
        .eq(
            'receiver_profile_id',
            window.receiverProfileId
        )
        .maybeSingle();

const safeMode =
    settings?.safe_mode ?? false;

confessionStatus =
    safeMode
        ? 'pending'
        : 'approved';

    const { error } = await supabase
        .from('confessions')
       .insert({
    message: message,
    image_url: imageUrl,
    profile_id: null,
    receiver_profile_id:
        window.receiverProfileId ?? null,
    is_anonymous: true,
    source: 'event',
    status: confessionStatus,
});

    if (error) {

        console.error(error);

        document.getElementById('status').innerHTML =
            '<div class="error">Error al enviar la confesión.</div>';

        return;
    }

    lastSubmission = now;

    document.getElementById('message').value = '';

    document.getElementById('image').value = '';

    document.getElementById('status').innerHTML =
        '<div class="success">✅ Confesión enviada correctamente.</div>';
};