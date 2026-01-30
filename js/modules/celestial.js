
// SunCalc is loaded globally from CDN, so we can use it directly.

export function getSunData(date, lat, lon) {
    const sunTimes = SunCalc.getTimes(date, lat, lon);
    return {
        sunrise: sunTimes.sunrise,
        sunset: sunTimes.sunset,
        solarNoon: sunTimes.solarNoon,
        dawn: sunTimes.dawn, // civil twilight start
        dusk: sunTimes.dusk, // civil twilight end
        nauticalDawn: sunTimes.nauticalDawn, // nautical twilight start
        night: sunTimes.night, // astronomical dusk
        nightEnd: sunTimes.nightEnd // astronomical dawn
    };
}

export function getMoonData(date, lat, lon) {
    const moonTimes = SunCalc.getMoonTimes(date, lat, lon);
    const moonIllumination = SunCalc.getMoonIllumination(date);
    const moonPosition = SunCalc.getMoonPosition(date, lat, lon);
    
    // Find culmination (highest point)
    const culminationTime = SunCalc.getTimes(date, lat, lon).solarNoon; // Approximate time
    const moonCulmination = SunCalc.getMoonPosition(culminationTime, lat, lon);

    return {
        rise: moonTimes.rise,
        set: moonTimes.set,
        alwaysUp: moonTimes.alwaysUp,
        alwaysDown: moonTimes.alwaysDown,
        illumination: moonIllumination,
        distance: moonPosition.distance,
        culmination: moonCulmination
    };
}


export function getNextMoonPhases(startDate) {
    let date = new Date(startDate);
    const phases = {
        newMoon: null,
        firstQuarter: null,
        fullMoon: null,
        lastQuarter: null,
    };
    
    let lastPhase = SunCalc.getMoonIllumination(date).phase;
    
    // Search for the next 45 days
    for (let i = 0; i < 45 * 24; i++) {
        date.setHours(date.getHours() + 1);
        const currentPhase = SunCalc.getMoonIllumination(date).phase;

        // Check for phase transitions
        if (!phases.newMoon && lastPhase > 0.95 && currentPhase < 0.05) phases.newMoon = new Date(date);
        if (!phases.firstQuarter && lastPhase < 0.25 && currentPhase >= 0.25) phases.firstQuarter = new Date(date);
        if (!phases.fullMoon && lastPhase < 0.5 && currentPhase >= 0.5) phases.fullMoon = new Date(date);
        if (!phases.lastQuarter && lastPhase < 0.75 && currentPhase >= 0.75) phases.lastQuarter = new Date(date);
        
        lastPhase = currentPhase;

        if (phases.newMoon && phases.firstQuarter && phases.fullMoon && phases.lastQuarter) {
            break;
        }
    }
    
    return phases;
}
