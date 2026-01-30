
export function initAstrofotoHelper() {
    const form = document.getElementById('calc-exposure');
    if (!form) return;
    
    const focalLengthInput = document.getElementById('exp-focal-length');
    const cropFactorSelect = document.getElementById('exp-sensor-crop');
    const ruleSelect = document.getElementById('exp-rule');
    const resultSpan = document.getElementById('exp-result');

    const calculate = () => {
        const focalLength = parseFloat(focalLengthInput.value);
        const cropFactor = parseFloat(cropFactorSelect.value);
        const rule = parseInt(ruleSelect.value, 10);
        
        if (focalLength > 0 && cropFactor > 0 && rule > 0) {
            const effectiveFocalLength = focalLength * cropFactor;
            const maxExposure = rule / effectiveFocalLength;
            resultSpan.textContent = `${maxExposure.toFixed(2)} s`;
        }
    };
    
    form.addEventListener('input', calculate);
    calculate();
}
