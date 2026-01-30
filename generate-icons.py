#!/usr/bin/env python3
"""
PWA Icon Generator
Generates PNG icons for PWA from SVG
Requires: pip install cairosvg pillow
"""

import os

# Icon sizes needed for PWA
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# SVG content for the icon
SVG_CONTENT = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a"/>
      <stop offset="100%" style="stop-color:#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#grad)"/>
  <text x="50" y="68" font-family="Arial, sans-serif" font-size="50" font-weight="bold" fill="white" text-anchor="middle">V</text>
</svg>'''

def generate_icons():
    try:
        import cairosvg
        from PIL import Image
        import io

        # Create icons directory
        icons_dir = os.path.join(os.path.dirname(__file__), 'public', 'icons')
        os.makedirs(icons_dir, exist_ok=True)

        for size in SIZES:
            # Convert SVG to PNG
            png_data = cairosvg.svg2png(
                bytestring=SVG_CONTENT.encode(),
                output_width=size,
                output_height=size
            )

            # Save the icon
            output_path = os.path.join(icons_dir, f'icon-{size}x{size}.png')
            with open(output_path, 'wb') as f:
                f.write(png_data)

            print(f'Generated: icon-{size}x{size}.png')

        print('\nAll icons generated successfully!')

    except ImportError:
        print('Required packages not installed.')
        print('Install with: pip install cairosvg pillow')
        print('\nAlternatively, you can generate icons online:')
        print('https://www.pwabuilder.com/imageGenerator')
        generate_fallback_icons()

def generate_fallback_icons():
    """Generate simple placeholder icons using pure Python"""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print('PIL not available. Please install: pip install pillow')
        return

    icons_dir = os.path.join(os.path.dirname(__file__), 'public', 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    for size in SIZES:
        # Create a new image with gradient-like background
        img = Image.new('RGB', (size, size), '#1e3a8a')
        draw = ImageDraw.Draw(img)

        # Draw rounded rectangle effect
        draw.rectangle([0, 0, size, size], fill='#1e3a8a')

        # Draw the letter V
        try:
            font_size = int(size * 0.5)
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()

        text = "V"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        x = (size - text_width) / 2
        y = (size - text_height) / 2 - bbox[1]

        draw.text((x, y), text, fill='white', font=font)

        # Save
        output_path = os.path.join(icons_dir, f'icon-{size}x{size}.png')
        img.save(output_path, 'PNG')
        print(f'Generated (fallback): icon-{size}x{size}.png')

    print('\nFallback icons generated!')

if __name__ == '__main__':
    generate_icons()
