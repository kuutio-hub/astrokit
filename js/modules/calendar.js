
import { events, eventTypes } from '../data/events.js';

let currentDate = new Date();

export function initCalendar() {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
    renderLegend();
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('calendar-month-year').textContent = `${year}. ${currentDate.toLocaleDateString('hu-HU', { month: 'long' })}`;

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '<div>Vas</div><div>Hét</div><div>Kedd</div><div>Szer</div><div>Csüt</div><div>Pént</div><div>Szom</div>'.split('').map(d => `<div class="calendar-day-name">${d}</div>`).join('');
    
    grid.innerHTML = `
        <div class="calendar-day-name">H</div>
        <div class="calendar-day-name">K</div>
        <div class="calendar-day-name">Sz</div>
        <div class="calendar-day-name">Cs</div>
        <div class="calendar-day-name">P</div>
        <div class="calendar-day-name">Sz</div>
        <div class="calendar-day-name">V</div>
    `;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Day of the week for the first day (0=Sun, 1=Mon, ..., 6=Sat)
    let startDayOfWeek = firstDay.getDay() -1;
    if(startDayOfWeek === -1) startDayOfWeek = 6; // Adjust for Hungarian week starting on Monday

    // Add empty cells for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
        grid.innerHTML += `<div class="calendar-day other-month"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerHTML = `<div class="calendar-day-header">${day}</div><div class="calendar-events"></div>`;
        
        const currentDay = new Date(year, month, day);
        const eventsForDay = events.filter(e => {
            const start = new Date(e.start);
            const end = new Date(e.end);
            start.setHours(0,0,0,0);
            end.setHours(23,59,59,999);
            return currentDay >= start && currentDay <= end;
        });

        eventsForDay.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = `event-bar event-${event.type}`;
            eventDiv.textContent = event.title;
            dayDiv.querySelector('.calendar-events').appendChild(eventDiv);
        });

        grid.appendChild(dayDiv);
    }
}

function renderLegend() {
    const legend = document.getElementById('calendar-legend');
    legend.innerHTML = Object.entries(eventTypes).map(([type, details]) => `
        <span>
            <div class="legend-color" style="background-color: var(--event-${type});"></div>
            ${details.name}
        </span>
    `).join('');
}
