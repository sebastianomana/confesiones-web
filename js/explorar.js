import { supabase } from './supabase.js';

function createCard(confession){


return `
    <div class="confession-card">

        <div class="confession-text">
            ${confession.message}
        </div>

        ${
            confession.image_url
            ? `
            <img
                src="${confession.image_url}"
                class="confession-image"
            >
            `
            : ''
        }

        <div class="confession-meta">
            <span>❤️ ${confession.likes || 0}</span>
            <span>💬 ${confession.comments_count || 0}</span>
        </div>

    </div>
`;


}

async function loadExplore(){


const { data, error } = await supabase
    .from('confession_feed')
    .select('*')
    .eq('status','approved')
    .order('created_at',{
        ascending:false
    });

if(error){
    console.error(error);
    return;
}

const recentFeed =
    document.getElementById('recentFeed');

const popularFeed =
    document.getElementById('popularFeed');

const recent =
    [...data]
    .sort((a,b)=>
        new Date(b.created_at)
        - new Date(a.created_at)
    )
    .slice(0,20);

const popular =
    [...data]
    .sort((a,b)=>
        ((b.likes||0)+(b.comments_count||0))
        -
        ((a.likes||0)+(a.comments_count||0))
    )
    .slice(0,20);

recentFeed.innerHTML =
    recent.map(createCard).join('');

popularFeed.innerHTML =
    popular.map(createCard).join('');

document.getElementById(
    'totalConfessions'
).textContent = data.length;

document.getElementById(
    'totalLikes'
).textContent =
    data.reduce(
        (a,b)=>a+(b.likes||0),
        0
    );

document.getElementById(
    'totalComments'
).textContent =
    data.reduce(
        (a,b)=>a+(b.comments_count||0),
        0
    );


}

loadExplore();
