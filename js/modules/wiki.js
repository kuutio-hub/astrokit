
const wikiContent = [
    {
        title: "Távcsőtípusok",
        content: `
            <p>A csillagászati távcsöveknek két fő típusa van: a <strong>lencsés (refraktor)</strong> és a <strong>tükrös (reflektor)</strong>. Mindkettőnek az a feladata, hogy a távoli objektumokról érkező fénysugarakat összegyűjtse és egy pontba, a fókuszba vetítse. A legfontosabb jellemzőjük az objektív (lencse vagy tükör) átmérője, mert ez határozza meg a fénygyűjtő képességet és a felbontást.</p>
            <ul>
                <li><strong>Lencsés távcsövek (refraktorok):</strong> Egy vagy több lencséből álló objektívvel gyűjtik össze a fényt.
                    <ul>
                        <li><em>Akromatikus:</em> Két lencsetagból álló objektív, ami a színi hibát (a különböző színű fények nem egy pontba fókuszálódását) részben korrigálja. Nagyobb fényerőnél (f/8 alatt) és nagyobb nagyításnál a fényes objektumok körül lilás elszíneződés (kromatikus aberráció) látható.</li>
                        <li><em>Apokromatikus (APO):</em> Három vagy több lencsetagból, speciális üveganyagokból (pl. fluorithordozós) készült objektív, ami a színi hibát szinte teljesen kiküszöböli. Kontrasztos, tűéles képet ad, ezért bolygómegfigyelésre és asztrofotózásra a legkiválóbbak. Előállításuk rendkívül drága.</li>
                    </ul>
                    Előnyük a kontrasztos kép és a zárt tubus miatti karbantartás-mentesség. Hátrányuk a magas ár/átmérő arány.
                </li>
                <li><strong>Tükrös távcsövek (reflektorok):</strong> Homorú tükörrel gyűjtik a fényt.
                    <ul>
                        <li><em>Newton-távcső:</em> A legelterjedtebb típus. A főtükör által összegyűjtött fényt egy 45 fokban álló segédtükör vetíti ki a tubus oldalán lévő okulárkihuzatba. Előnye, hogy nagy átmérő is gazdaságosan előállítható és mentes a színi hibától. Hátránya a nyitott tubus és a segédtükör okozta kontrasztcsökkenés (obstrukció). Rendszeres beállítást (kollimációt) igényel.</li>
                    </ul>
                </li>
                <li><strong>Katadioptrikus rendszerek (Lencsés-tükrös):</strong> Lencséket és tükröket is használnak. Céljuk a kompakt méret elérése nagy fókusztávolság mellett.
                     <ul>
                        <li><em>Schmidt-Cassegrain (SCT):</em> A gömb alakú főtükör hibáját egy a tubus elején elhelyezett, bonyolult alakú korrekciós lemez javítja. Nagyon kompakt, univerzális távcsövek.</li>
                        <li><em>Makszutov-Cassegrain (MC):</em> A korrekciót egy vastag, domború-homorú meniszkusz lencse végzi. Kiemelkedően éles képet adnak, főleg bolygózásra kiválóak.</li>
                    </ul>
                </li>
            </ul>
        `
    },
    {
        title: "Mechanikák és Állványok",
        content: `
            <p>A mechanika feladata a távcső stabil tartása és precíz mozgatása. A stabilitás kulcsfontosságú a nagy nagyításon remegésmentes képhez. Két fő fajtája van:</p>
            <ul>
                <li><strong>Azimutális mechanika:</strong> Két tengely mentén mozog: vízszintesen (azimut) és függőlegesen (magasság). Egyszerű használni, vizuális észleléshez ideális.
                    <ul>
                        <li><em>Dobson-mechanika:</em> Egy egyszerű, olcsó, de stabil azimutális állványtípus, ami jellemzően nagy Newton-távcsövekhez használatos.</li>
                        <li><em>GoTo azimutális:</em> Számítógép-vezérlésű mechanika, ami automatikusan megkeresi és követi az égitesteket. A követéshez mindkét motornak működnie kell, ami hosszú expozíciós fotózásnál képmező-elfordulást okoz.</li>
                    </ul>
                </li>
                <li><strong>Ekvatoriális (parallaktikus) mechanika:</strong> Egyik tengelye (az óratengely) a Föld forgástengelyével párhuzamosan, az Északi Sarkcsillag felé van állítva.
                     <ul>
                        <li><em>Német ekvatoriális:</em> A legelterjedtebb típus, ahol a távcső az egyik oldalon, az ellensúly a másikon van. Precíz beállítást (pólusra állást) igényel.</li>
                     </ul>
                    Előnye, hogy a csillagok napi mozgását elég csak az óratengely mentén, egyenletes sebességgel követni. Ez teszi ideálissá asztrofotózáshoz.
                </li>
            </ul>
        `
    },
     {
        title: "Égi Koordináta-rendszerek",
        content: `
            <p>Az égitestek helyének meghatározására különböző koordináta-rendszereket használunk.</p>
            <ul>
                <li><strong>Horizontális (Azimutális) Rendszer:</strong> Ez a helyi, megfigyelő-központú rendszer. A koordinátái:
                    <ul>
                        <li><em>Magasság (altitúdó):</em> Az objektum szögtávolsága a horizonttól, 0° (horizont) és 90° (zenit) között.</li>
                        <li><em>Azimut:</em> Az égitest helye a horizont mentén, általában a déli ponttól mérve nyugat felé (0°-360°).</li>
                    </ul>
                    Ezek az értékek folyamatosan változnak a Föld forgása miatt, és függnek a megfigyelő helyétől. A távcsövek azimutális mechanikái ebben a rendszerben mozognak.
                </li>
                <li><strong>Ekvatoriális Rendszer:</strong> Ez egy éggömbhöz kötött rendszer, ami független a megfigyelő helyétől és az időtől (a precessziótól eltekintve). Koordinátái a földi szélesség és hosszúság égi megfelelői:
                    <ul>
                        <li><em>Rektaszcenzió (RA):</em> Az égi hosszúság, a tavaszponttól mérve kelet felé. Órában, percben és másodpercben mérik (0h - 24h).</li>
                        <li><em>Deklináció (Dec):</em> Az égi szélesség, az égi egyenlítőtől mérve fokokban (+90° az Északi Égi Pólus, -90° a Déli).</li>
                    </ul>
                    Mivel a csillagok RA/Dec koordinátái (közel) állandóak, a csillagtérképek és a GoTo rendszerek ezt használják. Az ekvatoriális mechanikák ebben a rendszerben követik az eget.
                </li>
            </ul>
        `
    },
    {
        title: "Az Első Éjszaka - Útmutató Kezdőknek",
        content: `
            <p>Megvan az első távcsöved? Gratulálunk! Íme néhány tipp, hogy az első észlelés élmény legyen:</p>
            <ol>
                <li><strong>Ismerkedj a felszereléssel nappal:</strong> Tanuld meg összeszerelni a távcsövet és a mechanikát világosban. Próbáld ki a fókuszírozót, cserélj okulárt, és állítsd be a keresőtávcsövet egy távoli földi célponton (pl. villanyoszlop).</li>
                <li><strong>Válassz megfelelő helyszínt:</strong> Keress egy helyet, ahol a lehető legkevesebb a zavaró fény (utcai lámpák), és viszonylag jó a kilátás az égre. A kert, egy közeli rét vagy egy fényszennyezéstől távoli hely is tökéletes.</li>
                <li><strong>Öltözz melegen:</strong> Éjszaka, még nyáron is, gyorsan le lehet hűlni. Réteges öltözködés, sapka, meleg cipő elengedhetetlen.</li>
                <li><strong>Adaptálódj a sötéthez:</strong> A szemednek kb. 20-30 percre van szüksége, hogy teljesen alkalmazkodjon a sötéthez. Ezalatt kerüld az erős fényeket, ne nézz a telefonod képernyőjére. Használj vörös fényű lámpát, mert az kevésbé zavarja a sötétadaptációt.</li>
                <li><strong>Kezdd egyszerű célpontokkal:</strong>
                    <ul>
                        <li><strong>A Hold:</strong> Mindig a leglátványosabb első célpont. A kráterek és tengerek látványa a fázis változásával folyamatosan új részleteket tár fel. Teliholdkor túl fényes, a terminátor (fény-árnyék határvonal) mentén a legkontrasztosabb.</li>
                        <li><strong>Fényes bolygók:</strong> A Jupiter a felhősávjaival és a négy Galilei-holdjával, valamint a Szaturnusz a gyűrűjével mindig lenyűgöző látvány.</li>
                        <li><strong>Fényes csillaghalmazok:</strong> A Fiastyúk (M45) vagy a Herkules-gömbhalmaz (M13) már kisebb távcsővel is gyönyörű.</li>
                    </ul>
                </li>
                <li><strong>Legyél türelmes:</strong> Ne add fel, ha nem találsz meg valamit azonnal. A keresés és a felfedezés az élmény része. Használj csillagtérképet (akár telefonos applikációt vörös képernyő módban) a tájékozódáshoz.</li>
            </ol>
        `
    }
];

export function initWiki() {
    const container = document.getElementById('wiki-container');
    if (!container) return;

    container.innerHTML = wikiContent.map(item => `
        <div class="accordion">
            <button class="accordion-header">
                <h3><i class="ph-star"></i> ${item.title}</h3>
                <i class="ph ph-caret-down accordion-icon"></i>
            </button>
            <div class="accordion-content">
                ${item.content}
            </div>
        </div>
    `).join('');

    container.addEventListener('click', (e) => {
        const header = e.target.closest('.accordion-header');
        if (!header) return;

        const content = header.nextElementSibling;
        const isActive = header.classList.contains('active');
        
        header.classList.toggle('active', !isActive);
        content.classList.toggle('active', !isActive);
        
        if (!isActive) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.padding = '1.5rem';
        } else {
            content.style.maxHeight = null;
            content.style.padding = '0 1.5rem';
        }
    });
}