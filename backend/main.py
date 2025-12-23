from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
from torchvision import models, transforms
from PIL import Image
import io
import uvicorn
import json
import urllib.request

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔄 Loading PyTorch MobileNetV2 Model...")
# Use default weights (IMAGENET1K_V1)
weights = models.MobileNet_V2_Weights.IMAGENET1K_V1
model = models.mobilenet_v2(weights=weights)
model.eval() # Set to evaluation mode
print("✅ Model Loaded Successfully!")

# Load ImageNet Class labels
print("🔄 Loading ImageNet Class labels...")
class_idx = json.load(urllib.request.urlopen("https://s3.amazonaws.com/deep-learning-models/image-models/imagenet_class_index.json"))
labels = {int(key): value[1] for key, value in class_idx.items()}
print("✅ Labels Loaded!")

# Image preprocessing transform
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def process_image(img_data):
    try:
        img = Image.open(io.BytesIO(img_data)).convert('RGB')
        input_tensor = preprocess(img)
        input_batch = input_tensor.unsqueeze(0) # Create a mini-batch as expected by the model
        return input_batch
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

@app.get("/")
def read_root():
    return {"status": "online", "message": "Object Recognition API (PyTorch) is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    print(f"📥 Received file: {file.filename}")
    
    try:
        content = await file.read()
        input_batch = process_image(content)
        
        if input_batch is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        # Run inference
        print("🧠 Running inference...")
        with torch.no_grad():
            output = model(input_batch)
        
        # Get probabilities
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        
        # Get top 5 predictions
        top5_prob, top5_catid = torch.topk(probabilities, 5)
        
        results = []
        for i in range(5):
            score = top5_prob[i].item()
            class_id = top5_catid[i].item()
            label = labels[class_id]
            
            print(f"   {i+1}. {label}: {score:.4f}")
            results.append({
                "className": label.replace("_", " "),
                "probability": float(score)
            })
            
        print("✅ Prediction complete")
        return {"predictions": results}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
