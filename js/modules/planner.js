
import { messierObjects } from '../data/objects.js';
import { planets } from '../data/planets.js';
import { constellationNames } from '../data/constellations.js';
import { zodiac } from '../data/zodiac.js';

let lat, lon;
let updateInterval;
let allObjects = [];

const $ = (id) => document.getElementById(id);
const toRad = (deg) => deg * Math.PI / 180;
const toDeg = (rad) => rad * 180 / Math.PI;

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

function getPlanetPosition(planet, date, sun) {
    // This is a simplified model for educational purposes. It calculates an approximate
    // geocentric position, which is good enough for finding the planet and its constellation.
    // It doesn't account for all perturbations.
    
    // Planet's heliocentric coordinates
    const M_p = toRad((planet.orbit.M + (360 / planet.orbit.a_days) * sun.d) % 360);
    const w_p = toRad(planet.orbit.w);
    const e_p = planet.orbit.e;
    let E_p = M_p + e_p * Math.sin(M_p) * (1.0 + e_p * Math.cos(M_p)); // Kepler's equation approx.
    const xv_p = Math.cos(E_p) - e_p;
    const yv_p = Math.sqrt(1.0 - e_p*e_p) * Math.sin(E_p);
    const v_p = Math.atan2(yv_p, xv_p); // True anomaly
    const r_p = Math.sqrt(xv_p*xv_p + yv_p*yv_p); // Distance from sun
    const l_p = v_p + w_p; // Heliocentric longitude

    // Geocentric coordinates
    const xg = r_p * Math.cos(l_p) - sun.r * Math.cos(sun.l);
    const yg = r_p * Math.sin(l_p) - sun.r * Math.sin(sun.l);

    let geocentric_lon = toDeg(Math.atan2(yg, xg));
    if(geocentric_lon < 0) geocentric_lon += 360;

    // Very simplified RA/Dec conversion (assumes 0 ecliptic latitude)
    const ecl = toRad(23.4397);
    const ra = Math.atan2(Math.sin(toRad(geocentric_lon)) * Math.cos(ecl), Math.cos(toRad(geocentric_lon)));
    const dec = Math.asin(Math.sin(ecl) * Math.sin(toRad(geocentric_lon)));
    
    return { 
        ra: [toDeg(ra) / 15, 0, 0], 
        dec: [toDeg(dec), 0, 0],
        ecliptic_lon: geocentric_lon
    };
}

function getConstellationFromLongitude(lon) {
    const constellation = zodiac.find(c => lon >= c.start && lon < c.end);
    return constellation ? constellation.name : 'Változó';
}

function calculatePositions() {
    const now = new Date();
    const lst = calculateSiderealTime(now, lon);
    
    // Sun position needed for planet calculations
    const jd = now.getTime() / 86400000 - (now.getTimezoneOffset() / 1440) + 2440587.5;
    const d = jd - 2451545.0;
    const M_sun = toRad((357.5291 + 0.98560028 * d) % 360);
    const e_sun = 0.0167086;
    let E_sun = M_sun + e_sun * Math.sin(M_sun) * (1.0 + e_sun * Math.cos(M_sun));
    const xv_sun = Math.cos(E_sun) - e_sun;
    const yv_sun = Math.sqrt(1.0 - e_sun*e_sun) * Math.sin(E_sun);
    const v_sun = Math.atan2(yv_sun, xv_sun); // True anomaly
    const r_sun = Math.sqrt(xv_sun*xv_sun + yv_sun*yv_sun); // Distance
    const l_sun = v_sun + toRad((282.9372) % 360); // Longitude of perihelion
    const sun_pos = {d, l: l_sun, r: r_sun};

    allObjects.forEach(obj => {
        let raDec = { ra: obj.ra, dec: obj.dec };
        if (obj.type === 'Bolygó') {
            const pos = getPlanetPosition(obj, now, sun_pos);
            raDec = { ra: pos.ra, dec: pos.dec };
            obj.const = getConstellationFromLongitude(pos.ecliptic_lon);
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
        const visibleMatch = !visibleOnly || obj.alt > 1; 
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

    const raText = obj.ra ? `${obj.ra[0].toFixed(0)}h ${Math.abs(obj.ra[1]).toFixed(0)}m ${Math.abs(obj.ra[2]).toFixed(0)}s` : 'Változó';
    const decText = obj.dec ? `${obj.dec[0].toFixed(0)}° ${Math.abs(obj.dec[1]).toFixed(0)}' ${Math.abs(obj.dec[2]).toFixed(0)}"` : 'Változó';

    modalBody.innerHTML = `
        <h3>${obj.name} (${obj.id})</h3>
        <p>${obj.description || 'Nincs elérhető leírás.'}</p>
        <ul class="data-list">
            <li><span class="label">Típus</span> <span class="value">${obj.type}</span></li>
            <li><span class="label">Csillagkép</span> <span class="value">${constellationNames[obj.const] || obj.const}</span></li>
            <li><span class="label">Távolság</span> <span class="value">${obj.dist_ly ? `${obj.dist_ly} fényév` : 'Változó'}</span></li>
            <li><span class="label">Aktuális magasság</span> <span class="value">${obj.alt.toFixed(2)}°</span></li>
            <li><span class="label">Rektaszcenzió</span> <span class="value">${raText}</span></li>
            <li><span class="label">Deklináció</span> <span class="value">${decText}</span></li>
        </ul>
    `;
    modal.style.display = 'flex';
}

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

    if (Math.sin(haRad) > 0) az = 360 - az;

    return { alt, az };
}