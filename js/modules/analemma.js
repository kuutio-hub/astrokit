
const DB_NAME = 'AstroAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'analemmaStore';
let db;
let animationFrameId = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = (event) => reject('IndexedDB hiba: ' + event.target.errorCode);
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        };
    });
}

async function getAnalemmaData(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = (event) => reject('Adatbázis olvasási hiba: ' + event.target.errorCode);
    });
}

async function saveAnalemmaData(id, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id, data });
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Adatbázis írási hiba: ' + event.target.errorCode);
    });
}

export async function initAnalemma(lat, lon) {
    const canvas = document.getElementById('analemma-canvas');
    const loader = document.getElementById('analemma-loader');
    if (!canvas) return;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    loader.style.display = 'flex';
    const year = new Date().getFullYear();
    const id = `analemma-${year}-${lat.toFixed(2)}-${lon.toFixed(2)}`;
    try {
        let sunPositions = await getAnalemmaData(id);
        if (!sunPositions) {
            sunPositions = await new Promise(resolve => {
                setTimeout(() => resolve(calculateAnalemma(lat, lon)), 50);
            });
            await saveAnalemmaData(id, sunPositions);
        }
        
        const solarNoonToday = SunCalc.getTimes(new Date(), lat, lon).solarNoon;
        const localTimeSpan = document.getElementById('analemma-local-time');
        if (localTimeSpan) {
             localTimeSpan.textContent = solarNoonToday.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
        }

        drawAnalemma(canvas, sunPositions);
    } catch (error) {
        console.error("Analemma hiba:", error);
    } finally {
        loader.style.display = 'none';
    }
}

function calculateAnalemma(lat, lon) {
    const positions = [];
    const year = new Date().getFullYear();
    for (let i = 0; i < 365; i++) {
        const date = new Date(year, 0, i + 1, 12);
        const solarNoon = SunCalc.getTimes(date, lat, lon).solarNoon;
        const pos = SunCalc.getPosition(solarNoon, lat, lon);
        positions.push({
            date: solarNoon,
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

    const minAlt = Math.min(...sunPositions.map(p => p.altitude));
    const maxAlt = Math.max(...sunPositions.map(p => p.altitude));
    const altRange = maxAlt - minAlt;

    const azValues = sunPositions.map(p => p.azimuth);
    const minAz = Math.min(...azValues);
    const maxAz = Math.max(...azValues);
    const azRange = maxAz - minAz;

    const horizontalExaggeration = 4;
    
    const scaleY = plotHeight / altRange;
    const scaleX = plotWidth / (azRange * horizontalExaggeration);


    const specialPoints = [
        { day: 0, label: 'Téli napforduló', color: '#58a6ff' },
        { day: 80, label: 'Tavaszi napéjegyenlőség', color: '#f5f5f5' }, 
        { day: 172, label: 'Nyári napforduló', color: '#ffeb3b' },
        { day: 265, label: 'Őszi napéjegyenlőség', color: '#f5f5f5' }
    ].map(p => ({ ...p, pos: sunPositions[p.day] }));

    const getDayOfYear = date => (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
    const todayIndex = getDayOfYear(new Date()) - 1;
    const todayPos = sunPositions[todayIndex];

    const getCanvasCoords = (pos) => {
        const x = padding + ((pos.azimuth - minAz) * scaleX * horizontalExaggeration);
        const y = height - padding - ((pos.altitude - minAlt) * scaleY);
        return { x, y };
    };

    let pulseSize = 0;
    let pulseDirection = 1;

    const animate = () => {
        pulseSize += 0.15 * pulseDirection;
        if (pulseSize > 4 || pulseSize < 0) {
            pulseDirection *= -1;
        }
        
        ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = 'center';
        ctx.fillStyle = styles.getPropertyValue('--text-color').trim();
        ctx.font = "12px sans-serif";
        ctx.fillText("Dél", padding + plotWidth/2, height - padding + 25);
        ctx.save();
        ctx.translate(padding - 35, height/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillText("Magasság", 0, 0);
        ctx.restore();

        // Draw the analemma path as a continuous line
        ctx.beginPath();
        const firstPoint = getCanvasCoords(sunPositions[0]);
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for(let i = 1; i < sunPositions.length; i++) {
            const point = getCanvasCoords(sunPositions[i]);
            ctx.lineTo(point.x, point.y);
        }
        ctx.strokeStyle = styles.getPropertyValue('--text-secondary-color').trim();
        ctx.lineWidth = 1.5;
        ctx.stroke();


        // Draw special points on top
        specialPoints.forEach(p => {
            const { x, y } = getCanvasCoords(p.pos);
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
        });

        // Draw today's position
        if(todayPos) {
            const { x, y } = getCanvasCoords(todayPos);
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 107, 92, 0.8)';
            ctx.arc(x, y, 5 + pulseSize, 0, 2 * Math.PI);
            ctx.fill();
        }
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        let found = false;
        specialPoints.forEach(p => {
            const { x, y } = getCanvasCoords(p.pos);
            const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
            if (dist < 8) {
                tooltip.style.left = `${e.clientX + 10}px`;
                tooltip.style.top = `${e.clientY}px`;
                tooltip.innerHTML = `${p.label}<br>${new Date(p.pos.date).toLocaleDateString('hu-HU')}`;
                tooltip.style.opacity = '1';
                found = true;
            }
        });
        if (!found) {
            tooltip.style.opacity = '0';
        }
    };
}
