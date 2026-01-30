
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
    },
    {
        title: "Mélyég-objektumok Típusai",
        content: `
            <p>A Naprendszeren túli objektumokat mélyég-objektumoknak (Deep Sky Objects, DSO) nevezzük. Főbb kategóriáik:</p>
            <ul>
                <li><strong>Csillaghalmazok:</strong> Csillagok gravitációsan kötött csoportjai.
                    <ul>
                        <li><em>Nyílthalmazok:</em> Néhány tucat vagy pár ezer, általában fiatal, forró csillag laza csoportja (pl. Fiastyúk - M45). A Tejút síkjában találhatóak.</li>
                        <li><em>Gömbhalmazok:</em> Több tízezer vagy akár milliónyi, idős csillag sűrű, gömb alakú csoportosulása (pl. Herkules-gömbhalmaz - M13). A galaxisunk magja körül keringenek a halóban.</li>
                    </ul>
                </li>
                <li><strong>Ködök (Nebulák):</strong> Csillagközi porból és gázból álló felhők.
                    <ul>
                        <li><em>Emissziós ködök:</em> A bennük vagy a közelükben lévő forró csillagok ionizálják a gázt, ami ezután saját fényt bocsát ki (pl. Orion-köd - M42). Gyakran vöröses színűek a hidrogén-alfa vonal miatt.</li>
                        <li><em>Reflexiós ködök:</em> A közeli csillagok fényét verik vissza. Általában kék színűek, mert a por a kék fényt hatékonyabban szórja (pl. a Fiastyúk körüli ködösség).</li>
                        <li><em>Sötét ködök:</em> Sűrű por- és gázfelhők, amelyek elnyelik a mögöttük lévő csillagok vagy ködök fényét (pl. Lófej-köd).</li>
                        <li><em>Planetáris ködök:</em> Egy haldokló, Naphoz hasonló csillag által ledobott gázburok, amit a csillag forró magja gerjeszt fénylésre (pl. Gyűrűs-köd - M57). Nincs közük a bolygókhoz, csak alakjuk miatt kapták ezt a nevet.</li>
                    </ul>
                </li>
                <li><strong>Galaxisok:</strong> Csillagok, gáz, por és sötét anyag hatalmas, gravitációsan kötött rendszerei.
                    <ul>
                        <li><em>Spirálgalaxisok:</em> Központi magból és abból kiinduló spirálkarokból állnak (pl. Androméda-galaxis - M31).</li>
                        <li><em>Elliptikus galaxisok:</em> Sima, jellegtelen, ovális alakúak, főleg idős csillagokból állnak.</li>
                        <li><em>Irreguláris galaxisok:</em> Szabálytalan alakúak, gyakran galaxisok ütközése vagy kölcsönhatása során jönnek létre.</li>
                    </ul>
                </li>
            </ul>
        `
    },
    {
        title: "Vizuális Éslelési Technikák",
        content: `
            <p>A halvány mélyég-objektumok megpillantása gyakran nem egyszerű. Az alábbi technikák segíthetnek többet kihozni az éjszakából:</p>
            <ul>
                <li><strong>Distz-látás (Averted Vision):</strong> A szemünk perifériája érzékenyebb a gyenge fényre, mint a közepe. Ha nem közvetlenül az objektumra nézel, hanem egy kicsit mellé, a perifériás látásoddal gyakran megpillanthatod a halvány részleteket, amik direkt ránézésre láthatatlanok. Kísérletezz, hogy milyen irányba és távolságra kell elnézned!</li>
                <li><strong>Távcső mozgatása:</strong> Finoman lökdösd meg a távcsövet! A szemünk sokkal érzékenyebb a mozgásra. Egy halvány, alig látható ködösség vagy galaxis jobban "kiugrik" a háttérből, ha a látómező enyhén mozog.</li>
                <li><strong>Fáradt szem pihentetése:</strong> Ha sokáig erőlteted a szemed egy halvány objektumra, elfárad. Tarts szünetet, csukd be a szemed pár másodpercre, vagy nézz egy közeli fényesebb csillagra, majd próbálkozz újra.</li>
                <li><strong>Megfelelő nagyítás:</strong> A túl nagy nagyítás "szétkeni" a halvány objektumok fényét, amitől láthatatlanná válhatnak. Kezdd kis nagyítással (nagy kilépő pupilla) az objektum megkereséséhez, majd próbálj közepes nagyítást a részletekhez.</li>
            </ul>
        `
    },
    {
        title: "Asztrofotózás Alapjai",
        content: `
            <p>Az asztrofotózás célja, hogy a szemünk számára láthatatlan vagy alig látható égi csodákat a kamera érzékelőjén hosszú expozíciós idővel megörökítsük.</p>
            <h4>Kulcs a Hosszú Expozíció</h4>
            <p>A kamera másodpercekig, vagy akár percekig gyűjti a fényt egyetlen képpontra. Ehhez elengedhetetlen a stabil, követő mechanika, ami kiküszöböli a Föld forgását.</p>
            <h4>Képfeldolgozás: A Stackelés</h4>
            <p>A professzionális asztrofotók ritkán egyetlen expozícióból állnak. Ehelyett sok (több tucat vagy akár száz) rövidebb expozíciót, ún. "light frame"-et készítenek, amiket egy szoftver (pl. DeepSkyStacker, Siril) segítségével "egymásra raknak" (stackelnek). A folyamat matematikailag átlagolja a képeket, ami drámaian csökkenti a zajt és felerősíti a halvány részleteket.</p>
            <h4>Kalibrációs Képek</h4>
            <p>A legjobb eredmény eléréséhez a light frame-ek mellett kalibrációs képekre is szükség van:</p>
            <ul>
                <li><strong>Dark Frame-ek:</strong> A távcső objektívsapkájával letakarva, a light frame-ekkel azonos expozíciós idővel és ISO-val készült képek. Ezek csak a szenzor hőmérsékletéből adódó zajt tartalmazzák, amit a szoftver kivonhat a nyers képekből.</li>
                <li><strong>Flat Frame-ek:</strong> Egyenletesen megvilágított felületről (pl. fehér póló a távcső végén, vagy a szürkületi ég) készült, rövid expozíciós képek. A porszemcsék és az optika vignettálásának (sötétedés a sarkoknál) hibáit rögzítik, amiket a szoftver korrigálhat.</li>
                <li><strong>Bias Frame-ek:</strong> A lehető legrövidebb záridővel, letakart távcsővel készült képek. A szenzor kiolvasási zaját rögzítik.</li>
            </ul>
            <p>Ezeknek a kalibrációs képeknek a használatával sokkal tisztább, zajmentesebb és korrigáltabb végeredményt kapunk, ami az utómunka (stretching, szaturáció) során sokkal jobban feldolgozható.</p>
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