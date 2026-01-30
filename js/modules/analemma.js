
let animationFrameId = null;

function getSolsticeEquinoxDates(year) {
    // Simple approximations, accurate to within a day.
    return {
        vernalEquinox: new Date(Date.UTC(year, 2, 20)),
        summerSolstice: new Date(Date.UTC(year, 5, 21)),
        autumnalEquinox: new Date(Date.UTC(year, 8, 22)),
        winterSolstice: new Date(Date.UTC(year, 11, 21))
    };
}

export function initAnalemma(lat, lon) {
    const canvas = document.getElementById('analemma-canvas');
    const timeSlider = document.getElementById('analemma-time');
    const timeDisplay = document.getElementById('analemma-time-display');
    const loader = document.getElementById('analemma-loader');
    const tooltip = document.getElementById('analemma-tooltip');

    if (!canvas || !timeSlider) return;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    let sunPositions = [];
    let specialPointsCoords = [];

    const redraw = async () => {
        loader.style.display = 'flex';
        const hour = parseFloat(timeSlider.value);
        const minutes = (hour % 1) * 60;
        timeDisplay.textContent = `${String(Math.floor(hour)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        await new Promise(resolve => setTimeout(resolve, 20));

        sunPositions = calculateAnalemma(lat, lon, hour);
        specialPointsCoords = drawAnalemma(canvas, sunPositions, hour);
        loader.style.display = 'none';
    };
    
    canvas.addEventListener('mousemove', (e) => {
        if (specialPointsCoords.length === 0) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let foundPoint = null;
        for(const point of specialPointsCoords) {
            const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (dist < 10) { // 10px hover radius
                foundPoint = point;
                break;
            }
        }
        
        if (foundPoint) {
            tooltip.innerHTML = `${foundPoint.label}<br>${foundPoint.date.toLocaleDateString('hu-HU', {month: 'long', day: 'numeric'})}`;
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.clientX + 15}px`;
            tooltip.style.top = `${e.clientY}px`;
            tooltip.style.opacity = '1';
        } else {
            tooltip.style.opacity = '0';
            tooltip.style.display = 'none';
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
         tooltip.style.opacity = '0';
         tooltip.style.display = 'none';
    });


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
    const { width, height } = canvas;
    const year = new Date().getFullYear();
    
    const styles = getComputedStyle(document.body);
    const padding = 50;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    const visiblePositions = sunPositions.filter(p => p.altitude > 0);
    if (visiblePositions.length < 2) {
        ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = styles.getPropertyValue('--text-secondary-color').trim();
        ctx.textAlign = 'center';
        ctx.font = "16px sans-serif";
        ctx.fillText("A Nap ebben az időpontban egész évben a horizont alatt van.", width / 2, height / 2);
        return [];
    }

    const minAlt = Math.min(...visiblePositions.map(p => p.altitude));
    const maxAlt = Math.max(...visiblePositions.map(p => p.altitude));
    const altRange = maxAlt - minAlt;
    const azValues = visiblePositions.map(p => p.azimuth);
    const minAz = Math.min(...azValues);
    const maxAz = Math.max(...azValues);
    const azRange = maxAz - minAz;
    const horizontalExaggeration = 2;
    
    const scaleY = altRange > 0 ? plotHeight / altRange : 1;
    const scaleX = azRange > 0 ? plotWidth / (azRange * horizontalExaggeration) : 1;

    const getDayOfYear = date => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    const dates = getSolsticeEquinoxDates(year);
    const specialPointsData = [
        { date: dates.vernalEquinox, label: 'Tavaszi napéjegyenlőség', color: '#f5f5f5' }, 
        { date: dates.summerSolstice, label: 'Nyári napforduló', color: '#ffeb3b' },
        { date: dates.autumnalEquinox, label: 'Őszi napéjegyenlőség', color: '#f5f5f5' },
        { date: dates.winterSolstice, label: 'Téli napforduló', color: '#58a6ff' }
    ];

    const todayIndex = getDayOfYear(new Date()) - 1;

    const getCanvasCoords = (pos) => {
        const x = padding + ((pos.azimuth - minAz) * scaleX * horizontalExaggeration);
        const y = height - padding - ((pos.altitude - minAlt) * scaleY);
        return { x, y };
    };

    ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = styles.getPropertyValue('--border-color').trim();
    ctx.lineWidth = 1;
    ctx.font = "12px sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = styles.getPropertyValue('--text-secondary-color').trim();
    
    for(let i=0; i <= 5; i++) {
        const alt = minAlt + (altRange / 5) * i;
        const y = height - padding - (plotHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        ctx.fillText(`${alt.toFixed(0)}°`, padding - 20, y);
    }

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

    const specialPointsCoords = [];
    specialPointsData.forEach(p => {
        const pos = sunPositions[getDayOfYear(p.date) - 1];
        if (pos.altitude > 0) {
            const { x, y } = getCanvasCoords(pos);
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            specialPointsCoords.push({ x, y, label: p.label, date: p.date });
        }
    });

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
        specialPointsCoords.push({x, y, label: 'Mai nap', date: new Date() });
    }
    
    return specialPointsCoords;
}