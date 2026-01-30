
let animationFrameId = null;
let lat = 0;
let lon = 0;

function toRad(deg) {
    return deg * Math.PI / 180;
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

function drawPolarScope(canvas, lst) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const center = { x: width / 2, y: height / 2 };
    const radius = width * 0.45;

    const styles = getComputedStyle(document.body);
    const bgColor = styles.getPropertyValue('--bg-color').trim();
    const textColor = styles.getPropertyValue('--text-secondary-color').trim();
    const lineLightColor = styles.getPropertyValue('--border-color').trim();
    const accentColor = styles.getPropertyValue('--accent-color').trim();
    const textColorStrong = styles.getPropertyValue('--text-color').trim();

    const polarisRA = 2.5303; 
    const polarisDistFraction = 0.8;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw outer ticks
    ctx.strokeStyle = lineLightColor;
    for (let i = 0; i < 60 * 12; i++) { // Ticks every 10 minutes (72 total)
        const angle = toRad(i * 0.5 - 90); // 360 degrees / 720 ticks
        const isHour = i % 60 === 0;
        const isHalfHour = i % 30 === 0;
        
        let tickStart;
        if (isHour) tickStart = radius * 0.92;
        else if (isHalfHour) tickStart = radius * 0.95;
        else tickStart = radius * 0.98;

        ctx.beginPath();
        ctx.moveTo(center.x + Math.cos(angle) * tickStart, center.y + Math.sin(angle) * tickStart);
        ctx.lineTo(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);
        ctx.stroke();

        if (isHour) {
            ctx.fillStyle = textColorStrong;
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textX = center.x + Math.cos(angle) * (radius - 20);
            const textY = center.y + Math.sin(angle) * (radius - 20);
            ctx.fillText(i/30, textX, textY);
        }
    }


    // Draw crosshairs for NCP
    ctx.beginPath();
    ctx.moveTo(center.x - 10, center.y);
    ctx.lineTo(center.x + 10, center.y);
    ctx.moveTo(center.x, center.y - 10);
    ctx.lineTo(center.x, center.y + 10);
    ctx.lineWidth = 1;
    ctx.strokeStyle = textColor;
    ctx.stroke();

    const hourAngle = (lst - polarisRA) * 15;
    const angleRad = toRad(hourAngle) - Math.PI / 2;
    
    const polarisPos = {
        x: center.x + Math.cos(angleRad) * radius * polarisDistFraction,
        y: center.y + Math.sin(angleRad) * radius * polarisDistFraction
    };

    // Draw Polaris path circle
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * polarisDistFraction, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw Polaris
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(polarisPos.x, polarisPos.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const infoEl = document.getElementById('polar-align-info');
    if (infoEl) {
        const lstHours = Math.floor(lst);
        const lstMins = Math.floor((lst - lstHours) * 60);
        infoEl.textContent = `Helyi Csillagidő: ${String(lstHours).padStart(2, '0')}:${String(lstMins).padStart(2, '0')} | Óraszög: ${hourAngle.toFixed(1)}°`;
    }
}

function animate() {
    const canvas = document.getElementById('polar-align-canvas');
    if (!canvas) return;
    
    const now = new Date();
    const lst = calculateSiderealTime(now, lon);
    
    drawPolarScope(canvas, lst);
    
    animationFrameId = requestAnimationFrame(animate);
}

export function initPolarAlign(_lat, _lon) {
    lat = _lat;
    lon = _lon;

    if (!animationFrameId) {
        animate();
    }
}

export function stopPolarAlignAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}
