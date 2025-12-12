import * as mobilenet from '@tensorflow-models/mobilenet';
import { ObjectData } from '../types';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';

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

// Map MobileNet predictions to our internal data structure
const mapPredictionToObject = (predictions: Array<{ className: string; probability: number }>): ObjectData | null => {
    console.log('📊 MobileNet Predictions:', JSON.stringify(predictions.slice(0, 5), null, 2));

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

    console.log(`✨ Generating dynamic X-Ray for: ${displayName}`);

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

export const identifyObject = async (imageUri: string): Promise<ObjectData | null> => {
    console.log('==========================================');
    console.log('🚀 Starting object identification');
    console.log('📷 Image URI:', imageUri.length > 100 ? imageUri.substring(0, 100) + '...' : imageUri);
    console.log('📱 Platform:', Platform.OS);
    console.log('==========================================');

    try {
        // Load the model first
        console.log('📥 Step 1: Loading model...');
        const loadedModel = await loadModel();
        
        if (!loadedModel) {
            console.error('❌ Model failed to load');
            return null;
        }

        console.log('🖼️ Step 2: Processing image...');
        let predictions: Array<{ className: string; probability: number }>;

        if (Platform.OS === 'web') {
            // WEB IMPLEMENTATION
            console.log('🌐 Web Environment Detected');
            predictions = await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = async () => {
                    try {
                        console.log('✅ Image loaded successfully');
                        console.log('🧠 Step 3: Running MobileNet inference...');
                        const preds = await loadedModel!.classify(img);
                        resolve(preds);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = (error) => reject(new Error('Failed to load image'));
                img.src = imageUri;
            });
        } else {
            // NATIVE IMPLEMENTATION (iOS/Android)
            console.log('📱 Native Environment Detected');

            // 0. Resize image to prevent OOM
            console.log('📐 Resizing image for model input...');
            const manipResult = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ resize: { width: 512 } }], // MobileNet uses 224x224, 512 is plenty safe
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            
            // 1. Read file as Base64
            const imgB64 = await FileSystem.readAsStringAsync(manipResult.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            // 2. Convert Base64 to Uint8Array
            const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
            const raw = new Uint8Array(imgBuffer);
            
            // 3. Decode JPEG to Tensor directly
            const imageTensor = decodeJpeg(raw);
            
            console.log('🧠 Step 3: Running MobileNet inference...');
            predictions = await loadedModel.classify(imageTensor);
            
            // Cleanup tensor to prevent memory leaks
            imageTensor.dispose();
        }
        
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
