
import { cameras } from '../data/cameras.js';
import { isoRecommendations } from '../data/iso_recommendations.js';

const $ = (selector) => document.querySelector(selector);
let currentGear = {};

export function initAstrofotoHelper() {
    setupEventListeners();
    
    document.addEventListener('gearUpdated', (e) => {
        currentGear = e.detail;
        updateAstrofotoCalculations();
    });

    // Initial calculation
    setTimeout(() => {
        const cameraIndex = $('#cameraSelect').value || 0;
        if (!cameras[cameraIndex]) return;
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
    
    if (!currentGear || !currentGear.pixelSize) return;
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
}
