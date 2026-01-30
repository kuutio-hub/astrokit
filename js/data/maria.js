
// Approximate coordinates for lunar maria.
// Path contains [x, y] coordinates, where x and y are from -1 to 1.
// Center of the moon is [0, 0]. +x is right, +y is up.
// Opacity controls the darkness of the mare.
export const maria = [
    { name: "Mare Crisium", opacity: 0.4, path: [
        [0.7, 0.2], [0.65, 0.35], [0.55, 0.4], [0.5, 0.35], [0.55, 0.2], [0.6, 0.15], [0.7, 0.2]
    ]},
    { name: "Mare Fecunditatis", opacity: 0.35, path: [
        [0.6, -0.05], [0.5, -0.1], [0.4, -0.25], [0.45, -0.4], [0.6, -0.3], [0.65, -0.15], [0.6, -0.05]
    ]},
    { name: "Mare Nectaris", opacity: 0.3, path: [
        [0.4, -0.2], [0.35, -0.25], [0.3, -0.35], [0.35, -0.4], [0.45, -0.35], [0.4, -0.2]
    ]},
    { name: "Mare Tranquillitatis", opacity: 0.45, path: [
        [0.4, 0.1], [0.3, 0.2], [0.2, 0.15], [0.25, -0.05], [0.35, -0.1], [0.45, 0.0], [0.4, 0.1]
    ]},
    { name: "Mare Serenitatis", opacity: 0.4, path: [
        [0.2, 0.45], [0.15, 0.5], [0.05, 0.5], [-0.05, 0.4], [0.0, 0.25], [0.1, 0.3], [0.2, 0.45]
    ]},
    { name: "Mare Imbrium", opacity: 0.5, path: [
        [-0.1, 0.6], [-0.25, 0.7], [-0.4, 0.65], [-0.5, 0.4], [-0.4, 0.25], [-0.2, 0.3], [-0.1, 0.6]
    ]},
    { name: "Mare Vaporum", opacity: 0.25, path: [
        [0.05, 0.15], [-0.05, 0.2], [-0.1, 0.1], [0.0, 0.05], [0.05, 0.15]
    ]},
    { name: "Oceanus Procellarum", opacity: 0.5, path: [
        [-0.3, 0.3], [-0.5, 0.2], [-0.65, 0.0], [-0.6, -0.3], [-0.4, -0.2], [-0.25, 0.1], [-0.3, 0.3]
    ]},
    { name: "Mare Humorum", opacity: 0.3, path: [
        [-0.45, -0.4], [-0.55, -0.45], [-0.6, -0.35], [-0.5, -0.3], [-0.45, -0.4]
    ]},
    { name: "Mare Nubium", opacity: 0.35, path: [
        [-0.1, -0.3], [-0.2, -0.4], [-0.3, -0.5], [-0.2, -0.6], [-0.05, -0.45], [-0.1, -0.3]
    ]}
];