
export function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('A böngésződ nem támogatja a helymeghatározást.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                let message = 'Ismeretlen hiba a helymeghatározás során.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Nem adtál engedélyt a helymeghatározáshoz.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'A helyzeted jelenleg nem elérhető.';
                        break;
                    case error.TIMEOUT:
                        message = 'A helymeghatározás időtúllépés miatt megszakadt.';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 1000 * 60 * 30 // 30 minutes cache
            }
        );
    });
}
