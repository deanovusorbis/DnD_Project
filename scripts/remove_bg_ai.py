"""
AI-based background removal for character sprites using rembg.
More effective for complex edges like cloaks and hats.
"""
import os
from rembg import remove
from PIL import Image
import io

def process_sprite(input_path, output_path=None):
    """Remove background from a single sprite using AI"""
    if output_path is None:
        output_path = input_path
    
    print(f"Processing: {input_path}")
    
    # Read original image
    with open(input_path, 'rb') as f:
        input_data = f.read()
    
    # Remove background using AI
    output_data = remove(input_data)
    
    # Save result
    with open(output_path, 'wb') as f:
        f.write(output_data)
    
    print(f"Saved: {output_path}")

def process_directory(directory):
    """Process all PNG files in a directory"""
    for filename in os.listdir(directory):
        if filename.endswith('.png') and not filename.endswith('.bak'):
            filepath = os.path.join(directory, filename)
            process_sprite(filepath)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        path = sys.argv[1]
        if os.path.isfile(path):
            process_sprite(path)
        elif os.path.isdir(path):
            process_directory(path)
        else:
            print(f"Path not found: {path}")
    else:
        print("Usage: python remove_bg_ai.py <path>")
