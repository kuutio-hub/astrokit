
import { messierObjects } from '../data/objects.js';
import { planets } from '../data/planets.js';
import { constellationNames } from '../data/constellations.js';

let lat, lon;
let updateInterval;
let allObjects = [];

const $ = (id) => document.getElementById(id);

export function initPlanner(_lat, _lon) {
    lat = _lat;
    lon = _lon;

    allObjects = [...messierObjects, ...planets];

    populateFilters();
    setupEventListeners();
    
    calculatePositions();
    filterAndRender();

    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => {
        calculatePositions();
        filterAndRender();
    }, 60000); // Update every minute
}

function setupEventListeners() {
    $('planner-search').addEventListener('input', filterAndRender);
    $('planner-type-filter').addEventListener('change', filterAndRender);
    $('planner-const-filter').addEventListener('change', filterAndRender);
    $('planner-visible-only').addEventListener('change', filterAndRender);

    $('planner-table-body').addEventListener('click', e => {
        const button = e.target.closest('.details-button');
        if (button) {
            const objectId = button.dataset.id;
            const object = allObjects.find(o => o.id === objectId);
            if (object) {
                showObjectDetails(object);
            }
        }
    });
}

function populateFilters() {
    const types = [...new Set(allObjects.map(o => o.type))].sort();
    const constellations = [...new Set(allObjects.map(o => o.const))].sort();

    const typeFilter = $('planner-type-filter');
    typeFilter.innerHTML = '<option value="all">Minden típus</option>';
    types.forEach(type => {
        typeFilter.add(new Option(type, type));
    });

    const constFilter = $('planner-const-filter');
    constFilter.innerHTML = '<option value="all">Minden csillagkép</option>';
    constellations.forEach(c => {
        constFilter.add(new Option(constellationNames[c] || c, c));
    });
}

function getPlanetPosition(planet, date) {
    // Nagyon egyszerűsített, közelítő számítás a bolygók helyzetére.
    // Professzionális alkalmazáshoz bonyolultabb csillagászati modellek (pl. VSOP87) kellenének.
    // Ez a közelítés a legtöbb vizuális észleléshez elegendő pontosságot ad.
    const jd = (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
    const d = jd - 2451545.0;

    const sunEclipticLng = (280.460 + 0.9856474 * d) % 360;
    
    const { M, a, e, i, W, w, L } = planet.orbit;
    
    const meanAnomaly = (M + (360 / a) * (d / 365.25)) % 360;
    
    // Egyszerűsített L (Longitúdó) a Nap körüli pozícióhoz
    const eclipticLng = (L + 0.9856 * d) % 360;

    // Nagyon durva közelítés, ami nem veszi figyelembe a bolygók relatív pozícióját.
    // A valóságban a Föld és a bolygó helyzetéből kellene számolni.
    // Itt most az egyszerűség kedvéért a Nap-centrikus pozíciót használjuk egy eltolással.
    let ra = (sunEclipticLng + 180 + (eclipticLng - sunEclipticLng)) % 360;
    
    // Konvertálás órára
    ra = ra / 15;

    // Deklinációt itt nem számolunk, közelítőleg 0-nak vesszük az ekliptikán
    const dec = 0;

    return { ra: [ra, 0, 0], dec: [dec, 0, 0] };
}


function calculatePositions() {
    const now = new Date();
    const lst = calculateSiderealTime(now, lon);
    
    allObjects.forEach(obj => {
        let raDec = { ra: obj.ra, dec: obj.dec };
        if (obj.type === 'Bolygó') {
            // A bolygók pozíciója folyamatosan változik, ezért minden alkalommal újra kell számolni.
            raDec = getPlanetPosition(obj, now);
        }
        const { alt, az } = getAltAz(raDec.ra, raDec.dec, lat, lon, lst);
        obj.alt = alt;
        obj.az = az;
    });
}


function filterAndRender() {
    const searchTerm = $('planner-search').value.toLowerCase();
    const typeFilter = $('planner-type-filter').value;
    const constFilter = $('planner-const-filter').value;
    const visibleOnly = $('planner-visible-only').checked;

    const filtered = allObjects.filter(obj => {
        const nameMatch = obj.name.toLowerCase().includes(searchTerm) || obj.id.toLowerCase().includes(searchTerm);
        const typeMatch = typeFilter === 'all' || obj.type === typeFilter;
        const constMatch = constFilter === 'all' || obj.const === constFilter;
        const visibleMatch = !visibleOnly || obj.alt > 1; // 1 fokos határ
        return nameMatch && typeMatch && constMatch && visibleMatch;
    });
    
    renderTable(filtered);
}

function renderTable(objects) {
    const tbody = $('planner-table-body');
    if (!tbody) return;

    if (objects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nincsenek a szűrőnek megfelelő objektumok.</td></tr>';
        return;
    }

    tbody.innerHTML = objects
        .sort((a, b) => b.alt - a.alt) // Sort by highest altitude
        .map(obj => {
            const alt = obj.alt.toFixed(1);
            let visibilityClass = 'visibility-bad';
            let visibilityText = 'Horizont alatt';
            if (alt > 30) {
                visibilityClass = 'visibility-good';
                visibilityText = 'Kiválóan látható';
            } else if (alt > 10) {
                visibilityClass = 'visibility-ok';
                visibilityText = 'Látható';
            } else if (alt > 1) {
                 visibilityClass = 'visibility-bad';
                 visibilityText = 'Nagyon alacsonyan';
            }

            return `
                <tr>
                    <td>${obj.id} (${obj.name || 'N/A'})</td>
                    <td>${obj.type}</td>
                    <td>${constellationNames[obj.const] || obj.const}</td>
                    <td>${alt}°</td>
                    <td><span class="visibility-indicator ${visibilityClass}"></span>${visibilityText}</td>
                    <td><button class="details-button" data-id="${obj.id}" title="Részletek"><i class="ph-info-fill"></i></button></td>
                </tr>
            `;
        }).join('');
}

function showObjectDetails(obj) {
    const modal = document.getElementById('app-modal');
    const modalBody = document.getElementById('modal-body');

    const raText = obj.ra ? `${obj.ra[0]}h ${obj.ra[1]}m ${obj.ra[2].toFixed(0)}s` : 'Változó';
    const decText = obj.dec ? `${obj.dec[0]}° ${obj.dec[1]}' ${obj.dec[2].toFixed(0)}"` : 'Változó';

    modalBody.innerHTML = `
        <h3>${obj.name} (${obj.id})</h3>
        <p>${obj.description || 'Nincs elérhető leírás.'}</p>
        <ul class="data-list">
            <li><span class="label">Típus</span> <span class="value">${obj.type}</span></li>
            <li><span class="label">Csillagkép</span> <span class="value">${constellationNames[obj.const] || obj.const}</span></li>
            <li><span class="label">Távolság</span> <span class="value">${obj.dist_ly ? `${obj.dist_ly} fényév` : 'N/A'}</span></li>
            <li><span class="label">Aktuális magasság</span> <span class="value">${obj.alt.toFixed(2)}°</span></li>
            <li><span class="label">Rektaszcenzió</span> <span class="value">${raText}</span></li>
            <li><span class="label">Deklináció</span> <span class="value">${decText}</span></li>
        </ul>
    `;
    modal.style.display = 'flex';
}

// --- Coordinate Transformation ---

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

function calculateSiderealTime(date, longitude) {
    const d = new Date(date);
    const jd = d.getTime() / 86400000 - (d.getTimezoneOffset() / 1440) + 2440587.5;
    const T = (jd - 2451545.0) / 36525;
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000;
    gmst = gmst % 360;
    if (gmst < 0) gmst += 360;
    const lmst = (gmst + longitude) % 360;
    return lmst / 15; // Return in hours
}

function getAltAz(raArr, decArr, lat, lon, lst) {
    if (!raArr || !decArr) return { alt: -90, az: 0 };
    const ra = raArr[0] + raArr[1] / 60 + raArr[2] / 3600;
    const decSign = decArr[0] < 0 ? -1 : 1;
    const dec = decArr[0] + (decSign * decArr[1]) / 60 + (decSign * decArr[2]) / 3600;
    
    const latRad = toRad(lat);
    const decRad = toRad(dec);
    
    const ha = (lst - ra) * 15;
    const haRad = toRad(ha);

    const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
    const alt = toDeg(Math.asin(sinAlt));

    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(toRad(alt)));
    let az = toDeg(Math.acos(cosAz));

    if (Math.sin(haRad) > 0) {
        az = 360 - az;
    }

    return { alt, az };
}