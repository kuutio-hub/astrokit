
import { updateMoonVisual, moonImageLoaded } from './ui.js';

let currentDate = new Date();
const $ = (id) => document.getElementById(id);

export function initMoonCalendar() {
    setupEventListeners();
    renderCalendar();
}

function setupEventListeners() {
    $('mc-prev-month').addEventListener('click', () => changeMonth(-1));
    $('mc-next-month').addEventListener('click', () => changeMonth(1));
    $('mc-prev-year').addEventListener('click', () => changeYear(-1));
    $('mc-next-year').addEventListener('click', () => changeYear(1));
    $('mc-print').addEventListener('click', printCalendar);
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function changeYear(delta) {
    currentDate.setFullYear(currentDate.getFullYear() + delta);
    renderCalendar();
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    $('mc-month-year').textContent = `${year}. ${currentDate.toLocaleDateString('hu-HU', { month: 'long' })}`;

    const grid = $('mc-grid');
    grid.innerHTML = ''; // Clear previous grid

    const dayNames = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
    dayNames.forEach(day => {
        const dayNameDiv = document.createElement('div');
        dayNameDiv.className = 'mc-day-name';
        dayNameDiv.textContent = day;
        grid.appendChild(dayNameDiv);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Adjust for week starting on Monday

    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'mc-day other-month';
        grid.appendChild(emptyDiv);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'mc-day';
        dayDiv.innerHTML = `
            <div class="mc-day-header">${day}</div>
            <div class="mc-phase-container">
                <canvas width="80" height="80" data-day="${day}"></canvas>
            </div>`;
        grid.appendChild(dayDiv);
    }
    
    // Asynchronously draw moon phases after the grid is rendered
    setTimeout(drawAllMoonPhases, 0);
}

function drawAllMoonPhases() {
    const canvases = document.querySelectorAll('#mc-grid canvas');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const drawFn = () => {
        canvases.forEach(canvas => {
            const day = parseInt(canvas.dataset.day, 10);
            if (!isNaN(day)) {
                const date = new Date(year, month, day, 12, 0, 0); // Use noon for average phase
                const illumination = SunCalc.getMoonIllumination(date);
                updateMoonVisual(canvas, illumination);
            }
        });
    };
    
    if (moonImageLoaded) {
        drawFn();
    } else {
        // Fallback if image is still loading
        const interval = setInterval(() => {
            if (moonImageLoaded) {
                clearInterval(interval);
                drawFn();
            }
        }, 100);
    }
}

function printCalendar() {
    const printTitle = document.createElement('h2');
    printTitle.id = 'mc-month-year-print';
    printTitle.textContent = $('mc-month-year').textContent;
    
    const calendarSection = $('moon-calendar');
    calendarSection.prepend(printTitle);
    
    document.body.classList.add('printable');
    window.print();
    
    // Cleanup after print dialog is closed
    setTimeout(() => {
        document.body.classList.remove('printable');
        printTitle.remove();
    }, 500);
}
