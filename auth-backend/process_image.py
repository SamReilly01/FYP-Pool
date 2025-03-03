import cv2
import numpy as np
import sys
import json
import os

# Constants for the game table size
GAME_TABLE_WIDTH = 800
GAME_TABLE_HEIGHT = 400
BALL_RADIUS = 14  # Standardized ball size

def detect_balls(image):
    """Detect balls and return their relative positions."""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Define color ranges for red, yellow, white, and black balls
    ball_ranges = {
        "red": ([0, 100, 100], [10, 255, 255]),
        "yellow": ([20, 100, 100], [30, 255, 255]),
        "white": ([0, 0, 220], [180, 30, 255]),  # Narrow range for white
        "black": ([0, 0, 0], [180, 255, 50])  # Detecting black
    }

    ball_positions = []
    for color, (lower, upper) in ball_ranges.items():
        mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))

        # Find contours of balls
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 200 < area < 1500:  # Ignore very small/large objects
                x, y, w, h = cv2.boundingRect(cnt)
                ball_positions.append({"color": color, "x": x + w // 2, "y": y + h // 2})

    return ball_positions

def process_image(image_path):
    """Process the image and output game-compatible ball positions."""
    image = cv2.imread(image_path)
    if image is None:
        print(json.dumps({"error": f"Image not found at {image_path}"}))
        return

    # Resize to a standard dimension
    TABLE_WIDTH, TABLE_HEIGHT = 800, 600
    image = cv2.resize(image, (TABLE_WIDTH, TABLE_HEIGHT))

    # Detect balls
    ball_positions = detect_balls(image)

    # Map ball positions to the game table scale
    scaled_positions = []
    for ball in ball_positions:
        mapped_x = int((ball["x"] / TABLE_WIDTH) * GAME_TABLE_WIDTH)
        mapped_y = int((ball["y"] / TABLE_HEIGHT) * GAME_TABLE_HEIGHT)
        scaled_positions.append({"color": ball["color"], "x": mapped_x, "y": mapped_y})

    # Create the digital pool table background
    game_table = np.zeros((GAME_TABLE_HEIGHT, GAME_TABLE_WIDTH, 3), dtype=np.uint8)
    game_table[:] = (0, 128, 0)  # Green felt color

    # Draw enhanced pockets (with gold trim and shadow effect)
    pocket_radius = 18
    pockets = [(0, 0), (GAME_TABLE_WIDTH // 2, 0), (GAME_TABLE_WIDTH, 0),
               (0, GAME_TABLE_HEIGHT), (GAME_TABLE_WIDTH // 2, GAME_TABLE_HEIGHT), (GAME_TABLE_WIDTH, GAME_TABLE_HEIGHT)]
    for px, py in pockets:
        cv2.circle(game_table, (px, py), pocket_radius + 5, (170, 120, 0), -1)  # Gold trim
        cv2.circle(game_table, (px, py), pocket_radius, (0, 0, 0), -1)  # Inner pocket shadow

    # Draw balls with better rendering
    for ball in scaled_positions:
        color_map = {
            "red": (0, 0, 255),
            "yellow": (0, 255, 255),
            "white": (255, 255, 255),
            "black": (30, 30, 30)  # Slightly lighter than full black for visibility
        }
        cv2.circle(game_table, (ball["x"], ball["y"]), BALL_RADIUS, color_map[ball["color"]], -1)  # Ball fill
        cv2.circle(game_table, (ball["x"], ball["y"]), BALL_RADIUS, (0, 0, 0), 2)  # Outer black outline

    # Save the processed game table image
    filename = os.path.basename(image_path)
    processed_image_path = os.path.join(os.path.dirname(image_path), f"processed_{filename}")
    cv2.imwrite(processed_image_path, game_table)

    # Send response
    response = {
        "image_url": f"/uploads/processed_{filename}",
        "ball_positions": scaled_positions
    }

    print(json.dumps(response))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    process_image(image_path)
