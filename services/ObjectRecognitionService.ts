import * as mobilenet from '@tensorflow-models/mobilenet';
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

// TensorFlow model state
let model: mobilenet.MobileNet | null = null;
let isModelLoading = false;

// Initialize TensorFlow and load MobileNet model
const loadModel = async () => {
    if (model) return model;
    if (isModelLoading) {
        // Wait for ongoing load
        while (isModelLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return model;
    }

    try {
        isModelLoading = true;
        console.log('🔄 Loading MobileNet model...');

        // Load the MobileNet model
        model = await mobilenet.load({
            version: 2,
            alpha: 1.0,
        });

        console.log('✅ MobileNet model loaded successfully!');
        return model;
    } catch (error) {
        console.error('❌ Failed to load model:', error);
        throw error;
    } finally {
        isModelLoading = false;
    }
};

// Map MobileNet predictions to our internal database
const mapPredictionToObject = (predictions: Array<{ className: string; probability: number }>): ObjectData | null => {
    console.log('📊 MobileNet Predictions:', JSON.stringify(predictions.slice(0, 5), null, 2));

    // Get the top prediction
    if (!predictions || predictions.length === 0) {
        console.log('⚠️ No predictions returned');
        return null;
    }

    // Check all predictions with reasonable confidence
    for (const prediction of predictions) {
        const className = prediction.className.toLowerCase();
        const confidence = prediction.probability;

        console.log(`🔍 Checking: "${className}" (${(confidence * 100).toFixed(1)}%)`);

        // Only consider predictions with >3% confidence
        if (confidence < 0.03) {
            console.log(`  ⏭️ Skipped (confidence too low)`);
            continue;
        }

        // Map to our internal database (more comprehensive mapping)
        // Mouse
        if (className.includes('mouse')) {
            console.log('✅ MATCHED: Mouse');
            return MOCK_DB['mouse'];
        }

        // Phone/Smartphone
        if (className.includes('cellular') ||
            className.includes('phone') ||
            className.includes('smartphone') ||
            className.includes('iphone') ||
            className.includes('ipod')) {
            console.log('✅ MATCHED: Phone');
            return MOCK_DB['phone'];
        }

        // Light bulb
        if (className.includes('light') ||
            className.includes('bulb') ||
            className.includes('lamp') ||
            className.includes('lantern') ||
            className.includes('torch')) {
            console.log('✅ MATCHED: Lightbulb');
            return MOCK_DB['lightbulb'];
        }

        // Keyboard
        if (className.includes('keyboard') ||
            className.includes('typewriter')) {
            console.log('✅ MATCHED: Keyboard');
            return MOCK_DB['keyboard'];
        }

        // Bottle
        if (className.includes('bottle') ||
            className.includes('flask')) {
            console.log('✅ MATCHED: Bottle');
            return MOCK_DB['bottle'];
        }

        // Cup/Mug
        if (className.includes('cup') ||
            className.includes('mug') ||
            className.includes('coffee') ||
            className.includes('espresso')) {
            console.log('✅ MATCHED: Cup');
            return MOCK_DB['cup'];
        }

        // Laptop
        if (className.includes('laptop') ||
            className.includes('notebook')) {
            console.log('✅ MATCHED: Laptop');
            return MOCK_DB['laptop'];
        }

        // Watch
        if (className.includes('watch') ||
            className.includes('clock')) {
            console.log('✅ MATCHED: Watch');
            return MOCK_DB['watch'];
        }
    }

    console.log('❌ No matching object found in database');
    console.log('🔝 Top 3 predictions were:');
    predictions.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.className} (${(p.probability * 100).toFixed(1)}%)`);
    });
    return null;
};

export const identifyObject = async (imageUri: string): Promise<ObjectData | null> => {
    console.log('==========================================');
    console.log('🚀 Starting object identification');
    console.log('📷 Image URI:', imageUri.length > 100 ? imageUri.substring(0, 100) + '...' : imageUri);
    console.log('==========================================');

    try {
        // Load the model first
        console.log('📥 Step 1: Loading model...');
        const loadedModel = await loadModel();

        if (!loadedModel) {
            console.error('❌ Model failed to load');
            return null;
        }

        console.log('🖼️ Step 2: Creating image element...');

        // For web/Expo, we can use Image API
        const predictions = await new Promise<Array<{ className: string; probability: number }>>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = async () => {
                try {
                    console.log('✅ Image loaded successfully');
                    console.log('📐 Image dimensions:', img.width, 'x', img.height);
                    console.log('🧠 Step 3: Running MobileNet inference...');

                    const preds = await loadedModel!.classify(img);
                    resolve(preds);
                } catch (error) {
                    console.error('❌ Error during classification:', error);
                    reject(error);
                }
            };

            img.onerror = (error) => {
                console.error('❌ Failed to load image:', error);
                reject(new Error('Failed to load image'));
            };

            console.log('⏳ Loading image from URI...');
            img.src = imageUri;
        });

        console.log('✅ Classification complete!');
        console.log(`📊 Received ${predictions.length} predictions`);

        // Map predictions to our object database
        console.log('🔄 Step 4: Mapping predictions to database...');
        const result = mapPredictionToObject(predictions);

        if (result) {
            console.log('==========================================');
            console.log(`🎉 SUCCESS! Object identified: ${result.name}`);
            console.log('==========================================');
            return result;
        }

        console.log('==========================================');
        console.log('⚠️ Could not map predictions to known objects');
        console.log('==========================================');
        return null;

    } catch (error) {
        console.log('==========================================');
        console.error('❌ ERROR during object identification:');
        console.error('Message:', error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack);
        }
        console.log('==========================================');
        return null;
    }
};
