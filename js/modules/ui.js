
function formatTime(date) {
    if (!date || isNaN(date)) return 'N/A';
    return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

function formatAngle(angle) {
    return `${(angle * 180 / Math.PI).toFixed(2)}°`;
}

function getHungarianMoonPhaseName(phase) {
    if (phase < 0.03) return "Újhold";
    if (phase < 0.23) return "Növekvő sarló";
    if (phase < 0.27) return "Első negyed";
    if (phase < 0.48) return "Növekvő hold";
    if (phase < 0.52) return "Telihold";
    if (phase < 0.73) return "Fogyó hold";
    if (phase < 0.77) return "Utolsó negyed";
    if (phase < 0.97) return "Fogyó sarló";
    return "Újhold";
}


export function displayDashboardData(sunData, moonData, nextPhases, lat, lon) {
    const dashboard = document.getElementById('dashboard');

    const moonIllumination = moonData.illumination;
    const moonPhaseName = getHungarianMoonPhaseName(moonIllumination.phase);
    
    const dashboardHTML = `
        <div class="dashboard-grid">
            <div class="card">
                <h2><i class="ph-sun" style="color: var(--sun-color);"></i> Napi Égbolt</h2>
                <ul class="data-list">
                    <li><span class="label"><i class="ph-sunrise"></i> Napkelte</span> <span class="value">${formatTime(sunData.sunrise)}</span></li>
                    <li><span class="label"><i class="ph-sun-horizon"></i> Delelés</span> <span class="value">${formatTime(sunData.solarNoon)}</span></li>
                    <li><span class="label"><i class="ph-sunset"></i> Napnyugta</span> <span class="value">${formatTime(sunData.sunset)}</span></li>
                    <li style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-color);"><span class="label"><i class="ph-clock"></i> Polgári szürkület (reggel)</span> <span class="value">${formatTime(sunData.dawn)}</span></li>
                    <li><span class="label"><i class="ph-clock"></i> Polgári szürkület (este)</span> <span class="value">${formatTime(sunData.dusk)}</span></li>
                    <li><span class="label"><i class="ph-mountains"></i> Csillagászati szürkület vége</span> <span class="value">${formatTime(sunData.nauticalDawn)} -> ${formatTime(sunData.nightEnd)}</span></li>
                    <li><span class="label"><i class="ph-star"></i> Csillagászati sötétség</span> <span class="value">${formatTime(sunData.night)} -ig</span></li>
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
                    <li><span class="label"><i class="ph-arrow-up"></i> Holdkelte</span> <span class="value">${formatTime(moonData.rise)}</span></li>
                    <li><span class="label"><i class="ph-arrow-down"></i> Holdnyugta</span> <span class="value">${formatTime(moonData.set)}</span></li>
                    <li><span class="label"><i class="ph-ruler"></i> Távolság</span> <span class="value">${moonData.distance.toFixed(0)} km</span></li>
                    <li><span class="label"><i class="ph-arrows-out-line-vertical"></i> Delelési magasság</span> <span class="value">${formatAngle(moonData.culmination.altitude)}</span></li>
                </ul>
            </div>
            
            <div class="card">
                <h2><i class="ph-calendar-blank"></i> Következő Holdfázisok</h2>
                <ul class="data-list">
                    <li><span class="label">Újhold</span> <span class="value">${nextPhases.newMoon.toLocaleDateString('hu-HU')}</span></li>
                    <li><span class="label">Első Negyed</span> <span class="value">${nextPhases.firstQuarter.toLocaleDateString('hu-HU')}</span></li>
                    <li><span class="label">Telihold</span> <span class="value">${nextPhases.fullMoon.toLocaleDateString('hu-HU')}</span></li>
                    <li><span class="label">Utolsó Negyed</span> <span class="value">${nextPhases.lastQuarter.toLocaleDateString('hu-HU')}</span></li>
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

    if (phase < 0.5) { // Waxing (növekvő)
        rotation = 180;
        translateX = 50 * (1 - (phase / 0.5)); // from 50% to 0%
    } else { // Waning (fogyó)
        rotation = 0;
        translateX = -50 * ((phase - 0.5) / 0.5); // from -0% to -50%
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
