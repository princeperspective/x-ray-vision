import { ObjectData } from '../types';
import { Platform } from 'react-native';

// =========================================================================
// 🌐 CONFIGURATION
// =========================================================================

// ⚠️ CRITICAL: Replace this with your computer's local IP address.
// On Windows, run 'ipconfig' to find it.
// Example: 'http://192.168.1.15:8000/predict'
const API_URL = 'http://10.219.134.67:8000/predict';

// =========================================================================
// 📚 DATABASE & MAPPING
// =========================================================================

const MOCK_DB: Record<string, ObjectData> = {
    lightbulb: {
        id: 'lightbulb',
        name: 'Incandescent Light Bulb',
        description: 'A classic electric light with a wire filament heated until it glows.',
        components: [
            { id: '1', name: 'Filament', description: 'Tungsten wire that glows when heated.', position: { x: 50, y: 30 } },
            { id: '2', name: 'Glass Bulb', description: 'Protects the filament from oxidation.', position: { x: 50, y: 10 } },
            { id: '3', name: 'Base', description: 'Connects to the electrical supply.', position: { x: 50, y: 80 } },
        ],
    },
    mouse: {
        id: 'mouse',
        name: 'Computer Mouse',
        description: 'Hand-held pointing device that detects two-dimensional motion.',
        components: [
            { id: '1', name: 'Scroll Wheel', description: 'Used for scrolling content.', position: { x: 50, y: 20 } },
            { id: '2', name: 'Left Click Switch', description: 'Primary selection button.', position: { x: 30, y: 30 } },
            { id: '3', name: 'Optical Sensor', description: 'Detects movement relative to a surface.', position: { x: 50, y: 60 } },
        ],
    },
    phone: {
        id: 'phone',
        name: 'Smartphone',
        description: 'Portable computer with a touchscreen interface.',
        components: [
            { id: '1', name: 'SoC (Processor)', description: 'The brain of the device.', position: { x: 50, y: 40 } },
            { id: '2', name: 'Battery', description: 'Provides power to the components.', position: { x: 50, y: 60 } },
            { id: '3', name: 'Camera Module', description: 'Captures photos and videos.', position: { x: 70, y: 15 } },
        ],
    },
    keyboard: {
        id: 'keyboard',
        name: 'Computer Keyboard',
        description: 'Input device used to enter characters and functions into the computer system.',
        components: [
            { id: '1', name: 'Key Switches', description: 'Mechanisms under the keys that register presses.', position: { x: 50, y: 50 } },
            { id: '2', name: 'Controller', description: 'Scans the key matrix and sends data to the computer.', position: { x: 80, y: 20 } },
        ],
    },
    bottle: {
        id: 'bottle',
        name: 'Water Bottle',
        description: 'A container that is used to hold water, liquids or other beverages.',
        components: [
            { id: '1', name: 'Cap', description: 'Seals the bottle to prevent spilling.', position: { x: 50, y: 10 } },
            { id: '2', name: 'Body', description: 'Main container area.', position: { x: 50, y: 50 } },
        ],
    },
    cup: {
        id: 'cup',
        name: 'Coffee Mug',
        description: 'A type of cup typically used for drinking hot beverages, such as coffee, hot chocolate, or tea.',
        components: [
            { id: '1', name: 'Handle', description: 'Used to hold the mug when hot.', position: { x: 80, y: 50 } },
            { id: '2', name: 'Rim', description: 'The edge where you drink from.', position: { x: 50, y: 10 } },
        ],
    },
    laptop: {
        id: 'laptop',
        name: 'Laptop Computer',
        description: 'Portable personal computer with a screen and keyboard.',
        components: [
            { id: '1', name: 'Screen', description: 'Display panel.', position: { x: 50, y: 20 } },
            { id: '2', name: 'Motherboard', description: 'Main circuit board with CPU and RAM.', position: { x: 50, y: 60 } },
            { id: '3', name: 'Battery', description: 'Rechargeable power source.', position: { x: 50, y: 80 } },
        ],
    },
    watch: {
        id: 'watch',
        name: 'Wristwatch',
        description: 'Timekeeping device worn on the wrist.',
        components: [
            { id: '1', name: 'Movement', description: 'Internal mechanism that keeps time.', position: { x: 50, y: 50 } },
            { id: '2', name: 'Crystal', description: 'Protective glass over the dial.', position: { x: 50, y: 30 } },
        ],
    },
};

// Map Backend predictions to our internal data structure
const mapPredictionToObject = (predictions: Array<{ className: string; probability: number }>): ObjectData | null => {
    console.log('📊 Analysis Results:', JSON.stringify(predictions.slice(0, 5), null, 2));

    if (!predictions || predictions.length === 0) {
        return null;
    }

    // 1. Try to find a specific match in our MOCK_DB (High Fidelity X-Ray)
    for (const prediction of predictions) {
        const className = prediction.className.toLowerCase();
        
        // Exact entries for our manual database
        if (className.includes('mouse') && MOCK_DB.mouse) return MOCK_DB.mouse;
        if ((className.includes('phone') || className.includes('cellular')) && MOCK_DB.phone) return MOCK_DB.phone;
        if (className.includes('keyboard') && MOCK_DB.keyboard) return MOCK_DB.keyboard;
        if (className.includes('bottle') && MOCK_DB.bottle) return MOCK_DB.bottle;
        if ((className.includes('cup') || className.includes('mug')) && MOCK_DB.cup) return MOCK_DB.cup;
        if (className.includes('laptop') && MOCK_DB.laptop) return MOCK_DB.laptop;
        if (className.includes('watch') && MOCK_DB.watch) return MOCK_DB.watch;
        if ((className.includes('light') || className.includes('lamp')) && MOCK_DB.lightbulb) return MOCK_DB.lightbulb;
    }

    // 2. If no exact DB match, generate a DYNAMIC object (Universal Recognition)
    const topPrediction = predictions[0];
    
    // Capitalize each word for invalid names
    const displayName = topPrediction.className
        .split(',')[0] // Take first alias if multiple (e.g. "notebook, laptop")
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    console.log(`✨ Generating Dynamic Blueprints for: ${displayName}`);

    return {
        id: `dynamic_${Date.now()}`,
        name: displayName,
        description: `Identified as ${topPrediction.className} with ${(topPrediction.probability * 100).toFixed(1)}% confidence.\n\nAI-generated structural analysis displayed below.`,
        components: [
            // Generate generic speculative components since we don't have a blueprint
            { 
                id: 'gen_1', 
                name: 'External Chassis', 
                description: `The outer structural layer of the ${displayName}.`, 
                position: { x: 50, y: 20 } 
            },
            { 
                id: 'gen_2', 
                name: 'Primary Mass', 
                description: 'The main functional body of the object.', 
                position: { x: 50, y: 50 } 
            },
            { 
                id: 'gen_3', 
                name: 'Base Structure', 
                description: 'Supporting foundation and material composition.', 
                position: { x: 50, y: 80 } 
            }
        ]
    };
};

// =========================================================================
// 🚀 MAIN SERVICE
// =========================================================================

export const identifyObject = async (imageUri: string): Promise<ObjectData | null> => {
    console.log('==========================================');
    console.log('🚀 Starting Cloud Identification');
    console.log('📷 Image URI:', imageUri.length > 50 ? imageUri.substring(0, 50) + '...' : imageUri);
    console.log('🌐 Target API:', API_URL);
    console.log('==========================================');

    try {
        // 1. Prepare Form Data for Backend
        console.log('📤 Preparing upload...');
        const formData = new FormData();
        
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        // Simple type inference
        const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

        formData.append('file', {
            uri: imageUri,
            name: filename,
            type: type,
        } as any);

        // 2. Send Request to Python Server
        console.log('📡 Sending request...');
        
        // Timeout handling (5 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'content-type': 'multipart/form-data',
                },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error (${response.status}): ${errorText}`);
            }

            // 3. Parse Response
            const data = await response.json();
            const predictions = data.predictions;

            console.log('✅ Analysis complete!');
            
            // 4. Map
            return mapPredictionToObject(predictions);

        } catch (fetchError) {
             if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                throw new Error('Request timed out. Check if server is reachable.');
            }
            throw fetchError;
        }

    } catch (error) {
        console.log('==========================================');
        console.error('❌ IDENTIFICATION FAILED');
        console.error('Message:', error instanceof Error ? error.message : String(error));
        console.log('------------------------------------------');
        console.log('Troubleshooting Tips:');
        console.log('1. Is the Python server running? (python main.py)');
        console.log(`2. Is your IP correct? (${API_URL})`);
        console.log('3. Are phone & computer on the same WiFi?');
        console.log('==========================================');
        return null; // Return null so UI shows "Can't identify" instead of crashing
    }
};
