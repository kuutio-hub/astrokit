
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
    const textColor = styles.getPropertyValue('--text-color').trim();
    const lineColor = styles.getPropertyValue('--border-color').trim();
    const accentColor = styles.getPropertyValue('--accent-color').trim();

    // Polaris J2000 Right Ascension in hours
    const polarisRA = 2.5303; 
    // Polaris is about 0.65 degrees from the NCP
    const polarisDistFraction = 0.15; // Visual representation distance

    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw outer circle
    ctx.strokeStyle = lineColor;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw crosshairs for NCP
    ctx.beginPath();
    ctx.moveTo(center.x - 10, center.y);
    ctx.lineTo(center.x + 10, center.y);
    ctx.moveTo(center.x, center.y - 10);
    ctx.lineTo(center.x, center.y + 10);
    ctx.stroke();

    // Draw hour markers
    ctx.fillStyle = textColor;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('0', center.x, center.y + radius - 15);
    ctx.fillText('6', center.x - radius + 15, center.y);
    ctx.fillText('12', center.x, center.y - radius + 15);
    ctx.fillText('18', center.x + radius - 15, center.y);

    // Calculate Polaris position
    const hourAngle = (lst - polarisRA) * 15; // in degrees
    const angleRad = toRad(hourAngle) - Math.PI / 2; // Adjust for canvas coordinates (0 is top)
    
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
    ctx.arc(polarisPos.x, polarisPos.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Update info text
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
