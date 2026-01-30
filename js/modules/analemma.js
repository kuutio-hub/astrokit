
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
            // Use setTimeout to allow the UI to update and show the loader before the heavy computation starts
            sunPositions = await new Promise(resolve => {
                setTimeout(() => {
                    const positions = calculateAnalemma(lat, lon);
                    resolve(positions);
                }, 100);
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
            azimuth: pos.azimuth * 180 / Math.PI 
        });
    }
    return sunPositions;
}


function drawAnalemma(canvas, sunPositions) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
        ctx.clearRect(0, 0, width, height);
        
        // Dynamic colors based on current theme
        const styles = getComputedStyle(document.body);
        ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = styles.getPropertyValue('--border-color').trim();
        ctx.fillStyle = styles.getPropertyValue('--text-color').trim();
        ctx.font = "12px sans-serif";
        
        let minAlt = 90, maxAlt = 0, minAz = 180, maxAz = 180;
        sunPositions.forEach(pos => {
            if (pos.altitude < minAlt) minAlt = pos.altitude;
            if (pos.altitude > maxAlt) maxAlt = pos.altitude;
            if (pos.azimuth < minAz) minAz = pos.azimuth;
            if (pos.azimuth > maxAz) maxAz = pos.azimuth;
        });
        
        const padding = 40;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        const altRange = maxAlt - minAlt;
        const azRange = maxAz - minAz;
        
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        ctx.textAlign = 'right';
        ctx.fillText(`${maxAlt.toFixed(1)}°`, padding - 5, padding + 5);
        ctx.fillText(`${minAlt.toFixed(1)}°`, padding - 5, height - padding);
        ctx.textAlign = 'center';
        ctx.fillText('Déli Irány (180°)', width / 2, height - padding + 25);
        ctx.save();
        ctx.rotate(-Math.PI/2);
        ctx.fillText('Magasság', -height/2, padding - 25);
        ctx.restore();

        sunPositions.forEach((pos, index) => {
            const x = padding + ((pos.azimuth - minAz) / azRange) * plotWidth;
            const y = (height - padding) - ((pos.altitude - minAlt) / altRange) * plotHeight;
            
            ctx.beginPath();
            if (index === 0 || index === 364) {
                 ctx.fillStyle = '#58a6ff'; // Winter Solstice
            } else if (Math.abs(index - 172) < 2) {
                 ctx.fillStyle = '#ffeb3b'; // Summer Solstice
            } else if (Math.abs(index - 80) < 2 || Math.abs(index - 265) < 2) {
                 ctx.fillStyle = '#f5f5f5'; // Equinoxes
            } else {
                ctx.fillStyle = styles.getPropertyValue('--text-secondary-color').trim();
            }
           
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    });
}
