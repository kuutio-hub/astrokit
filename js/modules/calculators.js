
export function initCalculators() {
    setupMagnificationCalculator();
    setupFovCalculator();
    setupExitPupilCalculator();
    setupResolutionCalculator();
    setupMaxUsefulMagnificationCalculator();
    syncApertureInputs();
}

function syncApertureInputs() {
    const apertureInputs = document.querySelectorAll('.aperture-input');
    let isSyncing = false;

    apertureInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            if (isSyncing) return; // Prevent event loops

            isSyncing = true;
            const value = e.target.value;
            apertureInputs.forEach(otherInput => {
                if (otherInput !== e.target) {
                    otherInput.value = value;
                    // Dispatch event to trigger recalculation in other cards
                    otherInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            // A 'setTimeout' ensures the flag is reset after the current event stack is cleared
            setTimeout(() => { isSyncing = false; }, 0);
        });
    });
}


function setupMagnificationCalculator() {
    const form = document.getElementById('calc-magnification');
    const fTeleInput = document.getElementById('mag-f-tele');
    const fEyeInput = document.getElementById('mag-f-eye');
    const resultSpan = document.getElementById('mag-result');

    const calculate = () => {
        const fTele = parseFloat(fTeleInput.value);
        const fEye = parseFloat(fEyeInput.value);
        if (fTele > 0 && fEye > 0) {
            const magnification = fTele / fEye;
            resultSpan.textContent = `${magnification.toFixed(1)}x`;
            // Update other calculators that depend on magnification
            const fovMagInput = document.getElementById('fov-mag');
            const epMagInput = document.getElementById('ep-mag');
            if (fovMagInput) fovMagInput.value = magnification.toFixed(1);
            if (epMagInput) epMagInput.value = magnification.toFixed(1);
            if (fovMagInput) fovMagInput.dispatchEvent(new Event('input'));
            if (epMagInput) epMagInput.dispatchEvent(new Event('input'));
        }
    };

    form.addEventListener('input', calculate);
    calculate();
}

function setupFovCalculator() {
    const form = document.getElementById('calc-fov');
    const afovInput = document.getElementById('fov-afov');
    const magInput = document.getElementById('fov-mag');
    const resultSpan = document.getElementById('fov-result');

    const calculate = () => {
        const afov = parseFloat(afovInput.value);
        const mag = parseFloat(magInput.value);
        if (afov > 0 && mag > 0) {
            const fov = afov / mag;
            resultSpan.textContent = `${fov.toFixed(2)}°`;
        }
    };

    form.addEventListener('input', calculate);
    calculate();
}

function setupExitPupilCalculator() {
    const form = document.getElementById('calc-exit-pupil');
    const apertureInput = document.getElementById('ep-aperture');
    const magInput = document.getElementById('ep-mag');
    const resultSpan = document.getElementById('ep-result');

    const calculate = () => {
        const aperture = parseFloat(apertureInput.value);
        const mag = parseFloat(magInput.value);
        if (aperture > 0 && mag > 0) {
            const exitPupil = aperture / mag;
            resultSpan.textContent = `${exitPupil.toFixed(2)} mm`;
        }
    };

    form.addEventListener('input', calculate);
    calculate();
}

function setupResolutionCalculator() {
    const form = document.getElementById('calc-resolution');
    const apertureInput = document.getElementById('res-aperture');
    const resultSpan = document.getElementById('res-result');

    const calculate = () => {
        const aperture = parseFloat(apertureInput.value);
        if (aperture > 0) {
            const resolution = 116 / aperture; // Dawes' limit in arcseconds
            resultSpan.textContent = `${resolution.toFixed(2)}"`;
        }
    };

    form.addEventListener('input', calculate);
    calculate();
}

function setupMaxUsefulMagnificationCalculator() {
    const form = document.getElementById('calc-max-mag');
    const apertureInput = document.getElementById('max-mag-aperture');
    const resultSpan = document.getElementById('max-mag-result');

    const calculate = () => {
        const aperture = parseFloat(apertureInput.value);
        if (aperture > 0) {
            const maxMag = aperture * 2;
            resultSpan.textContent = `${maxMag.toFixed(0)}x`;
        }
    };

    form.addEventListener('input', calculate);
    calculate();
}
