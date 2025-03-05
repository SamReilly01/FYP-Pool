import cv2
import numpy as np
import sys
import json
import os

# Constants for the game table size
GAME_TABLE_WIDTH = 800
GAME_TABLE_HEIGHT = 400
BALL_RADIUS = 14  # Standardized ball size

# Custom JSON encoder to handle NumPy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

def detect_table_bounds(image):
    """Detect the pool table boundaries in the image."""
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Find green felt - this is likely the table
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Create a debug directory for saving intermediate images
        debug_dir = "debug"
        if not os.path.exists(debug_dir):
            os.makedirs(debug_dir)
        
        # Use multiple green range detections for better results
        lower_green1 = np.array([35, 25, 25])
        upper_green1 = np.array([90, 255, 255])
        green_mask1 = cv2.inRange(hsv, lower_green1, upper_green1)
        
        # Second green range (lighter greens)
        lower_green2 = np.array([30, 15, 15]) 
        upper_green2 = np.array([100, 255, 255])
        green_mask2 = cv2.inRange(hsv, lower_green2, upper_green2)
        
        # Combine masks
        green_mask = cv2.bitwise_or(green_mask1, green_mask2)
        
        # Save the green mask for debugging
        cv2.imwrite(os.path.join(debug_dir, "green_mask.jpg"), green_mask)
        
        # Apply morphological operations to clean up the mask
        kernel = np.ones((7, 7), np.uint8)
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel)
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours in the green mask
        contours, _ = cv2.findContours(green_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Sort contours by area, largest first
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        
        # If we found green areas, use the largest one as the table
        height, width = image.shape[:2]
        valid_table_bounds = None
        
        for contour in contours[:3]:  # Check the 3 largest contours
            area = cv2.contourArea(contour)
            
            # Skip if too small
            if area < 0.1 * width * height:
                continue
                
            x, y, w, h = cv2.boundingRect(contour)
            
            # Ensure the aspect ratio is reasonable for a pool table (typically ~2:1)
            aspect_ratio = w / h if h > 0 else 0
            
            # Pool tables usually have aspect ratios between 1.5:1 and 2.5:1
            if 1.5 <= aspect_ratio <= 2.5:
                valid_table_bounds = {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
                break
            
        # If no clear table is found via green detection, fall back to using the full image
        if not valid_table_bounds:
            valid_table_bounds = {"x": 0, "y": 0, "width": int(width), "height": int(height)}
        
        # Draw the detected table bounds for debugging
        debug_image = image.copy()
        x, y, w, h = valid_table_bounds["x"], valid_table_bounds["y"], valid_table_bounds["width"], valid_table_bounds["height"]
        cv2.rectangle(debug_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.imwrite(os.path.join(debug_dir, "detected_table.jpg"), debug_image)
        
        return valid_table_bounds
    
    except Exception as e:
        print(f"Error in table detection: {e}", file=sys.stderr)
        
        # If error occurs, use the full image
        height, width = image.shape[:2]
        return {"x": 0, "y": 0, "width": int(width), "height": int(height)}

def detect_balls(image, table_bounds):
    """
    Improved ball detection using techniques from the Jupyter notebooks.
    """
    ball_positions = []
    
    try:
        # Create debug directory
        debug_dir = "debug"
        if not os.path.exists(debug_dir):
            os.makedirs(debug_dir)
            
        # If table bounds are provided, crop the image to focus on the table
        if table_bounds:
            x, y, w, h = table_bounds["x"], table_bounds["y"], table_bounds["width"], table_bounds["height"]
            # Ensure we don't go out of bounds
            x = max(0, x)
            y = max(0, y)
            w = min(w, image.shape[1] - x)
            h = min(h, image.shape[0] - y)
            
            # Crop the image to the table area
            table_image = image[y:y+h, x:x+w].copy()
            
            # Save cropped table for debugging
            cv2.imwrite(os.path.join(debug_dir, "cropped_table.jpg"), table_image)
        else:
            table_image = image.copy()
            x, y = 0, 0
        
        # Prepare a blurred version for more robust detection
        blurred_image = cv2.GaussianBlur(table_image, (5, 5), 0)
        
        # Convert to HSV for better color detection
        hsv_image = cv2.cvtColor(blurred_image, cv2.COLOR_BGR2HSV)
        
        # Define color ranges with broader ranges to handle lighting variations
        # These ranges are based on your Jupyter notebook values
        color_ranges = {
            "red": [
                # Lower red hue range (0-15)
                (np.array([0, 70, 50]), np.array([15, 255, 255])),
                # Upper red hue range (160-180)
                (np.array([160, 70, 50]), np.array([180, 255, 255]))
            ],
            "yellow": [
                (np.array([20, 70, 50]), np.array([40, 255, 255]))
            ],
            "white": [
                (np.array([0, 0, 180]), np.array([180, 40, 255]))
            ],
            "black": [
                (np.array([0, 0, 0]), np.array([180, 255, 60]))
            ]
        }
        
        # Process each color
        color_masks = {}
        combined_mask = np.zeros((table_image.shape[0], table_image.shape[1]), dtype=np.uint8)
        
        for color, ranges in color_ranges.items():
            # Create mask for this color (combine multiple ranges if needed)
            color_mask = np.zeros((table_image.shape[0], table_image.shape[1]), dtype=np.uint8)
            for lower, upper in ranges:
                mask = cv2.inRange(hsv_image, lower, upper)
                color_mask = cv2.bitwise_or(color_mask, mask)
            
            # Clean up the mask
            kernel = np.ones((5, 5), np.uint8)
            color_mask = cv2.morphologyEx(color_mask, cv2.MORPH_CLOSE, kernel)
            color_mask = cv2.morphologyEx(color_mask, cv2.MORPH_OPEN, kernel)
            
            # Save individual color masks for debugging
            cv2.imwrite(os.path.join(debug_dir, f"{color}_mask.jpg"), color_mask)
            
            # Store the mask
            color_masks[color] = color_mask
            combined_mask = cv2.bitwise_or(combined_mask, color_mask)
        
        # Save combined mask
        cv2.imwrite(os.path.join(debug_dir, "combined_mask.jpg"), combined_mask)
        
        # For each color, find contours and identify ball positions
        for color, mask in color_masks.items():
            # Find contours in the mask
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter contours by area and circularity to identify pool balls
            min_area = 150  # Minimum area for a ball
            max_area = 2000  # Maximum area for a ball
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if min_area <= area <= max_area:
                    # Calculate circularity
                    perimeter = cv2.arcLength(contour, True)
                    circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0
                    
                    # Only consider circular shapes (balls)
                    if circularity > 0.5:  # More circular objects have values closer to 1
                        # Get the center of the ball
                        moments = cv2.moments(contour)
                        if moments["m00"] != 0:
                            cx = int(moments["m10"] / moments["m00"])
                            cy = int(moments["m01"] / moments["m00"])
                            
                            # Check if this ball overlaps with any already detected (to avoid duplicates)
                            is_duplicate = False
                            for existing_ball in ball_positions:
                                dist = np.sqrt((cx - (existing_ball["x"] - x))**2 + (cy - (existing_ball["y"] - y))**2)
                                if dist < 20:  # If centers are close, consider it a duplicate
                                    is_duplicate = True
                                    break
                            
                            if not is_duplicate:
                                # Add ball position, adjusting for table cropping
                                ball_positions.append({
                                    "color": color,
                                    "x": int(cx + x),
                                    "y": int(cy + y),
                                    "area": int(area),
                                    "circularity": float(circularity)
                                })
        
        # Also use Hough Circles to detect balls as in your Jupyter notebooks
        gray = cv2.cvtColor(blurred_image, cv2.COLOR_BGR2GRAY)
        
        # Try multiple parameter sets for better circle detection
        circle_params = [
            # dp, minDist, param1, param2, minRadius, maxRadius
            (1, 20, 50, 30, 8, 25),  # More sensitive
            (1.5, 30, 70, 40, 10, 30)  # Less sensitive, larger circles
        ]
        
        hough_circles = []
        for dp, min_dist, p1, p2, min_r, max_r in circle_params:
            try:
                circles = cv2.HoughCircles(
                    gray, cv2.HOUGH_GRADIENT, dp=dp, minDist=min_dist,
                    param1=p1, param2=p2, minRadius=min_r, maxRadius=max_r
                )
                
                if circles is not None:
                    circles = np.uint16(np.around(circles[0]))
                    hough_circles.extend(circles)
            except Exception as e:
                print(f"Error with Hough Circle parameters: {e}", file=sys.stderr)
        
        # Process detected Hough circles
        for circle in hough_circles:
            cx, cy, radius = circle
            
            # Only process circles within image bounds
            if cx >= 0 and cx < table_image.shape[1] and cy >= 0 and cy < table_image.shape[0]:
                # Check if this circle overlaps with an already detected ball
                is_duplicate = False
                for existing_ball in ball_positions:
                    dist = np.sqrt((cx - (existing_ball["x"] - x))**2 + (cy - (existing_ball["y"] - y))**2)
                    if dist < 20:  # If centers are close, consider it a duplicate
                        is_duplicate = True
                        break
                
                if not is_duplicate:
                    # Determine color by sampling the center pixel in HSV
                    center_hsv = hsv_image[cy, cx]
                    
                    # Simple color classification logic
                    ball_color = "unknown"
                    
                    # White: Low saturation, high value
                    if center_hsv[1] < 30 and center_hsv[2] > 180:
                        ball_color = "white"
                    # Black: Low value
                    elif center_hsv[2] < 50:
                        ball_color = "black"
                    # Red: Hue near 0 or 180 with high saturation
                    elif (0 <= center_hsv[0] <= 10 or 160 <= center_hsv[0] <= 180) and center_hsv[1] > 70:
                        ball_color = "red"
                    # Yellow: Hue around 25-30 with high saturation
                    elif 15 <= center_hsv[0] <= 35 and center_hsv[1] > 70:
                        ball_color = "yellow"
                    
                    if ball_color != "unknown":
                        ball_positions.append({
                            "color": ball_color,
                            "x": int(cx + x),
                            "y": int(cy + y),
                            "radius": int(radius),
                            "confidence": 0.7  # Medium confidence for Hough circle detection
                        })
        
        # Visualize detected balls for debugging
        balls_debug_image = image.copy()
        for ball in ball_positions:
            color_bgr = (0, 0, 255) if ball["color"] == "red" else \
                       (0, 255, 255) if ball["color"] == "yellow" else \
                       (255, 255, 255) if ball["color"] == "white" else \
                       (0, 0, 0)
            
            # Draw circle at ball position
            cv2.circle(balls_debug_image, (ball["x"], ball["y"]), 15, color_bgr, 2)
            # Mark center
            cv2.circle(balls_debug_image, (ball["x"], ball["y"]), 2, (0, 0, 255), -1)
        
        cv2.imwrite(os.path.join(debug_dir, "detected_balls.jpg"), balls_debug_image)
        
        # Define standard counts for different ball colors
        target_counts = {
            "red": 7,      # Red balls
            "yellow": 7,   # Yellow balls
            "white": 1,    # Cue ball
            "black": 1     # 8-ball
        }
        
        # Ensure we have at least some balls of each color
        # If detection failed to find any balls of a particular color, add synthetic ones
        for color, target in target_counts.items():
            current_count = len([b for b in ball_positions if b["color"] == color])
            
            if current_count < 1:  # At least have one of each color
                # Add synthetic ball
                if color == "white":
                    # White ball usually in the bottom right
                    ball_positions.append({
                        "color": color,
                        "x": int(table_bounds["x"] + table_bounds["width"] * 0.75),
                        "y": int(table_bounds["y"] + table_bounds["height"] * 0.5),
                        "synthetic": True
                    })
                elif color == "black":
                    # Black ball often in the top center
                    ball_positions.append({
                        "color": color,
                        "x": int(table_bounds["x"] + table_bounds["width"] * 0.5),
                        "y": int(table_bounds["y"] + table_bounds["height"] * 0.25),
                        "synthetic": True
                    })
                else:
                    # Add at least one ball of the color
                    pos_x = int(table_bounds["x"] + table_bounds["width"] * (0.3 if color == "red" else 0.7))
                    pos_y = int(table_bounds["y"] + table_bounds["height"] * 0.5)
                    ball_positions.append({
                        "color": color,
                        "x": pos_x,
                        "y": pos_y,
                        "synthetic": True
                    })
        
        return ball_positions
    
    except Exception as e:
        print(f"Error in ball detection: {e}", file=sys.stderr)
        return []

def create_fancy_table(width, height):
    """Create a realistic pool table image."""
    try:
        # Create basic table with green felt
        table = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Green felt
        felt_color = (32, 120, 40)  # BGR
        table[:, :] = felt_color
        
        # Add subtle texture to the felt
        noise = np.random.randint(-10, 10, (height, width), dtype=np.int8)
        for c in range(3):
            table[:, :, c] = np.clip(table[:, :, c] + noise, 0, 255)
        
        # Wooden rail (brown border)
        rail_thickness = int(min(width, height) * 0.075)  # 7.5% of the smaller dimension
        border_color = (40, 80, 135)  # Dark wood color (BGR)
        
        # Draw the rails (borders)
        table[0:rail_thickness, :] = border_color  # Top rail
        table[height-rail_thickness:height, :] = border_color  # Bottom rail
        table[:, 0:rail_thickness] = border_color  # Left rail
        table[:, width-rail_thickness:width] = border_color  # Right rail
        
        # Add pockets
        pocket_radius = int(min(width, height) * 0.05)  # 5% of the smaller dimension
        pocket_positions = [
            (rail_thickness, rail_thickness),               # Top-left
            (width//2, rail_thickness//2),                  # Top-middle
            (width-rail_thickness, rail_thickness),         # Top-right
            (rail_thickness, height-rail_thickness),        # Bottom-left
            (width//2, height-rail_thickness//2),           # Bottom-middle
            (width-rail_thickness, height-rail_thickness)   # Bottom-right
        ]
        
        # Draw pockets
        for cx, cy in pocket_positions:
            # Gold trim
            gold_color = (0, 165, 215)  # BGR (gold-like color)
            cv2.circle(table, (cx, cy), pocket_radius + 8, gold_color, -1)
            
            # Black hole
            cv2.circle(table, (cx, cy), pocket_radius, (0, 0, 0), -1)
        
        return table
    except Exception as e:
        print(f"Error creating table: {e}", file=sys.stderr)
        # Return a simple green table as fallback
        table = np.zeros((height, width, 3), dtype=np.uint8)
        table[:, :] = (40, 120, 40)  # Simple green
        return table

def render_ball(table_image, x, y, color, ball_radius=BALL_RADIUS, ball_number=None):
    """Render a pool ball with realistic 3D effects on the table image."""
    try:
        # Define ball colors with BGR format
        color_map = {
            "red": (0, 0, 220),       # Red ball
            "yellow": (0, 220, 255),  # Yellow ball
            "white": (255, 255, 255), # White (cue) ball
            "black": (0, 0, 0),       # Black (8) ball
        }
        
        # Get the ball color from the map
        ball_color = color_map.get(color, (200, 200, 200))
        
        # Draw main ball
        cv2.circle(table_image, (x, y), ball_radius, ball_color, -1)
        
        # Add highlight (makes ball look 3D)
        highlight_offset = ball_radius // 3
        highlight_radius = ball_radius // 3
        highlight_pos = (x - highlight_offset, y - highlight_offset)
        
        # Draw highlight with transparency effect
        overlay = table_image.copy()
        cv2.circle(overlay, highlight_pos, highlight_radius, (255, 255, 255), -1)
        cv2.addWeighted(overlay, 0.5, table_image, 0.5, 0, table_image)
        
        # Add ball number for red and yellow balls
        if (color == "red" or color == "yellow") and ball_number is not None:
            # Draw white circle for number
            number_radius = ball_radius // 2
            number_bg_color = (255, 255, 255) if color == "red" else (240, 240, 240)
            number_fg_color = (0, 0, 0) if color == "yellow" else (255, 0, 0)
            
            # Draw white circle for number
            cv2.circle(table_image, (x, y), number_radius, number_bg_color, -1)
            
            # Draw number (as text)
            font = cv2.FONT_HERSHEY_SIMPLEX
            text = str(ball_number)
            
            # Calculate text size and position to center it
            text_size, _ = cv2.getTextSize(text, font, 0.5, 1)
            text_x = x - text_size[0] // 2
            text_y = y + text_size[1] // 2
            cv2.putText(table_image, text, (text_x, text_y), font, 0.5, number_fg_color, 1, cv2.LINE_AA)
        
    except Exception as e:
        print(f"Error rendering ball: {e}", file=sys.stderr)

def process_image(image_path):
    """Process the image and output game-compatible ball positions."""
    try:
        # Create debug directory
        debug_dir = "debug"
        if not os.path.exists(debug_dir):
            os.makedirs(debug_dir)
            
        # Load the image
        image = cv2.imread(image_path)
        if image is None:
            error_msg = {"error": f"Image not found at {image_path}"}
            print(json.dumps(error_msg))
            return

        # Get original image dimensions
        original_height, original_width = image.shape[:2]
        
        # Store original dimensions for the frontend
        original_dimensions = {
            "width": int(original_width),
            "height": int(original_height)
        }
        
        # Save original image for debugging
        cv2.imwrite(os.path.join(debug_dir, "original_image.jpg"), image)
        
        # Detect table bounds in the original image
        table_bounds = detect_table_bounds(image)
        
        # Detect balls with improved algorithm based on Jupyter notebooks
        original_ball_positions = detect_balls(image, table_bounds)
        
        # Create the fancy pool table background
        game_table = create_fancy_table(GAME_TABLE_WIDTH, GAME_TABLE_HEIGHT)
        
        # Map ball positions to the game table scale and render them
        game_ball_positions = []
        
        # Assign numbers to red and yellow balls
        red_count = 1
        yellow_count = 1
        
        for i, ball in enumerate(original_ball_positions):
            try:
                # Skip balls outside the table bounds
                if ball["x"] < table_bounds["x"] or ball["x"] > table_bounds["x"] + table_bounds["width"] or \
                   ball["y"] < table_bounds["y"] or ball["y"] > table_bounds["y"] + table_bounds["height"]:
                    continue
                    
                # Map from original image to game table coordinates
                # Using relative positioning to handle different aspect ratios
                relative_x = (ball["x"] - table_bounds["x"]) / table_bounds["width"]
                relative_y = (ball["y"] - table_bounds["y"]) / table_bounds["height"]
                
                mapped_x = int(relative_x * GAME_TABLE_WIDTH)
                mapped_y = int(relative_y * GAME_TABLE_HEIGHT)
                
                # Ensure coordinates are within the game table
                mapped_x = max(BALL_RADIUS + 5, min(GAME_TABLE_WIDTH - BALL_RADIUS - 5, mapped_x))
                mapped_y = max(BALL_RADIUS + 5, min(GAME_TABLE_HEIGHT - BALL_RADIUS - 5, mapped_y))
                
                # Assign ball numbers for red and yellow
                ball_number = None
                if ball["color"] == "red":
                    ball_number = red_count
                    red_count += 1
                elif ball["color"] == "yellow":
                    ball_number = yellow_count
                    yellow_count += 1
                
                # Add to game ball positions
                game_ball_positions.append({
                    "color": ball["color"], 
                    "x": int(mapped_x), 
                    "y": int(mapped_y),
                    "number": ball_number,
                    "originalX": int(ball["x"]),
                    "originalY": int(ball["y"]),
                })
                
                # Render the ball on the game table
                render_ball(game_table, mapped_x, mapped_y, ball["color"], BALL_RADIUS, ball_number)
                
            except Exception as e:
                print(f"Error processing ball {i}: {e}", file=sys.stderr)
                continue

        # Save the processed game table image
        filename = os.path.basename(image_path)
        processed_image_path = os.path.join(os.path.dirname(image_path), f"processed_{filename}")
        cv2.imwrite(processed_image_path, game_table)
        
        # Create mapping visualization for debugging
        mapping_debug = np.concatenate((cv2.resize(image, (GAME_TABLE_WIDTH, GAME_TABLE_HEIGHT)), game_table), axis=1)
        for ball in original_ball_positions:
            # Draw original position on left side
            rel_x = (ball["x"] - table_bounds["x"]) / table_bounds["width"] * GAME_TABLE_WIDTH
            rel_y = (ball["y"] - table_bounds["y"]) / table_bounds["height"] * GAME_TABLE_HEIGHT
            cv2.circle(mapping_debug, (int(rel_x), int(rel_y)), 5, (0, 0, 255), -1)
            
            # Find corresponding mapped ball
            for mapped_ball in game_ball_positions:
                if mapped_ball["originalX"] == ball["x"] and mapped_ball["originalY"] == ball["y"]:
                    # Draw line showing the mapping
                    cv2.line(mapping_debug, (int(rel_x), int(rel_y)), 
                             (GAME_TABLE_WIDTH + mapped_ball["x"], mapped_ball["y"]), (0, 255, 0), 1)
                    break
        
        cv2.imwrite(os.path.join(debug_dir, "mapping_debug.jpg"), mapping_debug)
        
        # Prepare response with all necessary information
        response = {
            "image_url": f"/uploads/processed_{filename}",
            "ball_positions": game_ball_positions,
            "original_dimensions": original_dimensions,
            "table_bounds": {
                "x": int(table_bounds["x"]),
                "y": int(table_bounds["y"]),
                "width": int(table_bounds["width"]),
                "height": int(table_bounds["height"])
            }
        }

        # Use the custom encoder to handle NumPy types
        print(json.dumps(response, cls=NumpyEncoder))
    except Exception as e:
        # Return error information - make sure no NumPy types are included
        error_response = {
            "error": f"Error processing image: {str(e)}",
            "image_url": None,
            "ball_positions": [],
            "original_dimensions": {"width": 800, "height": 400},
            "table_bounds": {"x": 0, "y": 0, "width": 800, "height": 400}
        }
        print(json.dumps(error_response))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    process_image(image_path)