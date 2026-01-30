
const GEAR_STORAGE_KEY = 'astroGearSettings';
let gearSettings = {};

// --- Helper Functions ---
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => parent.querySelectorAll(selector);
const degToRad = (deg) => deg * Math.PI / 180;
const radToDeg = (rad) => rad * 180 / Math.PI;

// --- Main Initialization ---
export function initCalculators() {
    loadGearSettings();
    setupMainGearForm();
    setupCalculatorNavigation();
    setupFormulaTooltips();

    // Initialize all individual calculators
    initAllCalculatorLogic();

    syncAllCalculators();
}

// --- Gear Management ---
function loadGearSettings() {
    const saved = localStorage.getItem(GEAR_STORAGE_KEY);
    gearSettings = saved ? JSON.parse(saved) : {
        teleFocalLength: 1000,
        teleAperture: 120,
        eyeFocalLength: 10,
        eyeAFOV: 52
    };
}

function saveGearSettings() {
    localStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(gearSettings));
}

function setupMainGearForm() {
    const form = $('#main-gear-form');
    if (!form) return;

    // Populate form from loaded settings
    for (const key in gearSettings) {
        if (form.elements[key]) {
            form.elements[key].value = gearSettings[key];
        }
    }

    form.addEventListener('input', (e) => {
        const key = e.target.name;
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            gearSettings[key] = value;
            saveGearSettings();
            syncAllCalculators();
        }
    });
}

function syncAllCalculators() {
    $$('.calculator-card form').forEach(form => {
        for (const key in gearSettings) {
            if (form.elements[key]) {
                form.elements[key].value = gearSettings[key];
            }
        }
        // Trigger calculation after sync
        form.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

// --- UI and Navigation ---
function setupCalculatorNavigation() {
    const links = $$('.calc-nav-link');
    const cards = $$('.calculator-card');

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            links.forEach(l => l.classList.remove('active'));
            cards.forEach(c => c.classList.remove('active'));

            link.classList.add('active');
            $(`#${targetId}`).classList.add('active');
        });
    });
}

function setupFormulaTooltips() {
    const tooltip = $('#formula-tooltip');
    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('info-icon')) {
            const formula = e.target.dataset.formula;
            tooltip.textContent = formula;

            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
            tooltip.style.display = 'block';
        } else {
            tooltip.style.display = 'none';
        }
    });
}

// --- Individual Calculator Logic ---
function initAllCalculatorLogic() {
    // Telescope
    setupCalc('magnification', ['teleFocalLength', 'eyeFocalLength'], vals => vals.eyeFocalLength > 0 ? vals.teleFocalLength / vals.eyeFocalLength : 0, 1);
    setupCalc('focal-ratio', ['teleFocalLength', 'teleAperture'], vals => vals.teleAperture > 0 ? vals.teleFocalLength / vals.teleAperture : 0, 1);
    setupCalc('focal-length', ['teleAperture', 'focalRatio'], vals => vals.teleAperture * vals.focalRatio, 1);
    setupCalc('eyepiece-magnification', ['teleFocalLength', 'magnification'], vals => vals.magnification > 0 ? vals.teleFocalLength / vals.magnification : 0, 1);
    setupCalc('max-magnification', ['teleAperture'], vals => Math.min(350, vals.teleAperture * 2.5), 0);
    setupCalc('dawes-limit', ['teleAperture'], vals => vals.teleAperture > 0 ? 116 / vals.teleAperture : 0, 2);
    setupCalc('rayleigh-limit', ['teleAperture'], vals => vals.teleAperture > 0 ? 138 / vals.teleAperture : 0, 2);
    setupCalc('limiting-magnitude', ['teleAperture'], vals => vals.teleAperture > 0 ? 7.7 + (5 * Math.log10(vals.teleAperture / 10)) : 0, 2);
    setupCalc('light-grasp', ['aperture1', 'aperture2'], vals => vals.aperture2 > 0 ? Math.pow(vals.aperture1, 2) / Math.pow(vals.aperture2, 2) : 0, 0);

    // This one is special, needs to be calculated from magnification
    const trueFovForm = $('#form-true-fov');
    trueFovForm.addEventListener('input', () => {
        const eyeAFOV = parseFloat(trueFovForm.elements.eyeAFOV.value) || 0;
        const mag = parseFloat(trueFovForm.elements.magnification.value) || 0;
        $('#res-true-fov').textContent = mag > 0 ? (eyeAFOV / mag).toFixed(2) : 'N/A';
    });
    // Link magnification to main gear magnification
    const magInput = $('#form-magnification input[name=teleFocalLength]');
    magInput.addEventListener('input', () => { // Bit of a hack to get notification
        const mag = parseFloat($('#res-magnification').textContent) || 0;
        trueFovForm.elements.magnification.value = mag.toFixed(1);
        trueFovForm.dispatchEvent(new Event('input'));
    });
    

    // Binocular
    setupCalc('bino-real-fov-deg', ['fov_deg'], vals => Math.tan(degToRad(vals.fov_deg)) * 1000, 1);
    setupCalc('bino-real-fov-m', ['fov_m'], vals => radToDeg(Math.atan(vals.fov_m / 1000)), 2);
    setupCalc('bino-apparent-fov-simple', ['real_fov', 'magnification'], vals => vals.real_fov * vals.magnification, 2);
    setupCalc('bino-apparent-fov-iso', ['real_fov', 'magnification'], vals => {
        return 2 * radToDeg(Math.atan(vals.magnification * Math.tan(degToRad(vals.real_fov / 2))));
    }, 2);
    
    // CCD
    setupCalc('ccd-resolution', ['pixelSize', 'teleFocalLength'], vals => vals.teleFocalLength > 0 ? (vals.pixelSize / vals.teleFocalLength) * 206.265 : 0, 2);
    setupCalc('ccd-pixel-size', ['chipSize', 'resolution'], vals => vals.resolution > 0 ? (vals.chipSize / vals.resolution) * 1000 : 0, 2);
    setupCalc('ccd-chip-size', ['pixelSize', 'resolution'], vals => (vals.pixelSize * vals.resolution) / 1000, 2);
    setupCalc('dust-reflection', ['pixelSize', 'focalRatio', 'shadow_px'], vals => (vals.pixelSize / 1000) * vals.focalRatio * vals.shadow_px, 3);
    
    // Converter
    const inMmForm = $('#form-in-mm');
    const inchesInput = inMmForm.elements.inches;
    const mmInput = inMmForm.elements.mm;
    inchesInput.addEventListener('input', () => {
       const inches = parseFloat(inchesInput.value);
       if (!isNaN(inches)) mmInput.value = (inches * 25.4).toFixed(2);
    });
    mmInput.addEventListener('input', () => {
       const mm = parseFloat(mmInput.value);
       if (!isNaN(mm)) inchesInput.value = (mm / 25.4).toFixed(3);
    });
}

/**
 * Generic function to set up a calculator.
 * @param {string} id - The base ID for the calculator (e.g., 'magnification').
 * @param {string[]} inputNames - An array of input names from the form.
 * @param {function} formula - The calculation function.
 * @param {number} precision - Number of decimal places for the result.
 */
function setupCalc(id, inputNames, formula, precision) {
    const form = $(`#form-${id}`);
    const resultEl = $(`#res-${id}`);

    form.addEventListener('input', () => {
        const values = {};
        let allValid = true;
        inputNames.forEach(name => {
            const val = parseFloat(form.elements[name].value);
            if (isNaN(val)) allValid = false;
            values[name] = val;
        });

        if (allValid) {
            const result = formula(values);
            resultEl.textContent = result.toFixed(precision);
        } else {
            resultEl.textContent = 'N/A';
        }
    });
}
