import os
from PIL import Image

def compress_images(
    input_folder,
    output_folder=None,
    quality=30,          # Aggressive compression
    max_width=None,
    max_height=None,
    force_webp=True      # Convert everything to WebP for smallest size
):
    """
    Compress images to the smallest possible file size.

    Parameters:
        input_folder (str): Folder containing images.
        output_folder (str): Output folder. If None, overwrite originals.
        quality (int): Lossy quality (lower = smaller files).
        max_width (int): Optional resize max width.
        max_height (int): Optional resize max height.
        force_webp (bool): Convert all images to WebP.
    """

    if output_folder:
        os.makedirs(output_folder, exist_ok=True)

    supported_ext = [".jpg", ".jpeg", ".png", ".webp"]

    for root, _, files in os.walk(input_folder):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in supported_ext:
                continue

            input_path = os.path.join(root, file)
            rel_path = os.path.relpath(root, input_folder)

            if output_folder:
                out_dir = os.path.join(output_folder, rel_path)
                os.makedirs(out_dir, exist_ok=True)
                output_file = os.path.splitext(file)[0] + ".webp"
                output_path = os.path.join(out_dir, output_file)
            else:
                output_path = input_path

            try:
                img = Image.open(input_path)

                # Strip metadata
                img.info.pop("exif", None)
                img.info.pop("icc_profile", None)

                # Resize aggressively if requested
                if max_width or max_height:
                    img.thumbnail(
                        (max_width or img.width, max_height or img.height),
                        Image.LANCZOS
                    )

                # Convert to RGB (required for aggressive compression)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                # Save as WebP (smallest practical format)
                if force_webp:
                    img.save(
                        output_path,
                        "WEBP",
                        quality=quality,
                        method=6,      # Slowest, best compression
                        optimize=True
                    )

                else:
                    # JPEG fallback
                    img.save(
                        output_path,
                        "JPEG",
                        quality=quality,
                        optimize=True,
                        subsampling=2,   # 4:2:0
                        progressive=False
                    )

                print(f"Compressed: {input_path} -> {output_path}")

            except Exception as e:
                print(f"Failed: {input_path} ({e})")


if __name__ == "__main__":
    compress_images(
        input_folder="",
        output_folder="",
        quality=30,
        max_width=1920,
        max_height=1080,
        force_webp=True
    )
