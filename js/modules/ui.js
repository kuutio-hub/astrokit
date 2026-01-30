
import { maria } from '../data/maria.js';

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
    const canvas = document.getElementById('moon-visual-canvas');
    if (canvas) {
        updateMoonVisual(canvas, moonIllumination.fraction, moonIllumination.phase);
        
        canvas.addEventListener('click', () => {
            const modal = document.getElementById('app-modal');
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = '<h3>Aktuális Holdfázis</h3><canvas id="modal-moon-canvas" width="400" height="400"></canvas>';
            const modalCanvas = document.getElementById('modal-moon-canvas');
            updateMoonVisual(modalCanvas, moonIllumination.fraction, moonIllumination.phase);
            modal.style.display = 'flex';
        });
    }
    
    updateMoonPosition(lat, lon);
    setInterval(() => updateMoonPosition(lat, lon), 60000);
}

function drawCraters(ctx, radius, isLitCheck, opacity) {
    ctx.save();
    ctx.clip(); 
    
    const craterCount = Math.floor(radius * 1.5); 
    for (let i = 0; i < craterCount; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const dist = Math.random() * radius * 0.95;
        const x = radius + Math.cos(angle) * dist;
        const y = radius + Math.sin(angle) * dist;

        if (isLitCheck(x, y)) {
            const craterRadius = (Math.random() * 0.03 + 0.01) * radius * (1 - dist/radius * 0.5);
            ctx.beginPath();
            ctx.arc(x, y, craterRadius, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity * (Math.random() * 0.15 + 0.1)})`;
            ctx.fill();

            const rimAngle = angle + Math.PI * 1.1;
            const rimX = x + Math.cos(rimAngle) * craterRadius * 0.2;
            const rimY = y + Math.sin(rimAngle) * craterRadius * 0.2;
            ctx.beginPath();
            ctx.arc(rimX, rimY, craterRadius * 0.9, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * (Math.random() * 0.12)})`;
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawMaria(ctx, radius, isLitCheck, opacity) {
    ctx.save();
    ctx.clip();
    
    maria.forEach(mare => {
        ctx.beginPath();
        const startX = radius + mare.path[0][0] * radius;
        const startY = radius - mare.path[0][1] * radius; // Y is inverted in canvas
        ctx.moveTo(startX, startY);

        for (let i = 1; i < mare.path.length; i++) {
             const x = radius + mare.path[i][0] * radius;
             const y = radius - mare.path[i][1] * radius;
             ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity * mare.opacity})`;
        ctx.fill();
    });

    ctx.restore();
}

function updateMoonVisual(canvas, fraction, phase) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const r = width / 2;
    ctx.clearRect(0, 0, width, height);

    // --- Create Gradients ---
    const litGradient = ctx.createRadialGradient(r * 0.7, r * 0.7, r * 0.1, r, r, r);
    litGradient.addColorStop(0, '#f9f9f9');
    litGradient.addColorStop(0.7, '#e0e0e0');
    litGradient.addColorStop(1, '#c0c0c0');

    const darkGradient = ctx.createRadialGradient(r * 1.3, r * 1.3, r, r, r, r * 2);
    darkGradient.addColorStop(0, '#3a3a3a');
    darkGradient.addColorStop(0.5, '#2c2c2c');
    darkGradient.addColorStop(1, '#1a1a1a');

    const earthshineGradient = ctx.createRadialGradient(r, r, r * 0.8, r, r, r);
    earthshineGradient.addColorStop(0, '#282c34');
    earthshineGradient.addColorStop(1, '#1a1d22');

    // --- Draw Earthshine (faintly visible dark side) ---
    ctx.fillStyle = earthshineGradient;
    ctx.beginPath();
    ctx.arc(r, r, r, 0, 2 * Math.PI);
    ctx.fill();

    // --- Draw Maria and Craters on the dark side ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, 2 * Math.PI);
    const isAlwaysTrue = () => true;
    drawMaria(ctx, r, isAlwaysTrue, 0.5);
    drawCraters(ctx, r, isAlwaysTrue, 0.4);
    ctx.restore();

    // --- Draw Base Lit Moon ---
    ctx.fillStyle = litGradient;
    ctx.beginPath();
    ctx.arc(r, r, r, 0, 2 * Math.PI);
    ctx.fill();
    
    // --- Draw Maria and Craters on the lit side ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, 2 * Math.PI);
    const isLitCheck = (x, y) => ctx.isPointInPath(x, y);
    drawMaria(ctx, r, isLitCheck, 1.0);
    drawCraters(ctx, r, isLitCheck, 1.0);
    ctx.restore();
    
    // --- Draw Terminator Shadow ---
    const terminatorAngle = (1 - fraction) * Math.PI;
    const terminatorX = r - Math.cos(terminatorAngle) * r;
    const terminatorRx = Math.abs(r - terminatorX);
    
    ctx.fillStyle = darkGradient;
    ctx.globalCompositeOperation = 'source-atop';

    if (fraction > 0.01 && fraction < 0.99) {
        ctx.beginPath();
        if (phase < 0.5) { // Waxing (light on right, shadow on left)
            ctx.arc(r, r, r, Math.PI / 2, -Math.PI / 2, true);
            ctx.ellipse(r, r, terminatorRx, r, 0, -Math.PI / 2, Math.PI / 2, false);
        } else { // Waning (light on left, shadow on right)
            ctx.arc(r, r, r, -Math.PI / 2, Math.PI / 2, true);
            ctx.ellipse(r, r, terminatorRx, r, 0, Math.PI / 2, -Math.PI / 2, false);
        }
        ctx.fill();
    } else if (fraction <= 0.01) { // New moon
        ctx.beginPath();
        ctx.arc(r, r, r, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
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