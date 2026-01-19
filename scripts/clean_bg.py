import os
import argparse
from PIL import Image
import numpy as np

def clean_white_background(image_path, output_path=None, threshold=240):
    """
    Aggressively remove white/light gray background from images.
    Works better for dark-clothed characters with fine details like cloaks.
    """
    if not output_path:
        output_path = image_path
    
    print(f"Processing: {image_path}")
    
    # Open image
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)
    
    # Get RGB channels
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Find pixels that are white/light gray (all RGB values above threshold)
    # This catches the checkerboard pattern and white areas
    white_mask = (r > threshold) & (g > threshold) & (b > threshold)
    
    # Also catch gray checkerboard pattern (alternating ~204 and ~255)
    gray_mask = (r > 180) & (g > 180) & (b > 180) & (r == g) & (g == b)
    
    # Combine masks
    bg_mask = white_mask | gray_mask
    
    # Set alpha to 0 for background pixels
    data[:,:,3] = np.where(bg_mask, 0, a)
    
    # Create result image
    result = Image.fromarray(data)
    result.save(output_path)
    print(f"Saved: {output_path}")

def process_directory(directory, threshold=240):
    """Process all PNG files in directory"""
    for filename in os.listdir(directory):
        if filename.endswith('.png') and not filename.endswith('.bak'):
            filepath = os.path.join(directory, filename)
            clean_white_background(filepath, threshold=threshold)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean white/gray background from images")
    parser.add_argument("path", help="Path to image file or directory")
    parser.add_argument("--threshold", type=int, default=240, help="RGB threshold for white detection (default: 240)")
    
    args = parser.parse_args()
    
    if os.path.isfile(args.path):
        clean_white_background(args.path, threshold=args.threshold)
    elif os.path.isdir(args.path):
        process_directory(args.path, threshold=args.threshold)
    else:
        print(f"Path not found: {args.path}")
