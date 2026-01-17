# PWA Icons

To generate the PWA icons from the Logo.png file, run these commands in the terminal:

```bash
# Navigate to the project root
cd "/Users/daniel/Documents/Cursor/Col Businesses/la-eterna-salsa"

# Create icons using sips (macOS built-in tool)
sips -z 192 192 public/Logo.png --out public/icons/icon-192.png
sips -z 512 512 public/Logo.png --out public/icons/icon-512.png
sips -z 180 180 public/Logo.png --out public/icons/apple-touch-icon.png
```

Alternatively, you can use an online tool like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Upload the `public/Logo.png` file and download the generated icons to this directory.

## Required Icons

- `icon-192.png` - 192x192px (Android)
- `icon-512.png` - 512x512px (Android)
- `apple-touch-icon.png` - 180x180px (iOS)
