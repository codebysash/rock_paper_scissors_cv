# Rock Paper Scissors - Hand Gesture Game

A modern web-based Rock Paper Scissors game that uses computer vision to detect hand gestures through your camera. Built with HTML5, CSS3, JavaScript, and MediaPipe Hands.

## 🎮 How to Play

1. **Allow Camera Access**: Grant permission when prompted
2. **Press START**: Begin a new round
3. **Show Your Move**: 
   - ✊ **Rock**: Make a fist
   - ✋ **Paper**: Open your hand flat
   - ✌️ **Scissors**: Show peace sign (index + middle finger)
4. **Count Down**: 3-2-1 timer gives you time to position your hand
5. **First to 3 Wins**: Play until someone reaches 3 points!

## 🚀 Live Demo

Visit the live demo: [Your Vercel URL here]

## 🛠️ Local Development

### Prerequisites
- Modern web browser with camera support
- Python 3.x (for local server)

### Setup
1. Clone this repository
2. Navigate to the project directory
3. Start a local server:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000` in your browser
5. Allow camera access when prompted

## 📱 Mobile Support

The game is fully responsive and optimized for mobile devices:
- Touch-friendly controls
- Responsive layout that adapts to different screen sizes
- Optimized camera handling for mobile browsers
- Works on both iOS Safari and Android Chrome

## 🔧 Technical Features

- **Hand Detection**: Uses MediaPipe Hands for accurate gesture recognition
- **Real-time Processing**: Live camera feed with gesture detection overlay
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Web APIs**: Camera API, Canvas API, async/await patterns
- **Smooth Animations**: CSS transitions and keyframe animations
- **Game Logic**: Faithful recreation of the original Python game mechanics

## 🚀 Deployment to Vercel

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/rock-paper-scissors-cv)

### Manual Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

### Configuration
The project includes:
- `vercel.json` - Vercel deployment configuration
- `package.json` - Project metadata and scripts
- Security headers for camera permissions

## 🎯 Game Rules

- **Rock beats Scissors** ✊ > ✌️
- **Scissors beats Paper** ✌️ > ✋
- **Paper beats Rock** ✋ > ✊
- First player to reach 3 points wins the match
- Invalid gestures are ignored (round continues)

## 🔒 Privacy & Security

- **No Data Storage**: No hand data or images are stored or transmitted
- **Local Processing**: All gesture detection happens in your browser
- **Camera Permissions**: Only requests camera access, no other permissions
- **HTTPS Required**: Secure connection required for camera access in production

## 🌐 Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14.3+)
- **Edge**: Full support

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on different devices
5. Submit a pull request

## 🐛 Troubleshooting

### Camera Not Working?
- Ensure you're accessing via HTTPS (required for camera)
- Check browser permissions for camera access
- Try refreshing the page
- Ensure no other applications are using the camera

### Gesture Detection Issues?
- Ensure good lighting
- Keep hand clearly visible in camera view
- Make distinct gestures (fully closed fist, fully open hand, clear peace sign)
- Avoid partial gestures or quick movements during countdown

### Performance Issues?
- Close other browser tabs using camera/video
- Ensure stable internet connection for MediaPipe resources
- Try refreshing the page to reset camera connection

## 🎨 Customization

Want to customize the game? Key files:
- `style.css` - Visual styling and responsive design
- `script.js` - Game logic and MediaPipe integration
- `Resources/` - Background and AI move images
- `index.html` - HTML structure and layout

Enjoy playing! 🎮
