
// A comprehensive list of cameras with their sensor data.
// width_mm and height_mm are physical sensor dimensions.
// pixel_size is in micrometers (μm).
export const cameras = [
    // Nikon
    { name: "Nikon D3400 (APS-C)", width_mm: 23.5, height_mm: 15.6, pixel_size: 3.92 },
    { name: "Nikon D5600 (APS-C)", width_mm: 23.5, height_mm: 15.6, pixel_size: 3.92 },
    { name: "Nikon D7500 (APS-C)", width_mm: 23.5, height_mm: 15.6, pixel_size: 4.22 },
    { name: "Nikon D850 (Full Frame)", width_mm: 35.9, height_mm: 23.9, pixel_size: 4.35 },
    { name: "Nikon Z6 II (Full Frame)", width_mm: 35.9, height_mm: 23.9, pixel_size: 5.94 },
    { name: "Nikon Z7 II (Full Frame)", width_mm: 35.9, height_mm: 23.9, pixel_size: 4.35 },
    { name: "Nikon Z50 (APS-C)", width_mm: 23.5, height_mm: 15.7, pixel_size: 4.22 },

    // Canon
    { name: "Canon EOS 2000D (APS-C)", width_mm: 22.3, height_mm: 14.9, pixel_size: 3.72 },
    { name: "Canon EOS 850D (APS-C)", width_mm: 22.3, height_mm: 14.9, pixel_size: 3.72 },
    { name: "Canon EOS 90D (APS-C)", width_mm: 22.3, height_mm: 14.8, pixel_size: 3.20 },
    { name: "Canon EOS 6D Mark II (Full Frame)", width_mm: 35.9, height_mm: 24.0, pixel_size: 5.67 },
    { name: "Canon EOS 5D Mark IV (Full Frame)", width_mm: 36.0, height_mm: 24.0, pixel_size: 5.36 },
    { name: "Canon EOS R6 (Full Frame)", width_mm: 35.9, height_mm: 23.9, pixel_size: 6.56 },
    { name: "Canon EOS Ra (Full Frame Astro)", width_mm: 36.0, height_mm: 24.0, pixel_size: 5.36 },

    // Sony
    { name: "Sony α6400 (APS-C)", width_mm: 23.5, height_mm: 15.6, pixel_size: 3.92 },
    { name: "Sony α7 III (Full Frame)", width_mm: 35.6, height_mm: 23.8, pixel_size: 5.93 },
    { name: "Sony α7R IV (Full Frame)", width_mm: 35.7, height_mm: 23.8, pixel_size: 3.76 },
    
    // ZWO (Astro)
    { name: "ZWO ASI120MC-S (1/3\")", width_mm: 4.8, height_mm: 3.6, pixel_size: 3.75 },
    { name: "ZWO ASI1600MM Pro (M4/3)", width_mm: 17.7, height_mm: 13.4, pixel_size: 3.80 },
    { name: "ZWO ASI294MC Pro (M4/3)", width_mm: 19.1, height_mm: 13.0, pixel_size: 4.63 },
    { name: "ZWO ASI533MC Pro (1\")", width_mm: 11.31, height_mm: 11.31, pixel_size: 3.76 },
    { name: "ZWO ASI2600MC Pro (APS-C)", width_mm: 23.5, height_mm: 15.7, pixel_size: 3.76 },
    { name: "ZWO ASI6200MC Pro (Full Frame)", width_mm: 36.0, height_mm: 24.0, pixel_size: 3.76 },
    
    // Smartphones (Main Camera)
    { name: "Apple iPhone 14 Pro", width_mm: 9.8, height_mm: 7.3, pixel_size: 1.22 },
    { name: "Apple iPhone 15 Pro Max", width_mm: 9.8, height_mm: 7.3, pixel_size: 1.22 },
    { name: "Samsung Galaxy S23 Ultra", width_mm: 9.6, height_mm: 7.2, pixel_size: 0.6 },
    { name: "Google Pixel 8 Pro", width_mm: 9.3, height_mm: 7.0, pixel_size: 1.2 }
];
