import os
import io
import torch
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import models, transforms

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up model cache directory
# We set TORCH_HOME so that models are downloaded to our local folder
# instead of the user's home directory.
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model_cache")
os.makedirs(CACHE_DIR, exist_ok=True)
os.environ["TORCH_HOME"] = CACHE_DIR

# Load model
# This will download the weights if not cached
print("Loading MobileNetV2 model...")
try:
    weights = models.MobileNet_V2_Weights.DEFAULT
    model = models.mobilenet_v2(weights=weights)
    model.eval()
    
    # Preprocessing transform defined by the model weights
    preprocess = weights.transforms()
    
    # Class labels
    categories = weights.meta["categories"]
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    # Fallback or exit if model fails
    raise e

@app.get("/")
def read_root():
    return {"status": "active", "model": "MobileNetV2"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        # Handle images
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0) # create a mini-batch

        if torch.cuda.is_available():
            input_batch = input_batch.to('cuda')
            model.to('cuda')

        with torch.no_grad():
            output = model(input_batch)

        # Softmax to get probabilities
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        
        # Get top 3 predictions
        top_prob, top_catid = torch.topk(probabilities, 3)
        
        results = []
        for i in range(top_prob.size(0)):
            results.append({
                "label": categories[top_catid[i]],
                "confidence": float(top_prob[i])
            })
            
        # Simulating "X-Ray" components based on the label
        # Ideally we would map labels to components.
        # For now, we return the label and a mock component list.
        # In a real app, this would query a database.
        primary_match = results[0]["label"]
        components = get_mock_components(primary_match)

        return {
            "predictions": results,
            "xray_components": components
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        return {"error": str(e)}

def get_mock_components(label: str):
    """
    Returns hypothetical internal components based on the object label.
    """
    label = label.lower()
    if "computer" in label or "laptop" in label or "notebook" in label:
        return ["CPU", "RAM", "Battery", "Motherboard", "SSD"]
    elif "phone" in label:
        return ["SoC", "Battery", "Camera Module", "Taptic Engine"]
    elif "bottle" in label:
        return ["Liquid", "Plastic/Glass Shell"]
    elif "mug" in label or "cup" in label:
        return ["Liquid", "Ceramic Structure"]
    else:
        # Generic components
        return ["Internal Structure", "Material Matrix"]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
