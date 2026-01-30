
let animationFrameId = null;
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
    const lineLightColor = styles.getPropertyValue('--border-color').trim();
    const accentColor = styles.getPropertyValue('--accent-color').trim();
    const textColorStrong = styles.getPropertyValue('--text-color').trim();

    const polarisRA = 2.5303; 
    const polarisDistFraction = 0.7; // Slightly smaller circle for Polaris

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw outer ticks
    ctx.strokeStyle = lineLightColor;
    
    for (let i = 0; i < 144; i++) { 
        const angle = toRad(i * 2.5 - 90);
        const isHour = i % 6 === 0;
        const isHalfHour = i % 3 === 0;
        
        let tickStart;
        if (isHour) {
            tickStart = radius * 0.90;
            ctx.lineWidth = 2;
        } else if (isHalfHour) {
            tickStart = radius * 0.94;
            ctx.lineWidth = 1.5;
        } else {
            tickStart = radius * 0.97;
            ctx.lineWidth = 0.75;
        }

        ctx.beginPath();
        ctx.moveTo(center.x + Math.cos(angle) * tickStart, center.y + Math.sin(angle) * tickStart);
        ctx.lineTo(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);
        ctx.stroke();

        // Draw hour numbers
        if (isHour) {
            ctx.fillStyle = textColorStrong;
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textX = center.x + Math.cos(angle) * (radius - 25);
            const textY = center.y + Math.sin(angle) * (radius - 25);
            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(angle + Math.PI / 2); // Rotate numbers to be upright
            ctx.fillText(i/6, 0, 0);
            ctx.restore();
        }
    }


    // Draw crosshairs for NCP
    ctx.beginPath();
    ctx.moveTo(center.x - 15, center.y);
    ctx.lineTo(center.x + 15, center.y);
    ctx.moveTo(center.x, center.y - 15);
    ctx.lineTo(center.x, center.y + 15);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = textColor;
    ctx.stroke();

    const hourAngle = (lst - polarisRA) * 15;
    const angleRad = toRad(hourAngle) - Math.PI / 2;
    
    const polarisPos = {
        x: center.x + Math.cos(angleRad) * radius * polarisDistFraction,
        y: center.y + Math.sin(angleRad) * radius * polarisDistFraction
    };

    // Draw Polaris path circle
    ctx.strokeStyle = lineLightColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * polarisDistFraction, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw Polaris with glow
    pulseSize += 0.1 * pulseDirection;
    if (pulseSize > 4 || pulseSize < -1) {
        pulseDirection *= -1;
    }

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