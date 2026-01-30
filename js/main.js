
import { getUserLocation } from './modules/location.js';
import { getSunData, getMoonData, getNextMoonPhases } from './modules/celestial.js';
import { displayDashboardData, showError, hideLoader } from './modules/ui.js';
import { initCalculators } from './modules/calculators.js';
import { initAstrofotoHelper } from './modules/astrofoto.js';
import { initAnalemma } from './modules/analemma.js';

document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    setupNightMode();
    initCalculators();
    initAstrofotoHelper();

    try {
        const coords = await getUserLocation();
        await loadDashboardData(coords.latitude, coords.longitude);
        
        // Auto-start analemma generation
        const analemmaSection = document.getElementById('analemma');
        if (analemmaSection.classList.contains('active') || !window.location.hash) {
            initAnalemma(coords.latitude, coords.longitude);
        } else {
             document.querySelector('.nav-item[data-target="analemma"]').addEventListener('click', () => {
                initAnalemma(coords.latitude, coords.longitude);
             }, { once: true });
        }

        hideLoader();
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

function setupNightMode() {
    const toggle = document.getElementById('night-mode-toggle');
    const icon = toggle.querySelector('i');

    const applyNightMode = (isNight) => {
        document.body.classList.toggle('night-mode', isNight);
        icon.classList.toggle('ph-moon', !isNight);
        icon.classList.toggle('ph-sun', isNight);
    };

    toggle.addEventListener('click', () => {
        const isNight = !document.body.classList.contains('night-mode');
        localStorage.setItem('nightMode', isNight);
        applyNightMode(isNight);
    });

    // Load saved preference
    const savedMode = localStorage.getItem('nightMode') === 'true';
    applyNightMode(savedMode);
}


async function loadDashboardData(lat, lon) {
    const now = new Date();
    
    const sunData = getSunData(now, lat, lon);
    const moonData = getMoonData(now, lat, lon);
    const nextPhases = getNextMoonPhases(now);
    
    displayDashboardData(sunData, moonData, nextPhases, lat, lon);
}
