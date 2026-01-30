
const wikiContent = [
    {
        title: "Távcsőtípusok",
        content: `
            <p>A csillagászati távcsöveknek két fő típusa van: a <strong>lencsés (refraktor)</strong> és a <strong>tükrös (reflektor)</strong>. Mindkettőnek az a feladata, hogy a távoli objektumokról érkező fénysugarakat összegyűjtse és egy pontba, a fókuszba vetítse.</p>
            <ul>
                <li><strong>Lencsés távcsövek (refraktorok):</strong> Egy vagy több lencséből álló objektívvel gyűjtik össze a fényt. Előnyük a kontrasztos, éles kép és a zárt tubus miatti karbantartás-mentesség. Hátrányuk a színi hiba (kromatikus aberráció) és a drágább előállítás, különösen nagy átmérő esetén.</li>
                <li><strong>Tükrös távcsövek (reflektorok):</strong> Homorú tükörrel gyűjtik a fényt. Legelterjedtebb típusa a Newton-távcső. Előnyük, hogy nagy átmérő is gazdaságosan előállítható belőlük és mentesek a színi hibától. Hátrányuk a nyitott tubus miatti gyakoribb karbantartási igény (kollimáció, tisztítás) és a segédtükör okozta kismértékű kontrasztcsökkenés (obstrukció).</li>
                <li><strong>Katadioptrikus rendszerek:</strong> Lencséket és tükröket is használnak. Céljuk a kompakt méret elérése nagy fókusztávolság mellett. Ilyenek például a Schmidt-Cassegrain és a Makszutov-Cassegrain távcsövek.</li>
            </ul>
        `
    },
    {
        title: "Mechanikák és Állványok",
        content: `
            <p>A mechanika feladata a távcső stabil tartása és precíz mozgatása. A stabilitás kulcsfontosságú a nagy nagyításon remegésmentes képhez. Két fő fajtája van:</p>
            <ul>
                <li><strong>Azimutális mechanika:</strong> Két tengely mentén mozog: vízszintesen (azimut) és függőlegesen (magasság). Egyszerű használni, vizuális észleléshez ideális. Földi objektumok megfigyelésére is alkalmas. Hátránya, hogy a csillagok égi mozgásának követéséhez mindkét tengelyt egyszerre kell mozgatni, ami hosszú expozíciós idejű fotózásnál képmező-elfordulást okoz. A Dobson-távcsövek egy egyszerűsített azimutális mechanikát használnak.</li>
                <li><strong>Ekvatoriális (parallaktikus) mechanika:</strong> Egyik tengelye (az óratengely) a Föld forgástengelyével párhuzamosan, az Északi Sarkcsillag felé van állítva. A másik a deklinációs tengely. Előnye, hogy a csillagok napi mozgását elég csak az óratengely mentén, egyenletes sebességgel követni, ami motorizálható. Ez teszi ideálissá asztrofotózáshoz. Hátránya a nehezebb beállítás (pólusra állás) és a kényelmetlenebb betekintési pozíció bizonyos esetekben.</li>
            </ul>
        `
    },
    {
        title: "Okulárok és Kiegészítők",
        content: `
            <p>Az okulár a távcső "szemlencséje", ezen keresztül nézzük a távcső által alkotott képet. Fő jellemzői:</p>
            <ul>
                <li><strong>Fókusztávolság:</strong> Milliméterben adják meg. A távcső nagyítását a távcső és az okulár fókusztávolságának hányadosa adja (N = T_fókusz / O_fókusz). Rövidebb fókuszú okulárral nagyobb nagyítást érünk el.</li>
                <li><strong>Látómező:</strong> Fokban mérik. Ez az a látószög, amit az okulárba nézve látunk. A nagyobb látómező kényelmesebb, "űrsétaszerű" élményt nyújt. 50-60° az átlagos, 82° vagy a feletti az ultraszéles látószögű.</li>
                <li><strong>Kihuzat mérete:</strong> A leggyakoribb a 1.25" (31.7 mm) és a 2" (50.8 mm). A 2"-es okulárok általában nagyobb látómezőt tesznek lehetővé.</li>
            </ul>
            <p><strong>Fontos kiegészítők:</strong> Barlow-lencse (megsokszorozza a nagyítást), szűrők (hold-, köd-, színszűrők), keresőtávcső (segít beállítani a célpontot).</p>
        `
    }
];

export function initWiki() {
    const container = document.getElementById('wiki-container');
    if (!container) return;

    container.innerHTML = wikiContent.map(item => `
        <div class="accordion">
            <button class="accordion-header">
                <h3>${item.title}</h3>
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
