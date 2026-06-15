import './confession-form.js';
import { loadFeed } from './feed.js';
import { supabase } from './supabase.js';

async function initProfile() {

    const params = new URLSearchParams(
        window.location.search
    );

    const username = params.get('u');

    if (!username) {

        document.querySelector('.container').innerHTML = `
            <h1 style="
                text-align:center;
                color:#8f74d8;
            ">
                💜 Confiesa
            </h1>

            <p style="
                text-align:center;
            ">
                Debes acceder mediante el enlace de un usuario.
            </p>

            <p style="
                text-align:center;
                color:#777;
            ">
                Ejemplo:
                confiesa.app/?u=usuario
            </p>
        `;

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