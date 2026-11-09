# CLIButter 🥐 (2024 PROJECT) 

A high-performance CLI bot designed to automate pastry pre-orders from Butter & Crumble with maximum speed and reliability.

## Demo

[![CLIButter Demo](https://img.youtube.com/vi/LK_kLhsMldQ/0.jpg)](https://youtu.be/LK_kLhsMldQ)

Watch the bot in action as it efficiently automates the pastry pre-ordering process!

## Features

- 🚀 Lightning-fast execution with parallel browser windows
- 🎯 Smart product detection and automatic cart updates
- 🔊 Terminal bell on successful cart updates
- 🖥️ Organized window management with grid layout
- ⚡ Hardware-accelerated performance
- 🛠️ User-friendly CLI interface
- 💾 Save and load configurations
- 📝 Detailed logging for monitoring

## Prerequisites

- Node.js 16 or higher
- npm
- Chrome/Chromium browser

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jensoncr/clibutter.git
cd clibutter
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

Start the interactive CLI:
```bash
npm run cli
```

The CLI will guide you through:
- Setting up a new bot configuration
- Loading saved configurations
- Managing settings
- Starting the bot

## Configuration

### Saving Configurations

The CLI allows you to save configurations for quick access. Saved configurations include:
- Product URL
- Product name
- Number of concurrent windows
- Headless mode setting
- Timeout settings

## Performance Tips

1. **Window Management**
   - Windows are automatically arranged in a grid layout
   - Each window is sized 400x600 pixels for optimal viewing
   - Hardware acceleration is enabled for better performance

2. **Success Detection**
   - Multiple methods to detect successful cart updates
   - Terminal bell when item is added to cart
   - Cart session is preserved for manual checkout

3. **Best Practices**
   - Start with 1-2 concurrent windows for testing
   - Keep windows visible during testing
   - Save working configurations for quick access
   - Monitor the logs for detailed status updates

## Development

### Project Structure
```
src/
  ├── core/           # Core bot functionality
  ├── utils/          # Utility functions
  └── index.ts        # Main entry point
```

### Building
```bash
# Build the project
npm run build

```

## Troubleshooting

1. **Cart Updates Not Detected**
   - Check if the product name matches exactly
   - Ensure you have a stable internet connection
   - Try increasing the timeout value

2. **Windows Not Displaying**
   - Check if Chrome is installed
   - Ensure you're not in headless mode
   - Verify display resolution settings

3. **Performance Issues**
   - Reduce the number of concurrent windows
   - Close unnecessary browser windows
   - Ensure hardware acceleration is enabled

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT](./LICENSE)

## Disclaimer

This bot is for educational purposes only. Please respect website terms of service and rate limiting policies. 
