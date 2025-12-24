# Object Recognition Project - Development Plan

## � Current Status

The project has successfully transitioned to a stable **Client-Server Architecture**.

- **Frontend**: Lightweight React Native "Thin Client" (Expo). Dependencies cleaned, TFJS removed.
- **Backend**: Python FastAPI with PyTorch (MobileNetV2).
- **Networking**: Dynamic IP configuration via in-app Settings with connection diagnostics.
- **Testing**: Terminal-style connectivity tests implemented in UI; Basic unit tests for backend/frontend services established.

---

## � Roadmap & Pending Tasks

### 1. Advanced Networking (Service Discovery)

**Goal**: Remove the need for manual IP entry.

- Implement UDP Broadcast / Multicast DNS (mDNS) on the Python backend.
- Create a listener on the React Native side to auto-detect the server on the local network.

### 2. AI Model Specialization

**Goal**: Move beyond generic ImageNet labels to specific "X-Ray" contents.

- **Data Collection**: Gather dataset of internal component views (PCBs, Batteries, Motors).
- **Training**: Fine-tune the PyTorch model for specific electronic/mechanical internal components.
- **Output**: Return bounding boxes + labels for specific internal parts rather than just one global label.

### 3. UI/UX "Wows" (Visual Polish)

**Goal**: Elevate the app from "Functional" to "Premium".

- **Scanning Animations**: Add a scanner "beam" effect over the camera view.
- **Result Presentation**: Instead of a simple list, overlay "Holographic" labels on the captured image.
- **Haptic Feedback**: Add vibration feedback during scan and success states.

### 4. Production & Deployment

**Goal**: Make the system accessible outside the local network.

- **Dockerization**: Containerize the backend for easy deployment.
- **Cloud Hosting**: Deploy the Python backend to a GPU-enabled cloud provider (e.g., AWS, GCP, Render).
- **Offline Fallback**: Investigate using a smaller, quantized ONNX model on-device for basic functionality when offline.

---

## 🧪 Testing Strategy

- **E2E Testing**: Implement Maestro or Detox for full end-to-end user flows.
- **Performance Profiling**: Measure latency from "Capture" to "Render" and optimize image compression/resolution.
