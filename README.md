# QR Code Generator

A zero-dependency QR code generator built entirely with vanilla HTML, CSS, and JavaScript. Generate QR codes instantly in your browser without any external libraries or server requests.

## Features

- **Zero Dependencies**: Built from scratch using only vanilla JavaScript
- **Privacy Focused**: All generation happens client-side - no data leaves your browser
- **Multiple Error Correction Levels**: Low (L), Medium (M), Quartile (Q), High (H)
- **Customizable Size**: Choose from 200×200, 300×300, 400×400, or 500×500 pixels
- **Export Options**: Download as PNG or copy directly to clipboard
- **Debug Panel**: Inspect encoding metadata and copy the matrix as 0/1 values
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Real-time Generation**: QR codes update instantly as you type

## Usage

### Online

Simply open `index.html` in any modern web browser.

### Local Development

1. Clone or download this repository
2. Open `index.html` in your browser
3. Enter text or URL in the input field
4. Select your preferred error correction level and size
5. The QR code will be generated automatically
6. Download as PNG or copy to clipboard

## Debugging

Enable "Show debug info" to view encoding metadata, mask penalties, and a copyable 0/1 matrix grid. The matrix output is useful for comparing against other QR implementations or troubleshooting scan issues.

## Error Correction Levels

- **Low (L)**: 7% error correction - Allows recovery of up to 7% of data
- **Medium (M)**: 15% error correction - Allows recovery of up to 15% of data (default)
- **Quartile (Q)**: 25% error correction - Allows recovery of up to 25% of data
- **High (H)**: 30% error correction - Allows recovery of up to 30% of data

Higher error correction levels result in larger QR codes but are more resilient to damage or obstruction.

## Technical Details

### Supported QR Code Versions

This generator supports QR code versions 1-10, which can encode up to approximately 652 characters (depending on error correction level).

### Implementation

The implementation includes:

- **Data Encoding**: Supports numeric, alphanumeric, and byte modes
- **Error Correction**: Full Reed-Solomon error correction algorithm
- **Matrix Generation**: Complete QR code matrix with:
  - Finder patterns (position detection patterns)
  - Alignment patterns
  - Timing patterns
  - Format information
  - Version information (for larger versions)
- **Masking**: Automatic selection of optimal masking pattern
- **Canvas Rendering**: High-quality PNG output

### Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- HTML5 Canvas API
- Clipboard API (for copy functionality)

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## File Structure

```
.
├── index.html      # Main HTML structure
├── styles.css      # Responsive styling
├── qr-code.js      # QR code generation algorithm
├── app.js          # UI logic and interaction
└── README.md       # Documentation
```

## Code Architecture

### QRCode Class (`qr-code.js`)

Implements the core QR code specification:
- `generate(data, errorLevel)`: Main entry point for QR code generation
- Data encoding for numeric, alphanumeric, and byte modes
- Reed-Solomon error correction calculation
- Matrix construction with all required patterns
- Format and version information encoding

### QRCodeApp Class (`app.js`)

Handles UI interaction:
- Event listeners for input changes
- Canvas rendering
- Download and copy functionality
- Status messages and error handling

## Limitations

- Maximum data length: ~650 characters (varies by error correction level)
- Only supports versions 1-10 of QR code specification
- No support for structured append (splitting data across multiple QR codes)
- No support for micro QR codes

## Future Enhancements

Potential improvements for future versions:
- Support for larger QR code versions (11-40)
- Custom colors for QR codes
- Logo/image overlay support
- Batch generation
- SVG export format

## License

Free to use for personal and commercial projects.

## Credits

Built entirely from scratch following the ISO/IEC 18004 QR Code specification. No external libraries or frameworks were used.
