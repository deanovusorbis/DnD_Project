
import os
from PIL import Image, ImageDraw, ImageOps

# Configuration
SOURCE_IMAGE_PATH = r"C:/Users/aizaw/.gemini/antigravity/brain/404bb3c8-fc91-4b5c-87ea-3b5eeee5fe24/uploaded_image_1768426736012.png"
OUTPUT_DIR = r"C:/Users/aizaw/OneDrive/Desktop/DnD Project/public/img/species"
SPECIES_NAMES = [
    "human", "elf", "dwarf", "gnome", "aasimar",
    "goliath", "dragonborn", "orc", "halfling", "tiefling"
]

def process_image():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    try:
        img = Image.open(SOURCE_IMAGE_PATH).convert("RGBA")
    except Exception as e:
        print(f"Error opening image: {e}")
        return

    width, height = img.size
    cols = 5
    rows = 2
    cell_w = width / cols
    cell_h = height / rows

    print(f"Image size: {width}x{height}, Cell size: {cell_w}x{cell_h}")

    for i, name in enumerate(SPECIES_NAMES):
        row = i // cols
        col = i % cols

        left = col * cell_w
        top = row * cell_h
        right = left + cell_w
        bottom = top + cell_h

        # 1. Initial crop of the cell
        cell = img.crop((left, top, right, bottom))
        
        # 2. Find the bounding box of the non-white content to isolate the circle
        gray = cell.convert("L")
        threshold = 240 # Sensitivity for white background
        
        # We want to identify the icon area, excluding the text at the bottom.
        # Heuristic: The icon is the largest object in the top ~75% of the cell.
        
        icon_search_area_h = int(cell.size[1] * 0.75)
        search_area = cell.crop((0, 0, cell.size[0], icon_search_area_h))
        
        gray_search = search_area.convert("L")
        # Mask: 0 for content (darker than threshold), 255 for background
        search_mask = gray_search.point(lambda p: 0 if p > threshold else 255)
        
        # getbbox returns (left, top, right, bottom) of non-zero regions
        icon_bbox = search_mask.getbbox()
        
        if icon_bbox:
            # Crop the icon from the cell based on this new bbox, relative to search_area
            # But search_area top-left is same as cell top-left
            icon = cell.crop(icon_bbox)
            
            # Make it square to preserve circle aspect ratio if bbox is tight
            w, h = icon.size
            max_dim = max(w, h)
            # Create a square canvas
            square_icon = Image.new('RGBA', (max_dim, max_dim), (255, 255, 255, 0))
            offset_x = (max_dim - w) // 2
            offset_y = (max_dim - h) // 2
            square_icon.paste(icon, (offset_x, offset_y))
            
            # Resize for consistency
            final_size = 256
            final_icon = square_icon.resize((final_size, final_size), Image.Resampling.LANCZOS)
            
            # Create circular mask for transparency
            mask = Image.new('L', (final_size, final_size), 0)
            draw = ImageDraw.Draw(mask)
            # slightly smaller circle to avoid white edges
            draw.ellipse((2, 2, final_size-2, final_size-2), fill=255)
            
            # Apply mask to alpha channel
            final_icon.putalpha(mask)
            
            # Save
            out_path = os.path.join(OUTPUT_DIR, f"{name}.png")
            final_icon.save(out_path)
            print(f"Saved {name}.png")
        else:
            print(f"Could not find icon in cell for {name}")

if __name__ == "__main__":
    process_image()
