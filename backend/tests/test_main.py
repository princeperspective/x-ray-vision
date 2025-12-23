import os
import io
import sys
from fastapi.testclient import TestClient
from PIL import Image

# Add the project root to sys.path so we can import backend.main
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.main import app

client = TestClient(app)

def test_read_main():
    """Test the root endpoint to ensure server is running."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "online", "message": "Object Recognition API (PyTorch) is running"}

def test_predict_image():
    """Test object recognition with a generated dummy image."""
    # Create a simple red square image
    img = Image.new('RGB', (224, 224), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    # Upload
    files = {'file': ('test.jpg', img_byte_arr, 'image/jpeg')}
    response = client.post("/predict", files=files)
    
    assert response.status_code == 200
    data = response.json()
    
    # Validation
    assert "predictions" in data
    assert len(data["predictions"]) > 0
    top_prediction = data["predictions"][0]
    assert "className" in top_prediction
    assert "probability" in top_prediction
    print(f"Test Prediction: {top_prediction['className']} ({top_prediction['probability']:.2f})")

def test_predict_invalid_file():
    """Test that the server handles invalid files correctly."""
    files = {'file': ('test.txt', io.BytesIO(b"This is not an image"), 'text/plain')}
    response = client.post("/predict", files=files)
    assert response.status_code == 400
