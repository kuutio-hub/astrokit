
import { getUserLocation } from './modules/location.js';
import { getSunData, getMoonData, getNextMoonPhases } from './modules/celestial.js';
import { displayDashboardData, showError, hideLoader } from './modules/ui.js';
import { initCalculators } from './modules/calculators.js';
import { initAstrofotoHelper } from './modules/astrofoto.js';
import { initAnalemma } from './modules/analemma.js';
import { initCalendar } from './modules/calendar.js';
import { initWiki } from './modules/wiki.js';
import { initPolarAlign, stopPolarAlignAnimation } from './modules/polar_align.js';

const APP_VERSION = 'v0.9.0';

document.addEventListener('DOMContentLoaded', async () => {
    displayVersion();
    setupNavigation();
    setupNightMode();
    setupAccordions();
    setupInfoTooltips();
    initCalculators();
    initAstrofotoHelper();
    initCalendar();
    initWiki();

    try {
        const coords = await getUserLocation();
        await loadDashboardData(coords.latitude, coords.longitude);
        
        document.querySelector('.nav-item[data-target="analemma"]').addEventListener('click', () => {
           initAnalemma(coords.latitude, coords.longitude);
        }, { once: true });

        document.querySelector('.nav-item[data-target="polar-align"]').addEventListener('click', () => {
           initPolarAlign(coords.latitude, coords.longitude);
        });

        if(window.location.hash === '#analemma') {
            initAnalemma(coords.latitude, coords.longitude);
        }
        if(window.location.hash === '#polar-align') {
            initPolarAlign(coords.latitude, coords.longitude);
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
    const desktopNavItems = document.querySelectorAll('.desktop-nav .nav-item');
    const mobileNavItems = document.querySelectorAll('.mobile-menu-overlay .mobile-nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    const activateTab = (targetId) => {
        stopPolarAlignAnimation();

        contentSections.forEach(s => s.classList.remove('active'));
        const activeSection = document.getElementById(targetId);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        desktopNavItems.forEach(i => i.classList.toggle('active', i.dataset.target === targetId));
        
        window.location.hash = targetId;

        // Close mobile menu
        mobileMenu.classList.remove('active');
        menuToggle.querySelector('i').className = 'ph ph-list';
    };

    desktopNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab(item.dataset.target);
        });
    });

    mobileNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab(item.dataset.target);
        });
    });

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        icon.className = mobileMenu.classList.contains('active') ? 'ph ph-x' : 'ph ph-list';
    });

    const currentHash = window.location.hash.substring(1) || 'dashboard';
    activateTab(currentHash);
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

        if(header.closest('#wiki-container')) return;

        const accordion = header.parentElement;
        const content = header.nextElementSibling;
        const isActive = header.classList.contains('active');
        
        header.classList.toggle('active', !isActive);
        content.classList.toggle('active', !isActive);

        if (!isActive) {
            content.style.maxHeight = content.scrollHeight + 'px';
            if (header.closest('#calculators .sticky-container')) {
                 content.style.padding = '1.5rem';
            }
        } else {
            content.style.maxHeight = null;
            if (header.closest('#calculators .sticky-container')) {
                 content.style.padding = '0 1.5rem';
            }
        }
    });
}

function setupInfoTooltips() {
    const tooltip = document.getElementById('info-tooltip');
    let currentIcon = null;

    document.body.addEventListener('click', e => {
        const icon = e.target.closest('.info-icon');
        
        if (icon && icon === currentIcon) {
            tooltip.style.opacity = '0';
            tooltip.style.display = 'none';
            currentIcon = null;
            return;
        }

        if (icon) {
            e.stopPropagation();
            const description = icon.dataset.description;
            if (description) {
                tooltip.innerHTML = description;
                const rect = icon.getBoundingClientRect();
                tooltip.style.display = 'block';
                tooltip.style.left = `${rect.left}px`;
                tooltip.style.top = `${rect.bottom + 8}px`;
                tooltip.style.opacity = '1';
                currentIcon = icon;
            }
        } else { 
            tooltip.style.opacity = '0';
            tooltip.style.display = 'none';
            currentIcon = null;
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
