
export const eventTypes = {
    meteor: { name: 'Meteorraj' },
    eclipse: { name: 'Fogyatkozás' },
    conjunction: { name: 'Együttállás/Opozíció' },
    opposition: { name: 'Szezonális' }
};

export const events = [
    { start: '2026-01-01', end: '2026-01-05', title: 'Quadrantidák', type: 'meteor' },
    { start: '2026-03-03', end: '2026-03-03', title: 'Teljes holdfogyatkozás', type: 'eclipse' },
    { start: '2026-03-20', end: '2026-03-20', title: 'Napéjegyenlőség', type: 'opposition' },
    { start: '2026-04-16', end: '2026-04-25', title: 'Lyridák', type: 'meteor' },
    { start: '2026-04-19', end: '2026-05-28', title: 'Eta Aquaridák', type: 'meteor' },
    { start: '2026-06-21', end: '2026-06-21', title: 'Napforduló', type: 'opposition' },
    { start: '2026-08-12', end: '2026-08-12', title: 'Részleges napfogyatkozás', type: 'eclipse' },
    { start: '2026-07-17', end: '2026-08-24', title: 'Perseidák', type: 'meteor' },
    { start: '2026-08-28', end: '2026-08-28', title: 'Részleges holdfogyatkozás', type: 'eclipse' },
    { start: '2026-09-22', end: '2026-09-22', title: 'Napéjegyenlőség', type: 'opposition' },
    { start: '2026-10-02', end: '2026-11-07', title: 'Orionidák', type: 'meteor' },
    { start: '2026-11-06', end: '2026-11-30', title: 'Leonidák', type: 'meteor' },
    { start: '2026-12-04', end: '2026-12-17', title: 'Geminidák', type: 'meteor' },
    { start: '2026-12-21', end: '2026-12-21', title: 'Napforduló', type: 'opposition' }
];
