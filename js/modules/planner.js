
import { messierObjects } from '../data/objects.js';

let lat, lon;
let updateInterval;
let objectsWithPositions = [];

const $ = (id) => document.getElementById(id);

export function initPlanner(_lat, _lon) {
    lat = _lat;
    lon = _lon;

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
}

function populateFilters() {
    const types = [...new Set(messierObjects.map(o => o.type))].sort();
    const constellations = [...new Set(messierObjects.map(o => o.const))].sort();

    const typeFilter = $('planner-type-filter');
    types.forEach(type => {
        typeFilter.add(new Option(type, type));
    });

    const constFilter = $('planner-const-filter');
    constellations.forEach(c => {
        constFilter.add(new Option(c, c));
    });
}

function calculatePositions() {
    const now = new Date();
    const lst = calculateSiderealTime(now, lon);
    
    objectsWithPositions = messierObjects.map(obj => {
        const { alt, az } = getAltAz(obj.ra, obj.dec, lat, lon, lst);
        return { ...obj, alt, az };
    });
}

function filterAndRender() {
    const searchTerm = $('planner-search').value.toLowerCase();
    const typeFilter = $('planner-type-filter').value;
    const constFilter = $('planner-const-filter').value;
    const visibleOnly = $('planner-visible-only').checked;

    const filtered = objectsWithPositions.filter(obj => {
        const nameMatch = obj.name.toLowerCase().includes(searchTerm) || obj.id.toLowerCase().includes(searchTerm);
        const typeMatch = typeFilter === 'all' || obj.type === typeFilter;
        const constMatch = constFilter === 'all' || obj.const === constFilter;
        const visibleMatch = !visibleOnly || obj.alt > 0;
        return nameMatch && typeMatch && constMatch && visibleMatch;
    });
    
    renderTable(filtered);
}

function renderTable(objects) {
    const tbody = $('planner-table-body');
    if (!tbody) return;

    if (objects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nincsenek a szűrőnek megfelelő objektumok.</td></tr>';
        return;
    }

    tbody.innerHTML = objects
        .sort((a, b) => b.alt - a.alt) // Sort by highest altitude
        .map(obj => {
            const alt = obj.alt.toFixed(1);
            let visibilityClass = 'visibility-bad';
            let visibilityText = 'Horizont alatt';
            if (alt > 25) {
                visibilityClass = 'visibility-good';
                visibilityText = 'Kiválóan látható';
            } else if (alt > 5) {
                visibilityClass = 'visibility-ok';
                visibilityText = 'Alacsonyan';
            }

            return `
                <tr>
                    <td>${obj.id} (${obj.name || 'N/A'})</td>
                    <td>${obj.type}</td>
                    <td>${obj.const}</td>
                    <td>${alt}°</td>
                    <td><span class="visibility-indicator ${visibilityClass}"></span>${visibilityText}</td>
                </tr>
            `;
        }).join('');
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
    const ra = raArr[0] + raArr[1] / 60 + raArr[2] / 3600;
    const dec = decArr[0] + decArr[1] / 60 + decArr[2] / 3600;
    
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
