
import { getUserLocation } from './modules/location.js';
import { getSunData, getMoonData, getNextMoonPhases } from './modules/celestial.js';
import { displayDashboardData, showError, hideLoader } from './modules/ui.js';
import { initCalculators } from './modules/calculators.js';
import { initAstrofotoHelper } from './modules/astrofoto.js';
import { initAnalemma } from './modules/analemma.js';
import { initCalendar } from './modules/calendar.js';
import { initWiki } from './modules/wiki.js';

const APP_VERSION = 'v0.6.0';

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
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');

    const activateTab = (targetId) => {
        navItems.forEach(i => i.classList.remove('active'));
        contentSections.forEach(s => s.classList.remove('active'));

        const activeItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if(activeItem) activeItem.classList.add('active');
        
        document.getElementById(targetId)?.classList.add('active');
        window.location.hash = targetId;

        // Close mobile menu on navigation
        nav.classList.remove('active');
        menuToggle.querySelector('i').className = 'ph ph-list';
    };
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            activateTab(targetId);
        });
    });

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.className = 'ph ph-x';
        } else {
            icon.className = 'ph ph-list';
        }
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
        
        // Don't close others in calculators
        if(!header.closest('#calculators .sticky-container')) {
            const allActiveHeaders = document.querySelectorAll('.accordion-header.active');
            allActiveHeaders.forEach(h => {
                if(h !== header) {
                    h.classList.remove('active');
                    const c = h.nextElementSibling;
                    c.classList.remove('active');
                    c.style.maxHeight = null;
                    c.style.padding = '0 1.5rem';
                }
            });
        }

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

function setupInfoTooltips() {
    const tooltip = document.getElementById('info-tooltip');
    let currentIcon = null;

    document.body.addEventListener('click', e => {
        const icon = e.target.closest('.info-icon');
        
        // If clicking the same icon, hide it
        if (icon && icon === currentIcon) {
            tooltip.style.opacity = '0';
            tooltip.style.display = 'none';
            currentIcon = null;
            return;
        }

        // If clicking another icon, show its tooltip
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
        } else { // If clicking anywhere else, hide the tooltip
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