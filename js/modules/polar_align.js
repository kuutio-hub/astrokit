
let animationIntervalId = null;
let lat = 0;
let lon = 0;
let pulseSize = 0;
let pulseDirection = 1;

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
    const lineColor = styles.getPropertyValue('--text-color').trim();
    const accentColor = styles.getPropertyValue('--accent-color').trim();

    const polarisRA = 2.5303; 
    const polarisDistFraction = 0.7;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw 12-hour outer circle with ticks
    for (let i = 0; i < 12; i++) {
        const angle = toRad(i * 30 - 90); // 0 is at the top (-90 deg)
        const tickStart = radius * 0.90;
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.moveTo(center.x + Math.cos(angle) * tickStart, center.y + Math.sin(angle) * tickStart);
        ctx.lineTo(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);
        ctx.stroke();

        let hour = i;
        if (hour % 3 === 0) {
            ctx.fillStyle = textColor;
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textX = center.x + Math.cos(angle) * (radius - 25);
            const textY = center.y + Math.sin(angle) * (radius - 25);
            let hourText = hour === 0 ? '0' : hour;
            ctx.fillText(hourText, textX, textY);
        }
    }

    // Draw crosshairs for NCP
    ctx.beginPath();
    ctx.moveTo(center.x - 15, center.y);
    ctx.lineTo(center.x + 15, center.y);
    ctx.moveTo(center.x, center.y - 15);
    ctx.lineTo(center.x, center.y + 15);
    ctx.lineWidth = 2;
    ctx.strokeStyle = lineColor;
    ctx.stroke();

    const hourAngle = (lst - polarisRA) * 15;
    // Stars rotate CCW around the pole. We subtract 90 to put 0 at the top.
    const angleRad = -toRad(hourAngle) - Math.PI / 2;
    
    const polarisPos = {
        x: center.x + Math.cos(angleRad) * radius * polarisDistFraction,
        y: center.y + Math.sin(angleRad) * radius * polarisDistFraction
    };

    // Draw Polaris path circle
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * polarisDistFraction, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw Polaris with glow
    pulseSize += 0.1 * pulseDirection;
    if (pulseSize > 4 || pulseSize < -1) pulseDirection *= -1;

    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10 + pulseSize;
    ctx.beginPath();
    ctx.arc(polarisPos.x, polarisPos.y, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(polarisPos.x, polarisPos.y, 7, 0, 2 * Math.PI);
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
}

export function initPolarAlign(_lat, _lon) {
    lat = _lat;
    lon = _lon;
    
    stopPolarAlignAnimation(); // Clear any existing interval
    animate(); // Draw immediately
    animationIntervalId = setInterval(animate, 5000); // Then update every 5 seconds
}

export function stopPolarAlignAnimation() {
    if (animationIntervalId) {
        clearInterval(animationIntervalId);
        animationIntervalId = null;
    }
}
