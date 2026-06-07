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

    const { data: confessions, error } = await supabase
        .from('confessions')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error(error);
        return;
    }

    feed.innerHTML = '';

    confessions.forEach(confession => {

        feed.innerHTML += `
            <div style="
                background:white;
                padding:15px;
                margin-top:15px;
                border-radius:12px;
                box-shadow:0 2px 8px rgba(0,0,0,.08);
            ">
                ${confession.message}
            </div>
        `;
    });
}