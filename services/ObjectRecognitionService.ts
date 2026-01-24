import { Platform } from "react-native";

// Default IP - User will likely need to change this
export const DEFAULT_API_URL = "http://192.168.1.5:8000";

class ObjectRecognitionService {
  private apiUrl: string = DEFAULT_API_URL;

  constructor() {
    console.log("ObjectRecognitionService initialized");
  }

  setApiUrl(url: string) {
    // Ensure no trailing slash
    this.apiUrl = url.replace(/\/$/, "");
    console.log("API URL set to:", this.apiUrl);
  }

  getApiUrl() {
    return this.apiUrl;
  }

  async predict(imageUri: string) {
    const formData = new FormData();

    const filename = imageUri.split("/").pop() || "photo.jpg";
    const type = "image/jpeg";

    // @ts-ignore: React Native FormData
    formData.append("file", {
      uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
      name: filename,
      type: type,
    });

    console.log(`Uploading to ${this.apiUrl}/predict...`);

    try {
      // Race the fetch against a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(`${this.apiUrl}/predict`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Prediction failed:", error);
      if (error.name === "AbortError") {
        throw new Error(
          "Connection timed out. Check if server is running and IP is correct."
        );
      }
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/`);
      return response.status === 200;
    } catch (e) {
      return false;
    }
  }
}

export default new ObjectRecognitionService();
