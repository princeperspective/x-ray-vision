from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
import uvicorn

app = FastAPI()

# Enable CORS to allow requests from the React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔄 Loading MobileNetV2 Model...")
model = MobileNetV2(weights='imagenet')
print("✅ Model Loaded Successfully!")

def process_image(img_data):
    try:
        # Open image using PIL
        img = Image.open(io.BytesIO(img_data)).convert('RGB')
        
        # Resize to 224x224 (required by MobileNetV2)
        img = img.resize((224, 224))
        
        # Convert to array and preprocess
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        
        return img_array
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

@app.get("/")
def read_root():
    return {"status": "online", "message": "Object Recognition API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    print(f"📥 Received file: {file.filename}")
    
    try:
        content = await file.read()
        processed_image = process_image(content)
        
        if processed_image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        # Run inference
        print("🧠 Running inference...")
        predictions = model.predict(processed_image)
        
        # Decode predictions (Top 5)
        decoded_preds = decode_predictions(predictions, top=5)[0]
        
        # Format response
        results = []
        for i, (imagenet_id, label, score) in enumerate(decoded_preds):
            print(f"   {i+1}. {label}: {score:.4f}")
            results.append({
                "className": label.replace("_", " "),
                "probability": float(score)
            })
            
        print("✅ Prediction complete")
        return {"predictions": results}

    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Host 0.0.0.0 is crucial to be accessible from other devices on the network
    uvicorn.run(app, host="0.0.0.0", port=8000)
