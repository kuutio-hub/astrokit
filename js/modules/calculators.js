
import { cameras } from '../data/cameras.js';

const GEAR_STORAGE_KEY = 'astroGearSettings';
let gearSettings = {};

const $ = (selector, parent = document) => parent.querySelector(selector);

// --- Main Initialization ---
export function initCalculators() {
    populateCameraSelect();
    loadGearSettings();
    setupMainGearForm();
    setupFormulaTooltips();
    updateAllCalculations();
}

function populateCameraSelect() {
    const select = $('#cameraSelect');
    if (!select) return;
    cameras.forEach((cam, index) => {
        const option = new Option(cam.name, index);
        select.add(option);
    });
}

// --- Gear Management ---
function loadGearSettings() {
    const saved = localStorage.getItem(GEAR_STORAGE_KEY);
    gearSettings = saved ? JSON.parse(saved) : {
        teleFocalLength: 1000,
        teleAperture: 120,
        eyeFocalLength: 10,
        eyeAFOV: 52,
        cameraIndex: 0 // Default to the first camera in the list
    };
}

function saveGearSettings() {
    localStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(gearSettings));
}

function setupMainGearForm() {
    const form = $('#main-gear-form');
    if (!form) return;

    form.elements.teleFocalLength.value = gearSettings.teleFocalLength;
    form.elements.teleAperture.value = gearSettings.teleAperture;
    form.elements.eyeFocalLength.value = gearSettings.eyeFocalLength;
    form.elements.eyeAFOV.value = gearSettings.eyeAFOV;
    form.elements.cameraSelect.value = gearSettings.cameraIndex;

    form.addEventListener('input', (e) => {
        const name = e.target.name;
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;

        if (name === 'cameraSelect') {
            gearSettings.cameraIndex = parseInt(value, 10);
        } else if (!isNaN(value)) {
            gearSettings[name] = value;
        }

        saveGearSettings();
        updateAllCalculations();
    });
}

// --- UI and Tooltips ---
function setupFormulaTooltips() {
    const tooltip = $('#formula-tooltip');
    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('info-icon')) {
            e.stopPropagation();
            const formula = e.target.dataset.formula;
            tooltip.textContent = formula;
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
            tooltip.style.display = 'block';
            tooltip.style.opacity = '1';
        } else {
            tooltip.style.display = 'none';
            tooltip.style.opacity = '0';
        }
    });
}

// --- Calculation Logic ---
function updateAllCalculations() {
    const selectedCamera = cameras[gearSettings.cameraIndex || 0];
    const pixelSize = selectedCamera.pixel_size;
    const { teleFocalLength, teleAperture, eyeFocalLength, eyeAFOV } = gearSettings;

    const magnification = eyeFocalLength > 0 ? teleFocalLength / eyeFocalLength : 0;
    const focalRatio = teleAperture > 0 ? teleFocalLength / teleAperture : 0;
    const exitPupil = magnification > 0 ? (teleAperture / magnification).toFixed(2) : 0;

    let exitPupilRec = { text: '', class: '' };
    if (exitPupil > 6.5) {
        exitPupilRec = { text: 'Fényveszteség', class: 'rec-bad' };
    } else if (exitPupil > 2) {
        exitPupilRec = { text: 'Ideális mélyégre', class: 'rec-good' };
    } else if (exitPupil > 1) {
        exitPupilRec = { text: 'Ideális bolygókra', class: 'rec-good' };
    } else if (exitPupil > 0) {
        exitPupilRec = { text: 'Nagy nagyítás', class: 'rec-ok' };
    }


    const results = {
        optics: [
            { title: "Nagyítás", value: `${magnification.toFixed(1)}x`, inputs: `TFL: ${teleFocalLength}mm / EFL: ${eyeFocalLength}mm`, formula: "Távcső Fókusz / Okulár Fókusz",
              description: "Megmutatja, hányszor nagyobbnak látjuk az objektumot a távcsővel, mint szabad szemmel." },
            { title: "Kilépő Pupilla", value: `${exitPupil} mm`, inputs: `Átmérő: ${teleAperture}mm / Nagyítás: ${magnification.toFixed(1)}x`, formula: "Távcső Átmérő / Nagyítás",
              description: "A távcsőből kilépő fénynyaláb átmérője. Ideális, ha ez az érték közel esik a sötéthez szokott szemünk pupillájának méretéhez (kb. 5-7mm).", recommendation: exitPupilRec },
            { title: "Valós Látómező", value: `${magnification > 0 ? (eyeAFOV / magnification).toFixed(2) : 0}°`, inputs: `Okulár LM: ${eyeAFOV}° / Nagyítás: ${magnification.toFixed(1)}x`, formula: "Okulár Látszólagos LM / Nagyítás",
              description: "Az égboltnak az a valós darabja (fokokban), amit az okulárba nézve egyszerre látunk." },
            { title: "F-arány (Fényerő)", value: `f/${focalRatio.toFixed(1)}`, inputs: `TFL: ${teleFocalLength}mm / Átmérő: ${teleAperture}mm`, formula: "Fókusztávolság / Átmérő",
              description: "A távcső 'sebessége'. Kisebb érték (pl. f/5) 'gyorsabb' távcsövet jelent, ami rövidebb expozíciós időt igényel fotózásnál, és nagyobb látómezőt ad vizuálisan." }
        ],
        resolution: [
            { title: "Minimális nagyítás", value: `${teleAperture > 0 ? (teleAperture / 7).toFixed(0) : 0}x`, inputs: `Átmérő: ${teleAperture}mm`, formula: "Távcső Átmérő (mm) / 7",
              description: "Az a legkisebb nagyítás, ahol a távcső teljes átmérőjét kihasználjuk anélkül, hogy a kilépő pupilla nagyobb lenne a szem pupillájánál. Ideális nagy kiterjedésű objektumokhoz." },
            { title: "Gyakorlati max. nagyítás", value: `${teleAperture > 0 ? Math.min(350, teleAperture * 2).toFixed(0) : 0}x`, inputs: `Átmérő: ${teleAperture}mm`, formula: "2 × Átmérő (mm) [Max ~350x]",
              description: "Az a nagyítás, ami felett a kép már nem lesz élesebb, csak homályosabb a légköri viszonyok és az optika korlátai miatt." },
            { title: "Dawes-határ", value: `${teleAperture > 0 ? (116 / teleAperture).toFixed(2) : 0}"`, inputs: `Átmérő: ${teleAperture}mm`, formula: "116 / Távcső Átmérő (mm)",
              description: "A távcső elméleti felbontóképessége ívmásodpercben, vagyis az a legkisebb távolság, amire két közeli csillagnak lennie kell, hogy különállónak lássuk őket." },
            { title: "Határmagnitúdó", value: `${teleAperture > 0 ? (7.7 + (5 * Math.log10(teleAperture / 10))).toFixed(2) : 0}m`, inputs: `Átmérő: ${teleAperture}mm`, formula: "7.7 + (5 × Log10(Átmérő cm))",
              description: "A leghalványabb csillagok fényessége (magnitúdóban), amit ideális körülmények között még éppen megpillanthatunk a távcsővel." }
        ],
        ccd: [
             { title: "Kamera felbontása", value: `${teleFocalLength > 0 ? ((pixelSize / teleFocalLength) * 206.265).toFixed(2) : 0} "/px`, inputs: `Pixel: ${pixelSize}μm / TFL: ${teleFocalLength}mm`, formula: "(Képpontméret / Fókusz) × 206.265",
               description: "Megmutatja, hogy az égbolt mekkora darabja esik a kamera egyetlen pixelére. Ez határozza meg a fotó részletességét." }
        ]
    };

    renderResults('results-optics', results.optics);
    renderResults('results-resolution', results.resolution);
    renderResults('results-ccd', results.ccd);

    document.dispatchEvent(new CustomEvent('gearUpdated', { detail: { ...gearSettings, pixelSize } }));
}

function renderResults(containerId, resultsArray) {
    const container = $(`#${containerId}`);
    if (!container) return;
    container.innerHTML = resultsArray.map(r => `
        <li>
            <div class="result-title">
                ${r.title}
                <i class="ph-info-fill info-icon" data-formula="${r.formula}"></i>
            </div>
            <span class="result-value">${r.value}</span>
            <span class="result-inputs">${r.inputs}</span>
            ${r.recommendation && r.recommendation.text ? `<div class="result-recommendation ${r.recommendation.class}">${r.recommendation.text}</div>` : ''}
            ${r.description ? `<p class="result-desc">${r.description}</p>` : ''}
        </li>
    `).join('');
}