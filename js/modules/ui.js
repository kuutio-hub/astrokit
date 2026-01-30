
import { moonPhaseSVGs } from '../data/moon_phases.js';

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

export function displayDashboardData(sunData, moonData, nextPhases, lat, lon) {
    const container = document.getElementById('dashboard-container');
    const now = new Date();

    const moonIllumination = moonData.illumination;
    const moonPhaseName = getHungarianMoonPhaseName(moonIllumination.phase);

    // --- Create a comprehensive, sorted list of events for the next 24 hours ---
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

        // Add tomorrow's events to catch things that happen overnight
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

    // --- Sort Moon Phases ---
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
                    <div class="moon-phase-visual" id="moon-visual"></div>
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
    updateMoonVisual(moonIllumination.phase);
    
    updateMoonPosition(lat, lon);
    setInterval(() => updateMoonPosition(lat, lon), 60000); // Update every minute
}

function updateMoonVisual(phase) {
    const visual = document.getElementById('moon-visual');
    if (!visual) return;

    // Total steps in a full cycle (0-27)
    const totalSteps = 28; 
    // Calculate the index in our 0-27 steps
    const stepIndex = Math.round(phase * totalSteps) % totalSteps;
    
    let svg;
    let transform = '';

    // The first half of the cycle (0-14, waxing) uses the images directly
    if (stepIndex <= 14) {
        svg = moonPhaseSVGs[stepIndex];
    } else {
        // The second half (15-27, waning) mirrors the first half's images
        // e.g., phase 15 mirrors 13, 16 mirrors 12, ..., 27 mirrors 1
        const mirrorIndex = totalSteps - stepIndex;
        svg = moonPhaseSVGs[mirrorIndex];
        // We apply a horizontal flip
        transform = 'transform: scaleX(-1);';
    }

    visual.innerHTML = `<div style="${transform}">${svg || moonPhaseSVGs[0]}</div>`;
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
