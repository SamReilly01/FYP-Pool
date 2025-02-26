import cv2
import numpy as np
import sys
import json
import os

def process_image(image_path):
    image = cv2.imread(image_path)

    if image is None:
        print(json.dumps({"error": f"Image not found at {image_path}"}))
        return

    # Resize image
    processed_image = cv2.resize(image, (800, 600))

    # Construct the processed image filename
    filename = os.path.basename(image_path)  # Extract filename from path
    processed_image_path = os.path.join(os.path.dirname(image_path), f"processed_{filename}")

    # Save processed image
    cv2.imwrite(processed_image_path, processed_image)

    ball_positions = [
        {"color": "red", "x": 100, "y": 150},
        {"color": "yellow", "x": 200, "y": 250},
    ]

    response = {
        "image_url": f"/uploads/processed_{filename}",
        "ball_positions": ball_positions
    }

    print(json.dumps(response))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    process_image(image_path)
