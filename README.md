# Crystal Hero - 3D Crystal Obelisk Scroll Experience

A beautiful 3D crystal obelisk that rotates smoothly as you scroll, featuring realistic materials, lighting effects, and fallback geometry for reliability.

## 🎯 Features

- **3D Crystal Obelisk**: Loads your custom GLB file with crystal shaders
- **Scroll-to-Rotation**: Smooth mapping between scroll position and obelisk rotation
- **Enhanced Lighting**: Multiple light sources for realistic crystal effects
- **Fallback System**: Beautiful default crystal if GLB file is missing
- **Responsive Design**: Works on all screen sizes
- **Error Handling**: Graceful degradation and helpful status messages

## 📁 File Structure

```
Crystal Hero/
├── scroll_rotating_obelisk.html    # Main application
├── test_obelisk.html               # Simplified test version
├── README.md                       # This file
└── obelisktransparent-crystalshaderscript.glb  # Your 3D model (add this)
```

## 🚀 Quick Start

1. **Add your 3D model**: Place `obelisktransparent-crystalshaderscript.glb` in this folder
2. **Start the server**: The HTTP server is already running on port 8000
3. **Open in browser**: Visit `http://localhost:8000/scroll_rotating_obelisk.html`
4. **Scroll to rotate**: The crystal obelisk will rotate smoothly as you scroll

## 🎨 Customization

### Using Your Own GLB File
- Rename your GLB file to `obelisktransparent-crystalshaderscript.glb`
- Or modify the file path in the HTML file (line 268)
- The model will maintain all materials, textures, and transparency effects

### Adjusting Rotation
- Modify the rotation speed by changing the multiplier in `updateObeliskRotation()`
- Adjust the oscillation by modifying the `Math.sin()` parameters

### Lighting Effects
- Add or modify lights in the `initThreeJS()` function
- Adjust material properties for different crystal effects

## 🔧 Technical Details

- **Three.js r158**: Latest stable version for compatibility
- **WebGL**: Hardware-accelerated 3D rendering
- **GLTFLoader**: For loading GLB/GLTF files
- **MeshPhysicalMaterial**: Advanced materials with transmission and refraction
- **Responsive Design**: Adapts to any screen size

## 📱 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🐛 Troubleshooting

### Model Not Loading
- Check that the GLB file is in the correct location
- Verify the file name matches exactly
- Check browser console for error messages
- The fallback crystal will display if loading fails

### Performance Issues
- Reduce model complexity if needed
- Lower the pixel ratio for better performance
- Check that WebGL is supported in your browser

### Visual Issues
- Ensure your GLB file has proper materials
- Check that transparency is enabled in your 3D software
- Verify lighting setup in your original model

## 🎮 Controls

- **Scroll**: Rotate the obelisk
- **Mouse Move**: Slight camera movement for depth
- **Resize**: Automatically adapts to window size

## 📄 License

This project is open source and available for personal and commercial use.

---

**Enjoy your Crystal Hero experience!** ✨💎
