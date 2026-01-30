
export function initAnalemma(lat, lon) {
    const canvas = document.getElementById('analemma-canvas');
    const loader = document.getElementById('analemma-loader');
    if (!canvas) return;

    loader.style.display = 'flex';
    
    // Use setTimeout to allow the UI to update and show the loader before the heavy computation starts
    setTimeout(() => {
        drawAnalemma(canvas, lat, lon);
        loader.style.display = 'none';
    }, 100);
}

function drawAnalemma(canvas, lat, lon) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Style
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#30363d';
    ctx.fillStyle = '#c9d1d9';
    ctx.font = "12px sans-serif";
    
    let sunPositions = [];
    let minAlt = 90, maxAlt = 0, minAz = 180, maxAz = 180;

    const year = new Date().getFullYear();
    const startDate = new Date(year, 0, 1);

    for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        // Calculate solar noon for this day
        const solarNoon = SunCalc.getTimes(date, lat, lon).solarNoon;
        
        const pos = SunCalc.getPosition(solarNoon, lat, lon);
        const altitude = pos.altitude * 180 / Math.PI;
        const azimuth = pos.azimuth * 180 / Math.PI;

        sunPositions.push({ date, altitude, azimuth });

        if (altitude < minAlt) minAlt = altitude;
        if (altitude > maxAlt) maxAlt = altitude;
        if (azimuth < minAz) minAz = azimuth;
        if (azimuth > maxAz) maxAz = azimuth;
    }
    
    // Drawing parameters
    const padding = 40;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;
    
    const altRange = maxAlt - minAlt;
    const azRange = maxAz - minAz;
    
    // Draw axes
    ctx.beginPath();
    // Y-axis (Altitude)
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    // X-axis (Azimuth)
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw labels
    ctx.textAlign = 'right';
    ctx.fillText(`${maxAlt.toFixed(1)}°`, padding - 5, padding + 5);
    ctx.fillText(`${minAlt.toFixed(1)}°`, padding - 5, height - padding);
    ctx.textAlign = 'center';
    ctx.fillText('Déli Irány (180°)', width / 2, height - padding + 25);
    ctx.save();
    ctx.rotate(-Math.PI/2);
    ctx.fillText('Magasság', -height/2, padding - 25);
    ctx.restore();

    // Plot points
    sunPositions.forEach((pos, index) => {
        const x = padding + ((pos.azimuth - minAz) / azRange) * plotWidth;
        const y = (height - padding) - ((pos.altitude - minAlt) / altRange) * plotHeight;
        
        ctx.beginPath();
        // Color solstices and equinoxes
        if (index === 0 || index === 364) { // Winter Solstice approx
             ctx.fillStyle = '#58a6ff'; // Blue
        } else if (Math.abs(index - 172) < 2) { // Summer Solstice approx
             ctx.fillStyle = '#ffeb3b'; // Yellow
        } else if (Math.abs(index - 80) < 2 || Math.abs(index - 265) < 2) { // Equinoxes
             ctx.fillStyle = '#f5f5f5'; // White
        } else {
            ctx.fillStyle = '#8b949e';
        }
       
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
    });
}
