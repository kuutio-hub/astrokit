
// A Naprendszer bolygói magyar nevekkel, leírásokkal és egyszerűsített keringési adatokkal.
// Az orbit adatok közelítő számításokhoz használatosak.
// M: Mean anomaly at J2000, a_days: semi-major axis (orbital period in days), e: eccentricity, i: inclination, W: longitude of ascending node, w: argument of perihelion
export const planets = [
    {
        id: 'P1',
        name: 'Merkúr',
        type: 'Bolygó',
        const: 'Változó',
        description: 'A Naprendszer legbelső és legkisebb bolygója. Sziklás felszínét kráterek borítják, és nincs állandó légköre. Nappal rendkívül forró, éjjel pedig fagyos. Mindig a Nap közelében látható az égen, ezért megfigyelése kihívást jelent.',
        orbit: { M: 174.79, a_days: 87.97, e: 0.2056, i: 7.00, W: 48.33, w: 77.46 }
    },
    {
        id: 'P2',
        name: 'Vénusz',
        type: 'Bolygó',
        const: 'Változó',
        description: 'A második bolygó a Naptól, a Föld „testvérbolygójának” is nevezik mérete és tömege miatt. Sűrű, mérgező légköre extrém üvegházhatást okoz, felszíne a legforróbb a Naprendszerben. A Hold után a legfényesebb objektum az éjszakai égbolton, Esthajnalcsillagként ismert.',
        orbit: { M: 50.41, a_days: 224.70, e: 0.0068, i: 3.39, W: 76.68, w: 131.53 }
    },
    {
        id: 'P3',
        name: 'Mars',
        type: 'Bolygó',
        const: 'Változó',
        description: 'A „vörös bolygó”, nevét a felszínét borító vas-oxidtól kapta. Vékony légköre és sarki jégsapkái vannak. Felszínén egykor folyékony víz lehetett. Két kis holdja van, a Phobos és a Deimos. Távcsővel megfigyelhetők felszíni alakzatai és jégsapkái.',
        orbit: { M: 19.41, a_days: 686.98, e: 0.0934, i: 1.85, W: 49.56, w: 336.04 }
    },
    {
        id: 'P4',
        name: 'Jupiter',
        type: 'Bolygó',
        const: 'Változó',
        description: 'A Naprendszer legnagyobb bolygója, egy gázóriás. Jellegzetessége a Nagy Vörös Folt, egy hatalmas, évszázadok óta tomboló vihar. Számos holdja van, melyek közül a négy legnagyobbat (Io, Europa, Ganymedes, Callisto) már egy kisebb távcsővel is látni lehet.',
        orbit: { M: 19.89, a_days: 4332.59, e: 0.0485, i: 1.30, W: 100.46, w: 14.75 }
    },
    {
        id: 'P5',
        name: 'Szaturnusz',
        type: 'Bolygó',
        const: 'Változó',
        description: 'A második legnagyobb bolygó, amely a látványos gyűrűrendszeréről híres. A gyűrűk jég- és kőzetdarabokból állnak. A Jupiterhez hasonlóan gázóriás, számos holddal. Távcsővel a gyűrűk és a legnagyobb hold, a Titán is megfigyelhető.',
        orbit: { M: 317.02, a_days: 10759.22, e: 0.0555, i: 2.49, W: 113.66, w: 92.43 }
    },
    {
        id: 'P6',
        name: 'Uránusz',
        type: 'Bolygó',
        const: 'Változó',
        description: 'Jégóriás, amelynek különlegessége, hogy forgástengelye extrém mértékben, közel 98 fokkal meg van dőlve, így szinte „oldalán gurulva” kering a Nap körül. Halvány gyűrűrendszere és több holdja van. Megfigyeléséhez legalább közepes méretű távcső szükséges.',
        orbit: { M: 142.24, a_days: 30688.5, e: 0.0463, i: 0.77, W: 74.00, w: 170.96 }
    },
    {
        id: 'P7',
        name: 'Neptunusz',
        type: 'Bolygó',
        const: 'Változó',
        description: 'A Naptól legtávolabbi bolygó, szintén jégóriás. Kék színét a légkörében lévő metán okozza. A Naprendszer legerősebb szelei fújnak rajta. Megfigyelése komoly kihívás, nagy távcsövet igényel.',
        orbit: { M: 260.25, a_days: 60182, e: 0.0090, i: 1.77, W: 131.78, w: 44.97 }
    }
];
