# Object Recognition Project - Development Plan

## 🚨 Current Status & "Missing Links"

The project has transitioned from a client-side only AI (TensorFlow.js) to a robust client-server architecture (React Native + Python Backend). However, "ghost" code from the previous implementation is causing instability.

### Identificed Issues

1.  **Bloated Dependencies**: The React Native app still loads TensorFlow.js libraries, which are heavy and unnecessary now that we use Python.
2.  **Fragile Networking**: The IP address (`http://10.219.134.67:8000`) is hardcoded. If your computer's IP changes (which happens on reboot/WiFi reconnect), the app breaks silently.
3.  **Mixed Logic**: The `ObjectRecognitionService` currently tries to initialize TensorFlow _before_ calling the Python backend. If TensorFlow initialization fails, the network call never happens.

---

## 🛠️ Refactoring Plan

### Phase 1: Clean Up Frontend (Priority High)

**Goal**: Make the React Native app a lightweight "Thin Client" that simply takes a photo and uploads it.

1.  **Remove TFJS**: Uninstall `@tensorflow/tfjs`, `@tensorflow-models/mobilenet`, and `@tensorflow/tfjs-react-native`.
2.  **Rewrite Service**: Completely strip `ObjectRecognitionService.ts` to only contain:
    - The `API_URL` constant.
    - The `identifyObject` function (HTTP POST).
    - The `mapPredictionToObject` logic (Universal Mapper).

### Phase 2: Robust Networking

**Goal**: Ensure the phone can always talk to the computer.

1.  **Dynamic Configuration**: We cannot easily auto-detect the IP on the phone, but we can make it easier to change.
2.  **Connection Test**: Add a simple "Ping" check on app startup to verify the server is reachable before the user tries to scan.

### Phase 3: Backend Enhancements

**Goal**: Ensure the Python server is bulletproof.

1.  **Logging**: The current print statements are good, but we should ensure the server doesn't crash on bad image data (already handled by try/except).
2.  **Model Cache**: The model is currently downloaded on every startup if not cached. We should ensure it persists.

---

## 📋 Action Items for User

1.  **Verify IP Address**: Before every session, run `ipconfig` (Windows) and update the `API_URL` in `services/ObjectRecognitionService.ts`.
2.  **Start Backend First**: Always run `python main.py` in the `backend/` folder before opening the app.
3.  **Use "Scan QR"**: Always use the Expo Go app to scan the QR code after starting `npx expo start`.

---

## 🚀 Future Roadmap

- **Service Discovery**: Implement a UDP broadcast mechanism so the phone finds the computer automatically.
- **Custom Model**: Train a custom PyTorch model on "Electronic Components" instead of generic ImageNet classes for better X-Ray accuracy.
