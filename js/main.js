import './confession-form.js';
import { loadFeed } from './feed.js';
import { supabase } from './supabase.js';

async function initProfile() {

    const params = new URLSearchParams(
        window.location.search
    );

    const username = params.get('u');

    if (!username) {

    document.getElementById('pageTitle').innerHTML =
        '💜 Usuario no especificado';

    document.getElementById('confessionForm')
        .style.display = 'none';

    return;
}

    const { data: profile, error } =
        await supabase
            .from('profiles')
            .select('id, username, display_name')
            .eq('username', username)
            .single();

    if (error || !profile) {

        document.getElementById('pageTitle').innerHTML =
            '❌ Usuario no encontrado';

        return;
    }

    window.receiverProfileId = profile.id;

    document.getElementById('pageTitle').innerHTML =
        `💜 Envíale una confesión a ${profile.display_name}`;
}

await initProfile();

loadFeed();