
import { getUserLocation } from './modules/location.js';
import { getSunData, getMoonData, getNextMoonPhases } from './modules/celestial.js';
import { displayDashboardData, showError, hideLoader } from './modules/ui.js';
import { initCalculators } from './modules/calculators.js';
import { initAstrofotoHelper } from './modules/astrofoto.js';
import { initAnalemma } from './modules/analemma.js';
import { initCalendar } from './modules/calendar.js';

const APP_VERSION = 'v1.3.0';

document.addEventListener('DOMContentLoaded', async () => {
    displayVersion();
    setupNavigation();
    setupNightMode();
    setupAccordions();
    initCalculators();
    initAstrofotoHelper();
    initCalendar();

    try {
        const coords = await getUserLocation();
        await loadDashboardData(coords.latitude, coords.longitude);
        
        document.querySelector('.nav-item[data-target="analemma"]').addEventListener('click', () => {
           initAnalemma(coords.latitude, coords.longitude);
        }, { once: true });

        if(window.location.hash === '#analemma') {
            initAnalemma(coords.latitude, coords.longitude);
        }

        hideLoader();
    } catch (error) {
        showError(error.message);
        hideLoader();
    }
});

function displayVersion() {
    const versionSpan = document.getElementById('app-version');
    if(versionSpan) {
        versionSpan.textContent = `Verzió: ${APP_VERSION}`;
    }
}

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
    
    const currentHash = window.location.hash.substring(1);
    if (currentHash) {
        const targetNavItem = document.querySelector(`.nav-item[data-target="${currentHash}"]`);
        if (targetNavItem) {
            targetNavItem.click();
        }
    } else {
         document.querySelector('.nav-item[data-target="dashboard"]').click();
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

    const savedMode = localStorage.getItem('nightMode') === 'true';
    applyNightMode(savedMode);
}

function setupAccordions() {
    document.addEventListener('click', (e) => {
        const header = e.target.closest('.accordion-header');
        if (!header) return;

        const accordion = header.parentElement;
        const content = header.nextElementSibling;
        const isActive = header.classList.contains('active');

        header.classList.toggle('active', !isActive);
        content.classList.toggle('active', !isActive);

        if (!isActive) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.padding = '1.5rem';
        } else {
            content.style.maxHeight = null;
            content.style.padding = '0 1.5rem';
        }
    });
}

async function loadDashboardData(lat, lon) {
    const now = new Date();
    
    const sunData = getSunData(now, lat, lon);
    const moonData = getMoonData(now, lat, lon);
    const nextPhases = getNextMoonPhases(now);
    
    displayDashboardData(sunData, moonData, nextPhases, lat, lon);
}