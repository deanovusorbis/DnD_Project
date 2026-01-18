import os
import argparse
from rembg import remove
from PIL import Image

def process_image(input_path, output_path=None):
    if not output_path:
        base, ext = os.path.splitext(input_path)
        output_path = f"{base}_nobg.png"
    
    print(f"Processing: {input_path} -> {output_path}")
    
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print("Done!")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

def process_directory(directory):
    print(f"Scanning directory: {directory}")
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                # Skip already processed files if named _nobg
                if '_nobg' in file:
                    continue
                
                input_path = os.path.join(root, file)
                # Overwrite original or create new? 
                # Ideally create a temp folder or just overwrite if user wants.
                # For safety, we will create a backup or suffix.
                # Let's just update IN PLACE if requested, or suffix.
                # User asked to "clean backgrounds". 
                # I will save as same filename but ensure PNG.
                
                # Careful: If I overwrite, I lose original.
                # I'll create a backup folder or just suffix for now.
                # Let's save as `filename.png` (forcing png) after removal.
                
                # output_path = input_path # DANGEROUS
                # Let's try to output to a specific 'processed' folder or just suffix.
                # The user wants to USE them in the app. The app expects specific filenames.
                # So replacing the original is the goal eventually.
                
                # Strategy: 
                # 1. Rename original to .bak
                # 2. Save new with original name.
                pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Remove background from images using AI")
    parser.add_argument("path", help="Path to image file or directory")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite original files (Originals will be backed up as .bak)")
    
    args = parser.parse_args()
    
    if os.path.isfile(args.path):
        process_image(args.path)
    elif os.path.isdir(args.path):
        # Scan and process
        for root, dirs, files in os.walk(args.path):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')) and not file.endswith('.bak'):
                    input_path = os.path.join(root, file)
                    print(f"Processing: {input_path}")
                    
                    try:
                        # Open
                        inp = Image.open(input_path)
                        # Remove BG with Alpha Matting for better edges
                        print(f"  - Removing background (Alpha Matting ON)...")
                        out = remove(
                            inp,
                            alpha_matting=True,
                            alpha_matting_foreground_threshold=240,
                            alpha_matting_background_threshold=10,
                            alpha_matting_erode_size=10
                        )
                        
                        if args.overwrite:
                            # Backup
                            backup_path = input_path + ".bak"
                            if not os.path.exists(backup_path):
                                os.rename(input_path, backup_path)
                            
                            # Save as PNG with same basename
                            base_name = os.path.splitext(input_path)[0]
                            final_path = base_name + ".png"
                            out.save(final_path)
                            print(f"Saved to {final_path}")
                        else:
                            # Save as _nobg
                            base, ext = os.path.splitext(input_path)
                            if "_nobg" not in base:
                                out.save(f"{base}_nobg.png")
                                print(f"Saved to {base}_nobg.png")
                    except Exception as e:
                        print(f"Failed: {e}")
