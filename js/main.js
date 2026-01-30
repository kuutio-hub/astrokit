
import { getUserLocation } from './modules/location.js';
import { getSunData, getMoonData, getNextMoonPhases } from './modules/celestial.js';
import { displayDashboardData, showError, hideLoader } from './modules/ui.js';
import { initCalculators } from './modules/calculators.js';
import { initAstrofotoHelper } from './modules/astrofoto.js';
import { initAnalemma } from './modules/analemma.js';

let userCoords = null;

document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    initCalculators();
    initAstrofotoHelper();

    try {
        const coords = await getUserLocation();
        userCoords = coords;
        await loadDashboardData(coords.latitude, coords.longitude);
        hideLoader();
        document.getElementById('draw-analemma-btn').addEventListener('click', () => {
             if (userCoords) {
                initAnalemma(userCoords.latitude, userCoords.longitude);
            }
        });
    } catch (error) {
        showError(error.message);
        hideLoader();
    }
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            navItems.forEach(i => i.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));

            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            window.location.hash = targetId;
        });
    });
    
    // Check hash on load
    const currentHash = window.location.hash.substring(1);
    const targetNavItem = document.querySelector(`.nav-item[data-target="${currentHash}"]`);
    if (targetNavItem) {
        targetNavItem.click();
    }
}

async function loadDashboardData(lat, lon) {
    const now = new Date();
    
    const sunData = getSunData(now, lat, lon);
    const moonData = getMoonData(now, lat, lon);
    const nextPhases = getNextMoonPhases(now);
    
    displayDashboardData(sunData, moonData, nextPhases, lat, lon);
}
