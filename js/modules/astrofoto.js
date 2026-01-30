
export function initAstrofotoHelper() {
    const form = document.getElementById('calc-exposure');
    const focalLengthInput = document.getElementById('exp-focal-length');
    const cropFactorSelect = document.getElementById('exp-sensor-crop');
    const resultSpan = document.getElementById('exp-result');

    const calculate = () => {
        const focalLength = parseFloat(focalLengthInput.value);
        const cropFactor = parseFloat(cropFactorSelect.value);
        
        if (focalLength > 0 && cropFactor > 0) {
            const effectiveFocalLength = focalLength * cropFactor;
            const maxExposure = 300 / effectiveFocalLength;
            resultSpan.textContent = `${maxExposure.toFixed(2)} s`;
        }
    };
    
    form.addEventListener('input', calculate);
    calculate();
}
