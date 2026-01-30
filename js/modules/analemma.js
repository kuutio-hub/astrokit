
const DB_NAME = 'AstroAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'analemmaStore';
let db;

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
    const startDate = new Date(Date.UTC(year, 0, 1, 12));
    for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setUTCDate(startDate.getUTCDate() + i);
        const solarNoon = SunCalc.getTimes(date, lat, lon, 0).solarNoon;
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
    const minAz = Math.min(...sunPositions.map(p => p.azimuth));
    const maxAz = Math.max(...sunPositions.map(p => p.azimuth));
    const altRange = maxAlt - minAlt;
    const azRange = maxAz - minAz;

    const specialPoints = [
        { day: 0, label: 'Téli napforduló', color: '#58a6ff' }, // Winter Solstice
        { day: 80, label: 'Tavaszi napéjegyenlőség', color: '#f5f5f5' }, // Vernal Equinox
        { day: 172, label: 'Nyári napforduló', color: '#ffeb3b' }, // Summer Solstice
        { day: 265, label: 'Őszi napéjegyenlőség', color: '#f5f5f5' } // Autumnal Equinox
    ].map(p => ({ ...p, pos: sunPositions[p.day] }));

    const getCanvasCoords = (pos) => {
        const x = padding + ((pos.azimuth - minAz) / azRange) * plotWidth;
        const y = (height - padding) - ((pos.altitude - minAlt) / altRange) * plotHeight;
        return { x, y };
    };

    const redraw = () => {
        ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = styles.getPropertyValue('--border-color').trim();
        ctx.fillStyle = styles.getPropertyValue('--text-color').trim();
        ctx.font = "12px sans-serif";
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.ceil(maxAlt)}°`, padding - 8, padding + 5);
        ctx.fillText(`${Math.floor(minAlt)}°`, padding - 8, height - padding);
        ctx.textAlign = 'center';
        ctx.fillText('Azimut (Délhez képest)', width / 2, height - padding + 25);
        ctx.save();
        ctx.translate(padding - 30, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Magasság', 0, 0);
        ctx.restore();

        sunPositions.forEach(pos => {
            const { x, y } = getCanvasCoords(pos);
            ctx.fillStyle = styles.getPropertyValue('--text-secondary-color').trim();
            ctx.fillRect(x, y, 1.5, 1.5);
        });

        specialPoints.forEach(p => {
            const { x, y } = getCanvasCoords(p.pos);
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
        });
    };

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
                tooltip.innerHTML = `${p.label}<br>${p.pos.date.toLocaleDateString('hu-HU')}`;
                tooltip.style.opacity = '1';
                found = true;
            }
        });
        if (!found) {
            tooltip.style.opacity = '0';
        }
    };
    redraw();
}
