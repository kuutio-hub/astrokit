
let animationFrameId = null;

export function initAnalemma(lat, lon) {
    const canvas = document.getElementById('analemma-canvas');
    const timeSlider = document.getElementById('analemma-time');
    const timeDisplay = document.getElementById('analemma-time-display');
    const loader = document.getElementById('analemma-loader');

    if (!canvas || !timeSlider) return;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    const redraw = async () => {
        loader.style.display = 'flex';
        const hour = parseFloat(timeSlider.value);
        const minutes = (hour % 1) * 60;
        timeDisplay.textContent = `${String(Math.floor(hour)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        // Use a short timeout to allow the UI to update (show loader) before the calculation
        await new Promise(resolve => setTimeout(resolve, 20));

        const sunPositions = calculateAnalemma(lat, lon, hour);
        drawAnalemma(canvas, sunPositions, hour);
        loader.style.display = 'none';
    };

    timeSlider.addEventListener('input', () => {
        const hour = parseFloat(timeSlider.value);
        const minutes = (hour % 1) * 60;
        timeDisplay.textContent = `${String(Math.floor(hour)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    });
    timeSlider.addEventListener('change', redraw);

    // Initial draw
    redraw();
}

function calculateAnalemma(lat, lon, hour) {
    const positions = [];
    const year = new Date().getFullYear();
    const localHour = hour - new Date().getTimezoneOffset() / 60;

    for (let i = 0; i < 365; i++) {
        const date = new Date(Date.UTC(year, 0, i + 1, localHour));
        const pos = SunCalc.getPosition(date, lat, lon);
        positions.push({
            date: date,
            altitude: pos.altitude * 180 / Math.PI,
            azimuth: pos.azimuth * 180 / Math.PI
        });
    }
    return positions;
}

function drawAnalemma(canvas, sunPositions) {
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('analemma-tooltip');
    const { width, height } = canvas;
    
    const styles = getComputedStyle(document.body);
    const padding = 50;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    // Filter out positions below the horizon
    const visiblePositions = sunPositions.filter(p => p.altitude > 0);
    if (visiblePositions.length < 2) {
        ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = styles.getPropertyValue('--text-secondary-color').trim();
        ctx.textAlign = 'center';
        ctx.font = "16px sans-serif";
        ctx.fillText("A Nap ebben az időpontban egész évben a horizont alatt van.", width / 2, height / 2);
        return;
    }

    const minAlt = Math.min(...visiblePositions.map(p => p.altitude));
    const maxAlt = Math.max(...visiblePositions.map(p => p.altitude));
    const altRange = maxAlt - minAlt;

    const azValues = visiblePositions.map(p => p.azimuth);
    const minAz = Math.min(...azValues);
    const maxAz = Math.max(...azValues);
    const azRange = maxAz - minAz;

    const horizontalExaggeration = 4;
    
    const scaleY = altRange > 0 ? plotHeight / altRange : 1;
    const scaleX = azRange > 0 ? plotWidth / (azRange * horizontalExaggeration) : 1;

    const getDayOfYear = date => (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
    
    const specialPointsData = [
        { day: 80, label: 'Tavaszi napéjegyenlőség', color: '#f5f5f5' }, 
        { day: 172, label: 'Nyári napforduló', color: '#ffeb3b' },
        { day: 265, label: 'Őszi napéjegyenlőség', color: '#f5f5f5' },
        { day: 355, label: 'Téli napforduló', color: '#58a6ff' }
    ];

    const todayIndex = getDayOfYear(new Date()) -1;

    const getCanvasCoords = (pos) => {
        const x = padding + ((pos.azimuth - minAz) * scaleX * horizontalExaggeration);
        const y = height - padding - ((pos.altitude - minAlt) * scaleY);
        return { x, y };
    };

    ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines and labels
    ctx.strokeStyle = styles.getPropertyValue('--border-color').trim();
    ctx.lineWidth = 1;
    ctx.font = "12px sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = styles.getPropertyValue('--text-secondary-color').trim();
    
    // Horizontal lines (altitude)
    for(let i=0; i <= 5; i++) {
        const alt = minAlt + (altRange / 5) * i;
        const y = height - padding - (plotHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        ctx.fillText(`${alt.toFixed(0)}°`, padding - 20, y);
    }

    // Draw the analemma path
    ctx.beginPath();
    const firstPoint = getCanvasCoords(visiblePositions[0]);
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for(let i = 1; i < visiblePositions.length; i++) {
        const point = getCanvasCoords(visiblePositions[i]);
        ctx.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = styles.getPropertyValue('--text-secondary-color').trim();
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw special points
    specialPointsData.forEach(p => {
        const pos = sunPositions[p.day];
        if (pos.altitude > 0) {
            const { x, y } = getCanvasCoords(pos);
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
    });

    // Draw today's position
    const todayPos = sunPositions[todayIndex];
    if (todayPos && todayPos.altitude > 0) {
        const { x, y } = getCanvasCoords(todayPos);
        ctx.beginPath();
        ctx.fillStyle = '#ff6b5c';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}