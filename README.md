# X-Ray Vision: Object Decomposition App 🔍📱

An advanced React Native application that combines computer vision with interactive AR-like visualization to reveal the internal components of everyday objects. This project leverages **TensorFlow.js** directly on the device to perform real-time object recognition and maps the results to a structured internal component database.

![Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Framework](https://img.shields.io/badge/Framework-Expo%20%7C%20React%20Native-blueviolet)

## 🚀 Key Features

- **Real-Time Object Detection**: Uses a quantized MobileNet model running locally on the device to identify objects with low latency.
- **X-Ray Visualization**: Overlays hypothetical internal components (e.g., CPU, Battery, Filament) onto recognized objects.
- **Interactive UI**: Users can tap on individual components to learn about their function and specifications.
- **Cross-Platform**: Fully functional on iOS, Android, and Web using Expo's unified API.
- **Privacy-First**: All image processing happens locally or via client-side scripts; user images are processed in memory and not permanently stored.

## 🛠 Technology Stack

### Core Framework

- **React Native**: Building native interfaces using React.
- **Expo SDK 50+**: Managed workflow for rapid development and device hardware access.
- **TypeScript**: Strongly typed codebase for robustness and maintainability.
- **Expo Router**: File-system based routing for seamless screen navigation.

### Artificial Intelligence

- **TensorFlow.js (`@tensorflow/tfjs`)**: Machine learning backend for JavaScript.
- **MobileNet (`@tensorflow-models/mobilenet`)**: Lightweight, pre-trained Convolutional Neural Network (CNN) optimized for mobile devices.
- **Expo GL**: Hardware-accelerated graphics context used by TensorFlow for tensor computations.

### Device Integration

- **Expo Camera**: For capturing images relative to the device viewport.
- **Expo FileSystem**: For handling image data streams and base64 encoding.

## 🏗 Architecture Overview

The application follows a Service-Oriented Architecture (SOA) coupled with React's component-based UI.

```
proj1/
├── app/                    # Expo Router screens (Navigation)
│   ├── index.tsx           # Home/Landing screen
│   ├── scan.tsx            # Camera capture interface
│   └── result.tsx          # Recognition results & visualization
├── components/             # Reusable UI elements
│   └── OverlayView.tsx     # AR-style component overlay system
├── services/               # Core business logic & AI modules
│   └── ObjectRecognitionService.ts  # TFJS implementation & Object DB
├── types.ts                # TypeScript interface definitions
└── assets/                 # Static assets
```

### Deep Dive: Object Recognition Pipeline

1.  **Image Capture**: The user captures an image via `Expo Camera` in `scan.tsx`. The image is saved temporarily to the device cache.
2.  **Tensor Conversion**: The `ObjectRecognitionService` reads the image URI and processes it.
    - _Web/Hybrid_: Uses standard HTML `Image` API to load pixel data.
    - _Native_: Uses `GLView` or `decodeJpeg` (adapter dependent) to convert raw bytes into a Rank-3 Tensor (`[height, width, 3]`).
3.  **Inference**:
    - The tensor is fed into the **MobileNet** model.
    - The model outputs a probability distribution over 1,000+ ImageNet classes.
4.  **Semantic Mapping**:
    - The service filters predictions using a confidence threshold (default: >3%).
    - Predictions are mapped to the internal `MOCK_DB`. For example, a prediction of "cellular telephone" maps to the internal `phone` schema containing component data (SoC, Battery, Camera Module).
5.  **Visualization**: The `OverlayView` component processes the mapped data and renders interactive "hotspots" or component lists over the image.

## 💻 Installation & Setup

### Prerequisites

- Node.js (LTS v18+ recommended)
- npm or yarn
- Expo Go app installed on your physical device (iOS/Android)

### Steps

1.  **Clone the Repository**

    ```bash
    git clone <repository-url>
    cd proj1
    ```

2.  **Install Dependencies**
    Note: We use `--legacy-peer-deps` due to version mismatches between some TFJS native adapters and the latest React Native/Expo versions.

    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Start the Development Server**

    ```bash
    npm start
    ```

4.  **Run on Device**
    - Scan the QR code displayed in the terminal using the Expo Go app.
    - Press `w` to run in a web browser.
    - Press `a` for Android Emulator or `i` for iOS Simulator (requires setup).

## 🔧 Troubleshooting

- **`ERESOLVE` Dependency Errors**: Always run `npm install --legacy-peer-deps`. TensorFlow React Native adapters often lag slightly behind the fast-moving Expo release cycle.
- **"Model failed to load"**: Ensure you have an active internet connection. The MobileNet model weights are fetched from the Google Cloud Storage CDN on the first run.
- **Camera Black Screen**: Check app permissions in your device settings. The app requires Camera access to function.

## 🔮 Future Roadmap

- **Custom Model Training**: Replace MobileNet with a custom-trained TFLite model fine-tuned on X-ray specific datasets or exploded views.
- **Real AR Tracking**: Implement SLAM (Simultaneous Localization and Mapping) to anchor component overlays to physical space rather than static images.
- **Community Database**: Allow users to contribute "teardown" schemas for new objects.

---

_Built with ❤️ using React Native & TensorFlow_
