
import { cameras } from '../data/cameras.js';
import { objects } from '../data/objects.js';
import { isoRecommendations } from '../data/iso_recommendations.js';

const $ = (selector) => document.querySelector(selector);
let currentGear = {};

export function initAstrofotoHelper() {
    setupFovSimulator();
    setupEventListeners();
    
    document.addEventListener('gearUpdated', (e) => {
        currentGear = e.detail;
        updateAstrofotoCalculations();
    });

    // Initial calculation
    setTimeout(() => {
        const cameraIndex = $('#cameraSelect').value || 0;
        currentGear = {
            ...currentGear,
            teleFocalLength: parseFloat($('#main-gear-form').elements.teleFocalLength.value),
            teleAperture: parseFloat($('#main-gear-form').elements.teleAperture.value),
            cameraIndex: parseInt(cameraIndex),
            pixelSize: cameras[cameraIndex].pixel_size
        };
        updateAstrofotoCalculations();
    }, 100);
}

function setupEventListeners() {
    $('#astrophoto-form').addEventListener('input', updateAstrofotoCalculations);
}

function updateAstrofotoCalculations() {
    const scenario = $('#photo-scenario').value;
    const focalLength = parseFloat($('#ap-focal-length').value);
    const aperture = parseFloat($('#ap-aperture').value);
    const lightPollution = $('#ap-light-pollution').value;
    const { pixelSize } = currentGear;
    
    // --- Exposure Time Calculation ---
    let exposureTime = 0;
    let exposureRule = '';

    if (scenario === 'tripod') {
        // Simplified NPF Rule: t = (35A + 30p) / f
        // A = aperture f-number, p = pixel pitch, f = focal length
        if (focalLength > 0 && pixelSize > 0 && aperture > 0) {
            exposureTime = (35 * aperture + 30 * pixelSize) / focalLength;
        }
        exposureRule = 'NPF Szabály alapján';
    } else { // piggyback or primefocus
        exposureTime = '30 - 300'; // Suggest a range for tracked shots
        exposureRule = 'Követéstől és témától függ';
    }
    
    $('#res-exposure-time').textContent = typeof exposureTime === 'number' 
        ? `${exposureTime.toFixed(1)} s` 
        : `${exposureTime} s`;
    $('#res-exposure-rule').textContent = exposureRule;

    // --- ISO Recommendation ---
    const recommendation = isoRecommendations.find(rec => {
        const [min, max] = rec.f_ratio.split('-').map(f => parseFloat(f.replace('f/','')));
        return aperture >= min && aperture <= max && rec.pollution === lightPollution;
    });
    $('#res-iso-range').textContent = recommendation ? `ISO ${recommendation.iso}` : 'N/A';
    
    // --- Trigger FOV redraw ---
    drawFov();
}

function setupFovSimulator() {
    const objectSelect = $('#fov-form').elements.fovObject;
    
    objects.forEach((obj, index) => {
        const option = new Option(obj.name, index);
        objectSelect.add(option);
    });

    $('#fov-form').addEventListener('input', drawFov);
}

function drawFov() {
    const focalLength = parseFloat($('#ap-focal-length').value);
    const selectedCamera = cameras[currentGear.cameraIndex || 0];
    const selectedObject = objects[$('#fov-form').elements.fovObject.value];

    if (!focalLength || !selectedCamera || !selectedObject) return;

    const canvas = $('#fov-canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    const fovWidthDeg = 2 * Math.atan(selectedCamera.width_mm / (2 * focalLength)) * (180 / Math.PI);
    const fovHeightDeg = 2 * Math.atan(selectedCamera.height_mm / (2 * focalLength)) * (180 / Math.PI);

    const padding = 10;
    const maxDim = Math.max(fovWidthDeg, fovHeightDeg, selectedObject.width_deg, selectedObject.height_deg);
    const scale = (Math.min(width, height) - 2 * padding) / maxDim;

    const styles = getComputedStyle(document.body);
    ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
    ctx.fillRect(0, 0, width, height);

    const fovRectWidth = fovWidthDeg * scale;
    const fovRectHeight = fovHeightDeg * scale;
    ctx.strokeStyle = styles.getPropertyValue('--accent-color').trim();
    ctx.lineWidth = 2;
    ctx.strokeRect((width - fovRectWidth) / 2, (height - fovRectHeight) / 2, fovRectWidth, fovRectHeight);

    const objWidth = selectedObject.width_deg * scale;
    const objHeight = selectedObject.height_deg * scale;
    ctx.fillStyle = styles.getPropertyValue('--text-secondary-color').trim();
    ctx.globalAlpha = 0.7;
    if (selectedObject.shape === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, objWidth / 2, objHeight / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        ctx.fillRect((width - objWidth) / 2, (height - objHeight) / 2, objWidth, objHeight);
    }
    ctx.globalAlpha = 1.0;

    $('#fov-info').innerHTML = `Látómező: ${fovWidthDeg.toFixed(2)}° x ${fovHeightDeg.toFixed(2)}°`;
}
