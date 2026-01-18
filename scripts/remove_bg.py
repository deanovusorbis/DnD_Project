import os
import argparse
from rembg import remove, new_session
from PIL import Image, ImageFilter

def process_image(input_path, output_path=None, session=None):
    if not output_path:
        base, ext = os.path.splitext(input_path)
        output_path = f"{base}_nobg.png"
    
    print(f"Processing: {input_path} -> {output_path}")
    
    try:
        input_image = Image.open(input_path)
        # Remove BG
        out = remove(input_image, session=session)
        out.save(output_path)
        print("Done!")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

def process_directory(directory):
    pass # Unused mostly

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Remove background from images using AI")
    parser.add_argument("path", help="Path to image file or directory")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite original files (Originals will be backed up as .bak)")
    
    args = parser.parse_args()
    
    # Use Anime specialized model
    print("Loading AI Model (isnet-anime)...")
    session = new_session("isnet-anime")

    if os.path.isfile(args.path):
        process_image(args.path, session=session)
    elif os.path.isdir(args.path):
        # Scan and process
        for root, dirs, files in os.walk(args.path):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')) and not file.endswith('.bak'):
                    if file in ['lucrea-turnaround.jpg', 'lucrea-emotions.jpg']:
                        print(f"Skipping excluded file: {file}")
                        continue
                        
                    input_path = os.path.join(root, file)
                    print(f"Processing: {input_path}")
                    
                    try:
                        # Open
                        inp = Image.open(input_path)
                        # Remove BG (Standard)
                        out = remove(inp, session=session)
                        
                        # Post-Process: Erode Alpha Channel to kill white halos
                        try:
                            r, g, b, a = out.split()
                            # MinFilter(3) shrinks the mask by roughly 1px radius
                            print(f"  - Eroding edges to remove white halo...")
                            a = a.filter(ImageFilter.MinFilter(3))
                            out = Image.merge("RGBA", (r, g, b, a))
                        except Exception as e:
                            print(f"  - Erosion failed, skipping: {e}")
                        
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
