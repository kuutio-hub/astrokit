
const DB_NAME = 'AstroAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'analemmaStore';
let db;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }
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
                setTimeout(() => {
                    const positions = calculateAnalemma(lat, lon);
                    resolve(positions);
                }, 50);
            });
            await saveAnalemmaData(id, sunPositions);
        }
        
        drawAnalemma(canvas, sunPositions);

    } catch(error) {
        console.error("Analemma hiba:", error);
    } finally {
        loader.style.display = 'none';
    }
}

function calculateAnalemma(lat, lon) {
    let sunPositions = [];
    const year = new Date().getFullYear();
    const startDate = new Date(year, 0, 1);

    for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const solarNoon = SunCalc.getTimes(date, lat, lon).solarNoon;
        const pos = SunCalc.getPosition(solarNoon, lat, lon);
        
        sunPositions.push({ 
            altitude: pos.altitude * 180 / Math.PI, 
            azimuth: (pos.azimuth * 180 / Math.PI) + 180 // Azimuth correction
        });
    }
    return sunPositions;
}


function drawAnalemma(canvas, sunPositions) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    requestAnimationFrame(() => {
        const styles = getComputedStyle(document.body);
        ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = styles.getPropertyValue('--border-color').trim();
        ctx.fillStyle = styles.getPropertyValue('--text-color').trim();
        ctx.font = "12px sans-serif";
        
        let minAlt = Math.min(...sunPositions.map(p => p.altitude));
        let maxAlt = Math.max(...sunPositions.map(p => p.altitude));
        let minAz = Math.min(...sunPositions.map(p => p.azimuth));
        let maxAz = Math.max(...sunPositions.map(p => p.azimuth));
        
        const padding = 50;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        
        const altRange = maxAlt - minAlt;
        const azRange = maxAz - minAz;
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw labels
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.ceil(maxAlt)}°`, padding - 8, padding + 5);
        ctx.fillText(`${Math.floor(minAlt)}°`, padding - 8, height - padding);
        ctx.textAlign = 'center';
        ctx.fillText('Déli Irány', width / 2, height - padding + 25);
        ctx.save();
        ctx.translate(padding - 30, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Magasság', 0, 0);
        ctx.restore();

        // Plot points
        sunPositions.forEach((pos, index) => {
            const x = padding + ((pos.azimuth - minAz) / azRange) * plotWidth;
            const y = (height - padding) - ((pos.altitude - minAlt) / altRange) * plotHeight;
            
            ctx.beginPath();
            if (index === 0 || index >= 364) {
                 ctx.fillStyle = '#58a6ff'; // Winter Solstice
            } else if (Math.abs(index - 172) < 2) {
                 ctx.fillStyle = '#ffeb3b'; // Summer Solstice
            } else if (Math.abs(index - 80) < 2 || Math.abs(index - 265) < 2) {
                 ctx.fillStyle = '#f5f5f5'; // Equinoxes
            } else {
                ctx.fillStyle = styles.getPropertyValue('--text-secondary-color').trim();
            }
           
            ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
            ctx.fill();
        });
    });
}
