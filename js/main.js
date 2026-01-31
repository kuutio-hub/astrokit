
import { getUserLocation } from './modules/location.js';
import { getSunData, getMoonData, getNextMoonPhases } from './modules/celestial.js';
import { displayDashboardData, showError, hideLoader } from './modules/ui.js';
import { initCalculators } from './modules/calculators.js';
import { initAstrofotoHelper } from './modules/astrofoto.js';
import { initAnalemma } from './modules/analemma.js';
import { initMoonCalendar } from './modules/moon_calendar.js';
import { initWiki } from './modules/wiki.js';
import { initPolarAlign, stopPolarAlignAnimation } from './modules/polar_align.js';
import { initPlanner } from './modules/planner.js';

const APP_VERSION = 'v0.9.9.8';

document.addEventListener('DOMContentLoaded', async () => {
    displayVersion();
    setupNavigation();
    setupNightMode();
    setupAccordions();
    setupInfoTooltips();
    setupModal();
    initCalculators();
    initAstrofotoHelper();
    initWiki();

    try {
        const coords = await getUserLocation();
        await loadDashboardData(coords.latitude, coords.longitude);
        
        const lazyLoadModules = [
            { target: 'planner', init: () => initPlanner(coords.latitude, coords.longitude) },
            { target: 'analemma', init: () => initAnalemma(coords.latitude, coords.longitude) },
            { target: 'polar-align', init: () => initPolarAlign(coords.latitude, coords.longitude) },
            { target: 'moon-calendar', init: () => initMoonCalendar() }
        ];

        lazyLoadModules.forEach(module => {
            const navButton = document.querySelector(`.nav-item[data-target="${module.target}"]`);
            if (navButton) {
                navButton.addEventListener('click', module.init, { once: true });
            }
            if (window.location.hash === `#${module.target}`) {
                module.init();
            }
        });

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
    const allNavItems = document.querySelectorAll('[data-target]');
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

        document.querySelectorAll('.desktop-nav .nav-item').forEach(i => i.classList.toggle('active', i.dataset.target === targetId));
        
        window.location.hash = targetId;

        mobileMenu.classList.remove('active');
        menuToggle.querySelector('i').className = 'ph ph-list';
    };

    allNavItems.forEach(item => {
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

function setupModal() {
    const modal = document.getElementById('app-modal');
    const closeBtn = document.getElementById('modal-close');
    
    const closeModal = () => {
        modal.style.display = 'none';
        document.getElementById('modal-body').innerHTML = ''; // Clear content
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
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
