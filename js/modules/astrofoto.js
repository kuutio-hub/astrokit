
import { cameras } from '../data/cameras.js';
import { objects } from '../data/objects.js';

const $ = (selector) => document.querySelector(selector);

let gearSettings = {};

export function initAstrofotoHelper() {
    setupExposureCalculator();
    setupFovSimulator();
    
    // Listen for global gear updates
    document.addEventListener('gearUpdated', (e) => {
        gearSettings = e.detail;
        updateFovInputs();
    });
}

function setupExposureCalculator() {
    const form = $('#calc-exposure');
    if (!form) return;
    
    const focalLengthInput = $('#exp-focal-length');
    const cropFactorSelect = $('#exp-sensor-crop');
    const result500Span = $('#exp-result-500');
    // NPF rule needs more data (aperture, pixel size) - we can get it from gearSettings later
    // For now, it's a placeholder.

    const calculate = () => {
        const focalLength = parseFloat(focalLengthInput.value);
        const cropFactor = parseFloat(cropFactorSelect.value);
        
        if (focalLength > 0 && cropFactor > 0) {
            const effectiveFocalLength = focalLength * cropFactor;
            const maxExposure500 = 500 / effectiveFocalLength;
            result500Span.textContent = `${maxExposure500.toFixed(2)} s`;
        }
    };
    
    form.addEventListener('input', calculate);
    calculate();
}

function setupFovSimulator() {
    const form = $('#fov-form');
    const cameraSelect = form.elements.fovCamera;
    const objectSelect = form.elements.fovObject;
    
    // Populate dropdowns
    cameras.forEach((cam, index) => {
        const option = new Option(`${cam.name} (${cam.sensor})`, index);
        cameraSelect.add(option);
    });
    objects.forEach((obj, index) => {
        const option = new Option(obj.name, index);
        objectSelect.add(option);
    });

    form.addEventListener('input', drawFov);
    
    // Initial draw
    updateFovInputs();
    drawFov();
}

function updateFovInputs() {
    const fovFocalInput = $('#fov-form').elements.fovFocalLength;
    if (gearSettings.teleFocalLength) {
        fovFocalInput.value = gearSettings.teleFocalLength;
    }
    drawFov();
}

function drawFov() {
    const form = $('#fov-form');
    const focalLength = parseFloat(form.elements.fovFocalLength.value);
    const selectedCamera = cameras[form.elements.fovCamera.value];
    const selectedObject = objects[form.elements.fovObject.value];

    const canvas = $('#fov-canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Calculate FOV in degrees
    const fovWidthDeg = 2 * Math.atan(selectedCamera.width_mm / (2 * focalLength)) * (180 / Math.PI);
    const fovHeightDeg = 2 * Math.atan(selectedCamera.height_mm / (2 * focalLength)) * (180 / Math.PI);

    // Determine scale (pixels per degree)
    const padding = 10;
    const maxDim = Math.max(fovWidthDeg, fovHeightDeg, selectedObject.width_deg, selectedObject.height_deg);
    const scale = (Math.min(width, height) - 2 * padding) / maxDim;

    // Clear and setup canvas
    const styles = getComputedStyle(document.body);
    ctx.fillStyle = styles.getPropertyValue('--bg-color').trim();
    ctx.fillRect(0, 0, width, height);

    // Draw FOV rectangle
    const fovRectWidth = fovWidthDeg * scale;
    const fovRectHeight = fovHeightDeg * scale;
    ctx.strokeStyle = styles.getPropertyValue('--accent-color').trim();
    ctx.lineWidth = 2;
    ctx.strokeRect((width - fovRectWidth) / 2, (height - fovRectHeight) / 2, fovRectWidth, fovRectHeight);

    // Draw Object
    const objWidth = selectedObject.width_deg * scale;
    const objHeight = selectedObject.height_deg * scale;
    ctx.fillStyle = styles.getPropertyValue('--text-secondary-color').trim();
    ctx.globalAlpha = 0.7;
    if (selectedObject.shape === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, objWidth / 2, objHeight / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
    } else { // rectangle (for sun/moon)
        ctx.fillRect((width - objWidth) / 2, (height - objHeight) / 2, objWidth, objHeight);
    }
    ctx.globalAlpha = 1.0;

    // Update info text
    $('#fov-info').innerHTML = `Látómező: ${fovWidthDeg.toFixed(2)}° x ${fovHeightDeg.toFixed(2)}°`;
}
