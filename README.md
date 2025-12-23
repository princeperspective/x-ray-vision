# X-Ray Vision: Object Decomposition App 🔍📱

An advanced React Native application that combines computer vision with interactive AR-like visualization to reveal the internal components of everyday objects. This project leverages a **Python FastAPI** backend running **PyTorch** to perform robust object recognition and maps the results to a structured internal component database.

![Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Framework](https://img.shields.io/badge/Framework-Expo%20%7C%20React%20Native-blueviolet)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20PyTorch-orange)

## 🚀 Key Features

- **Robust Object Detection**: Uses a standard **MobileNetV2** model running strictly on a Python backend for high-accuracy predictions.
- **X-Ray Visualization**: Overlays hypothetical internal components (e.g., CPU, Battery, Filament) onto recognized objects.
- **Interactive UI**: Users can tap on individual components to learn about their function and specifications.
- **Cross-Platform Support**: Fully functional on iOS, Android, and Web with unified camera and file upload handling.
- **Service-Oriented**: Decoupled architecture separating the heavy ML inference from the lightweight React Native client.

## 🛠 Technology Stack

### Frontend (Client)

- **React Native**: Building native interfaces using React.
- **Expo SDK 52+**: Managed workflow for rapid development and device hardware access.
- **TypeScript**: Strongly typed codebase for robustness.
- **Expo Camera & FileSystem**: For capturing images and handling multipart uploads.

### Backend (Server)

- **Python 3**: Core runtime.
- **FastAPI**: High-performance async web framework for the API.
- **PyTorch & Torchvision**: Industry-standard ML library hosting the pre-trained MobileNetV2 model.
- **Pillow (PIL)**: Image processing.

## 🏗 Architecture Overview

The application follows a Client-Server Architecture. The phone captures an image and uploads it to a local Python server for analysis.

```
proj1/
├── app/                    # Expo Router screens (Navigation)
│   ├── index.tsx           # Home/Landing screen
│   ├── scan.tsx            # Camera capture interface
│   ├── result.tsx          # Recognition results & visualization
│   └── settings.tsx        # Dynamic IP Configuration
├── backend/                # PYTHON SERVER
│   ├── main.py             # FastAPI entry point & Inference logic
│   └── requirements.txt    # Python dependencies
├── components/             # Reusable UI elements
├── services/               # Client-side Business Logic
│   └── ObjectRecognitionService.ts  # Handles API uploads & IP configuration
└── assets/                 # Static assets
```

## 💻 Installation & Setup

### Prerequisites

- Node.js (LTS v18+ recommended)
- Python 3.10+ installed and added to PATH
- Expo Go app on your physical device

### 1. Backend Setup (Python)

The backend handles the actual object recognition. It must be running for the app to work.

```bash
# Navigate to the project root
cd proj1

# Create a virtual environment (optional but recommended)
python -m venv .venv

# Activate Virtual Environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install Dependencies
pip install -r backend/requirements.txt

# Start the Server
python backend/main.py
```

_The server will start on port 8000._

### 2. Frontend Setup (React Native)

Open a new terminal window.

```bash
# Install Node modules
npm install

# Start the Expo Dev Server
npx expo start
```

### 3. Network Configuration (CRITICAL ⚠️)

Since the app runs on your phone and the server runs on your computer, they must be able to talk to each other.

1.  **Same Wi-Fi**: Ensure your Phone and Computer are connected to the exact same Wi-Fi network.
2.  **IP Address Configuration**:
    - **Easy Way**: Open the app, click the Gear icon (Settings), and type in your computer's IP (e.g., `http://192.168.1.5:8000`). The app will save this and remember it.
    - **Hard Way**: Edit `API_URL` in `services/ObjectRecognitionService.ts`.
    - Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your IPv4 address.
3.  **Model Caching**: The first time you run the backend, it will download the MobileNet model (approx 14MB). This is now cached in `backend/model_cache/` so it won't redownload on future runs.

## 🔧 Troubleshooting

- **"Connection Failed" / "Network Error"**:

  - Firewall: Your computer's firewall might be blocking port 8000. Allow Python/FastAPI through the firewall.
  - Wrong IP: Double-check the IP address in `ObjectRecognitionService.ts`.
  - Different Networks: If you are on a corporate/university Wi-Fi that blocks peer-to-peer communication, try using a Mobile Hotspot from your phone and connecting your laptop to it.

- **"Unprocessable Content" / Error 400/422**:
  - This usually means the image upload format (Multipart Form Data) wasn't handled correctly. The latest code handles `blob:` (Web) and `{ uri }` (Native) automatically, but if you edit code, ensure you aren't manually setting `Content-Type`.

## 🔮 Future Roadmap

- **Custom Model Training**: Replace MobileNet with a custom-trained model fine-tuned on X-ray specific datasets.
- **Real AR Tracking**: Implement SLAM to anchor component overlays to physical space.
- **Cloud Hosting**: Deploy the Python backend to AWS/GCP so manual IP configuration isn't needed.

---

_Built with ❤️ using React Native, Expo, & PyTorch_
