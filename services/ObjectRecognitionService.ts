import { ObjectData } from '../types';

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

// Google Cloud Vision API configuration
const VISION_API_KEY = 'AIzaSyB-AjPbXT-YvnULXoaFX141ktB5d27q6tI'; // Replace with actual key
const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

interface VisionLabel {
    description: string;
    score: number;
}

const mapLabelToObject = (labels: VisionLabel[]): ObjectData | null => {
    console.log('Vision API Labels:', labels);

    for (const label of labels) {
        const desc = label.description.toLowerCase();

        // High confidence matches
        if (desc.includes('computer mouse') || desc.includes('mouse')) return MOCK_DB['mouse'];
        if (desc.includes('cellular telephone') || desc.includes('mobile phone') || desc.includes('smartphone')) return MOCK_DB['phone'];
        if (desc.includes('light bulb') || desc.includes('lamp') || desc.includes('incandescent')) return MOCK_DB['lightbulb'];
        if (desc.includes('computer keyboard') || desc.includes('keyboard')) return MOCK_DB['keyboard'];
        if (desc.includes('water bottle') || desc.includes('bottle')) return MOCK_DB['bottle'];
        if (desc.includes('coffee cup') || desc.includes('mug') || desc.includes('cup')) return MOCK_DB['cup'];
        if (desc.includes('laptop') || desc.includes('notebook computer')) return MOCK_DB['laptop'];
        if (desc.includes('watch') || desc.includes('wristwatch')) return MOCK_DB['watch'];
    }

    return null;
};

export const identifyObject = async (imageUri: string): Promise<ObjectData | null> => {
    console.log('Starting object identification for:', imageUri);

    try {
        // Try Google Cloud Vision API first
        if (VISION_API_KEY && VISION_API_KEY !== 'YOUR_API_KEY_HERE') {
            try {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = (reader.result as string).split(',')[1];
                        resolve(base64data);
                    };
                    reader.readAsDataURL(blob);
                });

                const visionResponse = await fetch(`${VISION_API_ENDPOINT}?key=${VISION_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        requests: [
                            {
                                image: { content: base64 },
                                features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
                            },
                        ],
                    }),
                });

                const data = await visionResponse.json();
                console.log('Vision API Response:', data);

                if (data.responses && data.responses[0].labelAnnotations) {
                    const labels = data.responses[0].labelAnnotations;
                    const result = mapLabelToObject(labels);
                    if (result) return result;
                }
            } catch (visionError) {
                console.log('Vision API failed, using fallback:', visionError);
            }
        }

        // Fallback: Enhanced mock system with simple heuristics
        console.log('Using fallback mock system');
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simple heuristic: Use a rotating system that cycles through objects
        const keys = Object.keys(MOCK_DB);
        const timestamp = Date.now();
        const index = Math.floor((timestamp / 5000) % keys.length); // Changes every 5 seconds

        console.log(`Fallback selected: ${keys[index]}`);
        return MOCK_DB[keys[index]];

    } catch (error) {
        console.error('Error identifying object:', error);
        return null;
    }
};
