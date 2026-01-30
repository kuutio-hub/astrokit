
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
    const dashboard = document.getElementById('dashboard');
    const now = new Date();

    const moonIllumination = moonData.illumination;
    const moonPhaseName = getHungarianMoonPhaseName(moonIllumination.phase);

    // --- Sort Sky Events ---
    const skyEvents = [
        { name: '<i class="ph-sunrise"></i> Napkelte', time: sunData.sunrise },
        { name: '<i class="ph-sun-horizon"></i> Delelés', time: sunData.solarNoon },
        { name: '<i class="ph-sunset"></i> Napnyugta', time: sunData.sunset },
        { name: '<i class="ph-clock"></i> Polgári szürkület (reggel)', time: sunData.dawn },
        { name: '<i class="ph-clock"></i> Polgári szürkület (este)', time: sunData.dusk },
        { name: '<i class="ph-star"></i> Csillagászati sötétség kezdete', time: sunData.night },
        { name: '<i class="ph-star-half"></i> Csillagászati sötétség vége', time: sunData.nightEnd },
        { name: '<i class="ph-arrow-up"></i> Holdkelte', time: moonData.rise },
        { name: '<i class="ph-arrow-down"></i> Holdnyugta', time: moonData.set },
    ];

    const sortedEvents = skyEvents
        .filter(e => e.time && e.time > now)
        .sort((a, b) => a.time - b.time);

    const eventsHTML = sortedEvents
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
        <div class="dashboard-grid">
            <div class="card">
                <h2><i class="ph-clock-countdown" style="color: var(--accent-color);"></i> Következő Események</h2>
                <ul class="data-list">
                    ${eventsHTML || '<li><span class="label">Nincs több esemény a mai napon.</span></li>'}
                </ul>
            </div>

            <div class="card">
                <h2><i class="ph-moon" style="color: var(--moon-color);"></i> Hold Adatok</h2>
                <div class="moon-phase-container">
                    <div class="moon-phase-visual" id="moon-visual">
                        <div class="moon-phase-shadow" id="moon-shadow"></div>
                    </div>
                    <strong>${moonPhaseName}</strong>
                    <p>${(moonIllumination.fraction * 100).toFixed(1)}% megvilágított</p>
                </div>
                <ul class="data-list">
                    <li><span class="label"><i class="ph-ruler"></i> Távolság</span> <span class="value">${moonData.distance.toFixed(0)} km</span></li>
                    <li><span class="label"><i class="ph-arrows-out-line-vertical"></i> Delelési magasság</span> <span class="value">${formatAngle(moonData.culmination.altitude)}</span></li>
                </ul>
            </div>
            
            <div class="card">
                <h2><i class="ph-calendar-blank"></i> Következő Holdfázisok</h2>
                <ul class="data-list">
                    ${phasesHTML}
                </ul>
            </div>

            <div class="card">
                <h2><i class="ph-map-pin"></i> Helyzet</h2>
                 <p class="description">Az adatok az alábbi koordinátákra lettek számítva:</p>
                <ul class="data-list">
                    <li><span class="label">Szélesség</span><span class="value">${lat.toFixed(4)}°</span></li>
                    <li><span class="label">Hosszúság</span><span class="value">${lon.toFixed(4)}°</span></li>
                </ul>
            </div>
        </div>
    `;

    dashboard.innerHTML = dashboardHTML;
    updateMoonVisual(moonIllumination.phase);
}

function updateMoonVisual(phase) {
    const shadow = document.getElementById('moon-shadow');
    if (!shadow) return;

    // phase: 0=new, 0.25=1st Q, 0.5=full, 0.75=3rd Q
    let rotation, translateX;

    if (phase <= 0.5) { // Waxing (növekvő), new moon to full moon
        // Shadow is on the left, moves from 0% (covering) to -100% (off-screen)
        rotation = 0;
        translateX = (phase / 0.5) * -100;
    } else { // Waning (fogyó), full moon to new moon
        // Shadow is on the right, moves from 100% (off-screen) to 0% (covering)
        rotation = 180;
        translateX = (1 - ((phase - 0.5) / 0.5)) * 100;
    }
    
    shadow.style.transform = `rotate(${rotation}deg) translateX(${translateX}%)`;
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
