
import { updateMoonVisual, executeWhenImageLoaded } from './ui.js';
import { events } from '../data/events.js';

let currentDate = new Date();
const $ = (id) => document.getElementById(id);
let calendarNotes = {};

const filterState = {
    showDailyMoonPhase: true,
    showMajorMoonPhase: true,
    showMeteorShowers: true,
};

function getPhaseName(key, short = false) {
    const names = {
        newMoon: { long: 'Újhold', short: 'ÚH' },
        firstQuarter: { long: 'Első negyed', short: 'EN' },
        fullMoon: { long: 'Telihold', short: 'TH' },
        lastQuarter: { long: 'Utolsó negyed', short: 'UN' },
    };
    return names[key] ? (short ? names[key].short : names[key].long) : '';
}

function calculateMajorPhasesForMonth(year, month) {
    const phases = [];
    let date = new Date(year, month, 1);
    let lastPhase = SunCalc.getMoonIllumination(date).phase;

    for (let i = 0; i < 31 * 24; i++) {
        date.setHours(date.getHours() + 1);
        if (date.getMonth() !== month) break;

        const currentPhase = SunCalc.getMoonIllumination(date).phase;

        if (lastPhase > 0.98 && currentPhase < 0.02) phases.push({ date: new Date(date), name: getPhaseName('newMoon') });
        if (lastPhase < 0.25 && currentPhase >= 0.25) phases.push({ date: new Date(date), name: getPhaseName('firstQuarter') });
        if (lastPhase < 0.5 && currentPhase >= 0.5) phases.push({ date: new Date(date), name: getPhaseName('fullMoon') });
        if (lastPhase < 0.75 && currentPhase >= 0.75) phases.push({ date: new Date(date), name: getPhaseName('lastQuarter') });
        
        lastPhase = currentPhase;
    }
    return phases;
}

export function initMoonCalendar() {
    loadNotes();
    populateFilters();
    setupEventListeners();
    renderCalendar();
}

function loadNotes() {
    calendarNotes = JSON.parse(localStorage.getItem('calendarNotes')) || {};
}

function saveNotes() {
    localStorage.setItem('calendarNotes', JSON.stringify(calendarNotes));
}

function populateFilters() {
    const container = $('moon-calendar-filters');
    container.innerHTML = `
        <div class="filter-group">
            <strong>Mutatott események:</strong>
            <label><input type="checkbox" data-filter="showDailyMoonPhase" ${filterState.showDailyMoonPhase ? 'checked' : ''}> Napi holdfázis (ábra)</label>
            <label><input type="checkbox" data-filter="showMajorMoonPhase" ${filterState.showMajorMoonPhase ? 'checked' : ''}> Fő holdfázisok (szöveg)</label>
            <label><input type="checkbox" data-filter="showMeteorShowers" ${filterState.showMeteorShowers ? 'checked' : ''}> Meteorrajok és ünnepek</label>
        </div>
    `;
}

function setupEventListeners() {
    $('mc-prev-month').addEventListener('click', () => changeMonth(-1));
    $('mc-next-month').addEventListener('click', () => changeMonth(1));
    $('mc-prev-year').addEventListener('click', () => changeYear(-1));
    $('mc-next-year').addEventListener('click', () => changeYear(1));
    $('mc-print').addEventListener('click', printCalendar);
    
    $('moon-calendar-filters').addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            filterState[e.target.dataset.filter] = e.target.checked;
            renderCalendar();
        }
    });

    $('mc-grid').addEventListener('click', (e) => {
        const dayCell = e.target.closest('.mc-day:not(.other-month)');
        if (dayCell) {
            const date = dayCell.dataset.date;
            openNotesModal(date);
        }
    });
}

function changeMonth(delta) {
    currentDate.setDate(1); // Avoid month skipping issues
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
    grid.innerHTML = ''; 

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
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    for (let i = 0; i < startDayOfWeek; i++) {
        grid.insertAdjacentHTML('beforeend', '<div class="mc-day other-month"></div>');
    }
    
    const majorPhases = calculateMajorPhasesForMonth(year, month);

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        
        let dayHTML = `
            <div class="mc-day" data-date="${dateString}">
                ${calendarNotes[dateString] ? `<i class="ph-note-pencil mc-note-indicator" title="Személyes jegyzet"></i>` : ''}
                <div class="mc-day-header">${day}</div>
        `;
        
        let eventsHTML = '<ul class="mc-events">';

        if (filterState.showMajorMoonPhase) {
            majorPhases.forEach(phase => {
                if (phase.date.getDate() === day) {
                    eventsHTML += `<li class="mc-event-item mc-event-moon">${phase.name}</li>`;
                }
            });
        }
        
        if (filterState.showMeteorShowers) {
            events.forEach(event => {
                const start = new Date(event.start);
                const end = new Date(event.end);
                start.setHours(0,0,0,0);
                end.setHours(23,59,59,999);
                if (date >= start && date <= end) {
                    eventsHTML += `<li class="mc-event-item mc-event-${event.type}">${event.title}</li>`;
                }
            });
        }
        eventsHTML += '</ul>';

        if (filterState.showDailyMoonPhase) {
            dayHTML += `<div class="mc-phase-container">
                            <canvas width="80" height="80" data-day="${day}"></canvas>
                        </div>`;
        }
        
        dayHTML += eventsHTML;
        dayHTML += '</div>';
        grid.insertAdjacentHTML('beforeend', dayHTML);
    }
    
    executeWhenImageLoaded(drawAllMoonPhases);
}

function drawAllMoonPhases() {
    if (!filterState.showDailyMoonPhase) return;

    const canvases = document.querySelectorAll('#mc-grid canvas');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    canvases.forEach(canvas => {
        const day = parseInt(canvas.dataset.day, 10);
        if (!isNaN(day)) {
            const date = new Date(year, month, day, 12, 0, 0);
            const illumination = SunCalc.getMoonIllumination(date);
            updateMoonVisual(canvas, illumination);
        }
    });
}

function openNotesModal(dateString) {
    const date = new Date(dateString);
    const modal = document.getElementById('app-modal');
    const modalBody = document.getElementById('modal-body');
    const note = calendarNotes[dateString] || '';

    modalBody.innerHTML = `
        <h3>Jegyzet - ${date.toLocaleDateString('hu-HU')}</h3>
        <p>Írj bejegyzést ehhez a naphoz. A mentés a böngésződben történik.</p>
        <textarea id="modal-note-text">${note}</textarea>
        <div class="modal-actions">
            <button id="modal-note-save">Mentés</button>
        </div>
    `;
    modal.style.display = 'flex';

    $('#modal-note-save').addEventListener('click', () => {
        const newNote = $('#modal-note-text').value;
        if (newNote) {
            calendarNotes[dateString] = newNote;
        } else {
            delete calendarNotes[dateString];
        }
        saveNotes();
        modal.style.display = 'none';
        renderCalendar();
    });
}

function printCalendar() {
    const printTitle = document.createElement('h2');
    printTitle.id = 'mc-month-year-print';
    printTitle.textContent = $('mc-month-year').textContent;
    
    const calendarSection = $('moon-calendar');
    calendarSection.prepend(printTitle);
    
    document.body.classList.add('printable');
    window.print();
    
    setTimeout(() => {
        document.body.classList.remove('printable');
        printTitle.remove();
    }, 500);
}
