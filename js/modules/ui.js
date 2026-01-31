
import { maria } from '../data/maria.js';
import { moonTexture } from '../data/moon_texture.js';

let timeUpdateInterval = null;
const moonImage = new Image();
let moonImageLoaded = false;
moonImage.onload = () => { moonImageLoaded = true; };
moonImage.src = moonTexture;

function formatTime(date) {
    if (!date || isNaN(date)) return 'N/A';
    return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

function formatAngle(angle) {
    return `${(angle * 180 / Math.PI).toFixed(2)}°`;
}

function getHungarianMoonPhaseName(phase) {
    if (phase < 0.03 || phase > 0.97) return "Újhold";
    if (phase < 0.23) return "Növekvő sarló";
    if (phase < 0.27) return "Első negyed";
    if (phase < 0.48) return "Növekvő hold";
    if (phase < 0.52) return "Telihold";
    if (phase < 0.73) return "Fogyó hold";
    if (phase < 0.77) return "Utolsó negyed";
    return "Fogyó sarló";
}

function updateTimeDisplay() {
    const localTimeEl = document.getElementById('local-time');
    const utcTimeEl = document.getElementById('utc-time');
    if (!localTimeEl || !utcTimeEl) return;
    
    const now = new Date();
    localTimeEl.textContent = now.toLocaleTimeString('hu-HU');
    utcTimeEl.textContent = now.toLocaleTimeString('hu-HU', { timeZone: 'UTC', hour12: false }) + ' UTC';
}


export function displayDashboardData(sunData, moonData, nextPhases, lat, lon) {
    const container = document.getElementById('dashboard-container');
    const now = new Date();

    const moonIllumination = moonData.illumination;
    const moonPhaseName = getHungarianMoonPhaseName(moonIllumination.phase);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const sunToday = SunCalc.getTimes(today, lat, lon);
    const sunTomorrow = SunCalc.getTimes(tomorrow, lat, lon);
    const moonToday = SunCalc.getMoonTimes(today, lat, lon);
    const moonTomorrow = SunCalc.getMoonTimes(tomorrow, lat, lon);

    const allEvents = [
        { name: '<i class="ph-cloud-sun"></i> Polgári szürkület kezdete', time: sunToday.dawn, type: 'sun' },
        { name: '<i class="ph-sunrise"></i> Napkelte', time: sunToday.sunrise, type: 'sun' },
        { name: '<i class="ph-sun-horizon"></i> Napdelelés', time: sunToday.solarNoon, type: 'sun' },
        { name: '<i class="ph-sunset"></i> Napnyugta', time: sunToday.sunset, type: 'sun' },
        { name: '<i class="ph-cloud-moon"></i> Polgári szürkület vége', time: sunToday.dusk, type: 'sun' },
        { name: '<i class="ph-star"></i> Csillagászati sötétség kezdete', time: sunToday.night, type: 'dark' },
        { name: '<i class="ph-star-half"></i> Csillagászati sötétség vége', time: sunToday.nightEnd, type: 'dark' },
        { name: '<i class="ph-arrow-up"></i> Holdkelte', time: moonToday.rise, type: 'moon' },
        { name: '<i class="ph-arrow-down"></i> Holdnyugta', time: moonToday.set, type: 'moon' },
        { name: '<i class="ph-sunrise"></i> Napkelte (holnap)', time: sunTomorrow.sunrise, type: 'sun' },
        { name: '<i class="ph-star-half"></i> Csillagászati sötétség vége (holnap)', time: sunTomorrow.nightEnd, type: 'dark' },
        { name: '<i class="ph-arrow-up"></i> Holdkelte (holnap)', time: moonTomorrow.rise, type: 'moon' },
    ];
    
    const next24hLimit = new Date();
    next24hLimit.setHours(now.getHours() + 24);

    const upcomingEvents = allEvents
        .filter(e => e.time && e.time > now && e.time < next24hLimit)
        .sort((a, b) => a.time - b.time);

    const eventsHTML = upcomingEvents
        .map(e => `<li><span class="label">${e.name}</span> <span class="value">${formatTime(e.time)}</span></li>`)
        .join('');

    const sortedPhases = Object.entries(nextPhases)
        .map(([key, date]) => ({ name: getPhaseName(key), date }))
        .sort((a, b) => a.date - b.date);

    const phasesHTML = sortedPhases
        .map(p => `<li><span class="label">${p.name}</span> <span class="value">${p.date.toLocaleDateString('hu-HU')}</span></li>`)
        .join('');

    function getPhaseName(key) {
        switch (key) {
            case 'newMoon': return 'Újhold';
            case 'firstQuarter': return 'Első Negyed';
            case 'fullMoon': return 'Telihold';
            case 'lastQuarter': return 'Utolsó Negyed';
        }
    }
    
    const dashboardHTML = `
        <div id="time-display" class="time-display">
            <div><i class="ph-clock"></i> Helyi idő: <span id="local-time">--:--:--</span></div>
            <div><i class="ph-globe"></i> Világidő: <span id="utc-time">--:--:-- UTC</span></div>
        </div>
        <div id="location-display">
            <i class="ph-map-pin"></i> Hozzávetőleges pozíció: Szélesség: ${lat.toFixed(4)}°, Hosszúság: ${lon.toFixed(4)}°
        </div>

        <div class="accordion">
            <button class="accordion-header active">
                <h2><i class="ph-clock-countdown"></i> Napi Események (24h)</h2>
                <i class="ph ph-caret-down accordion-icon"></i>
            </button>
            <div class="accordion-content active" style="max-height: fit-content; padding: 1.5rem;">
                <ul class="data-list">
                    ${eventsHTML || '<li><span class="label">Nincs több esemény a következő 24 órában.</span></li>'}
                </ul>
            </div>
        </div>

        <div class="accordion">
            <button class="accordion-header active">
                <h2><i class="ph-moon"></i> Hold Adatok</h2>
                <i class="ph ph-caret-down accordion-icon"></i>
            </button>
            <div class="accordion-content active" style="max-height: fit-content; padding: 1.5rem;">
                 <div class="moon-phase-container">
                    <div class="moon-phase-visual">
                        <canvas id="moon-visual-canvas" width="120" height="120" title="Kattints a nagyításhoz!"></canvas>
                    </div>
                    <strong>${moonPhaseName}</strong>
                    <p>${(moonIllumination.fraction * 100).toFixed(1)}% megvilágított</p>
                </div>
                <ul class="data-list">
                     <li><span class="label"><i class="ph-ruler"></i> Távolság</span> <span class="value">${moonData.distance.toFixed(0)} km</span></li>
                     <li><span class="label"><i class="ph-arrows-out-line-vertical"></i> Delelési magasság</span> <span class="value">${formatAngle(moonData.culmination.altitude)}</span></li>
                     <li><span class="label">Aktuális magasság</span><span class="value" id="moon-alt"></span></li>
                    <li><span class="label">Aktuális azimut</span><span class="value" id="moon-az"></span></li>
                </ul>
            </div>
        </div>
            
        <div class="accordion">
            <button class="accordion-header">
                <h2><i class="ph-calendar-blank"></i> Következő Holdfázisok</h2>
                <i class="ph ph-caret-down accordion-icon"></i>
            </button>
            <div class="accordion-content">
                <ul class="data-list">
                    ${phasesHTML}
                </ul>
            </div>
        </div>
    `;

    container.innerHTML = dashboardHTML;

    if (timeUpdateInterval) clearInterval(timeUpdateInterval);
    updateTimeDisplay();
    timeUpdateInterval = setInterval(updateTimeDisplay, 1000);
    
    const canvas = document.getElementById('moon-visual-canvas');
    if (canvas) {
        const drawFn = () => updateMoonVisual(canvas, moonIllumination.fraction, moonIllumination.phase);
        if (moonImageLoaded) {
            drawFn();
        } else {
            moonImage.onload = drawFn;
        }
        
        canvas.addEventListener('click', () => {
            const modal = document.getElementById('app-modal');
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = '<h3>Aktuális Holdfázis</h3><canvas id="modal-moon-canvas" width="400" height="400"></canvas>';
            const modalCanvas = document.getElementById('modal-moon-canvas');
            const drawModalFn = () => updateMoonVisual(modalCanvas, moonIllumination.fraction, moonIllumination.phase);
             if (moonImageLoaded) {
                drawModalFn();
            } else {
                moonImage.onload = drawModalFn;
            }
            modal.style.display = 'flex';
        });
    }
    
    updateMoonPosition(lat, lon);
    setInterval(() => updateMoonPosition(lat, lon), 60000);
}


function updateMoonVisual(canvas, fraction, phase) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const r = width / 2;
    ctx.clearRect(0, 0, width, height);
    if (!moonImageLoaded) return;

    // --- 1. Draw Glow ---
    ctx.save();
    ctx.shadowColor = 'rgba(200, 200, 255, 0.5)';
    ctx.shadowBlur = r * 0.2;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(r, r, r * 0.98, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // --- 2. Draw Earthshine Base (dim texture) ---
    ctx.save();
    ctx.globalAlpha = 0.25; // Earthshine brightness
    ctx.beginPath();
    ctx.arc(r, r, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(moonImage, 0, 0, width, height);
    ctx.restore();

    // --- 3. Create clipping path for the lit area ---
    const terminatorX_signed = r * Math.cos(phase * 2 * Math.PI);
    const terminatorRx = Math.abs(terminatorX_signed);
    
    ctx.beginPath();
    if (phase <= 0.5) { // Waxing (light on the right)
        ctx.arc(r, r, r, -Math.PI / 2, Math.PI / 2, false); // Right limb
        ctx.ellipse(r, r, terminatorRx, r, 0, Math.PI / 2, -Math.PI / 2, terminatorX_signed > 0);
    } else { // Waning (light on the left)
        ctx.arc(r, r, r, Math.PI / 2, -Math.PI / 2, false); // Left limb
        ctx.ellipse(r, r, terminatorRx, r, 0, -Math.PI / 2, Math.PI / 2, terminatorX_signed > 0);
    }
    ctx.closePath();

    // --- 4. Draw the lit texture inside the clip ---
    ctx.save();
    ctx.clip();
    ctx.drawImage(moonImage, 0, 0, width, height);
    ctx.restore();
}


function updateMoonPosition(lat, lon) {
    const now = new Date();
    const pos = SunCalc.getMoonPosition(now, lat, lon);
    
    const altEl = document.getElementById('moon-alt');
    const azEl = document.getElementById('moon-az');

    if(altEl) altEl.textContent = formatAngle(pos.altitude);
    if(azEl) azEl.textContent = formatAngle(pos.azimuth);
}

export function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = `Hiba történt: ${message}. Engedélyezd a helymeghatározást a böngésződben és frissítsd az oldalt.`;
    errorContainer.style.display = 'block';
}

export function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
}

export function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}
