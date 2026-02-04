class QRCodeApp {
    constructor() {
        this.qrCode = new QRCode();
        this.canvas = document.getElementById('qrCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dataInput = document.getElementById('dataInput');
        this.errorLevel = document.getElementById('errorLevel');
        this.size = document.getElementById('size');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.placeholder = document.getElementById('placeholder');
        this.status = document.getElementById('status');
        this.debugToggle = document.getElementById('debugToggle');
        this.debugPanel = document.getElementById('debugPanel');
        this.debugInfo = document.getElementById('debugInfo');
        this.matrixOutput = document.getElementById('matrixOutput');
        this.copyMatrixBtn = document.getElementById('copyMatrixBtn');
        
        this.init();
    }

    init() {
        this.dataInput.addEventListener('input', () => this.generateQR());
        this.errorLevel.addEventListener('change', () => this.generateQR());
        this.size.addEventListener('change', () => this.generateQR());
        this.downloadBtn.addEventListener('click', () => this.downloadQR());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.debugToggle.addEventListener('change', () => this.toggleDebugPanel());
        this.copyMatrixBtn.addEventListener('click', () => this.copyMatrixToClipboard());
        this.toggleDebugPanel();
        
        this.generateQR();
    }

    generateQR() {
        const data = this.dataInput.value.trim();
        const errorLevel = this.errorLevel.value;
        const size = parseInt(this.size.value);
        
        if (!data) {
            this.showPlaceholder();
            this.clearDebugInfo();
            return;
        }

        try {
            this.showStatus('Generating...');
            
            setTimeout(() => {
                try {
                    const { matrix, debug } = this.qrCode.generate(data, errorLevel);
                    this.renderQR(matrix, size);
                    this.displayDebugInfo(matrix, debug);
                    this.hidePlaceholder();
                    this.enableButtons();
                    this.showStatus('QR code generated successfully!', 'success');
                    setTimeout(() => this.hideStatus(), 2000);
                } catch (error) {
                    console.error('QR generation error:', error);
                    this.showStatus('Error: Text too long. Please use shorter text.', 'error');
                }
            }, 10);
        } catch (error) {
            console.error('QR generation error:', error);
            this.showStatus('Error: Text too long. Please use shorter text.', 'error');
        }
    }

    renderQR(matrix, size) {
        const moduleSize = Math.floor(size / matrix.length);
        const qrSize = moduleSize * matrix.length;
        
        this.canvas.width = qrSize;
        this.canvas.height = qrSize;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, qrSize, qrSize);
        
        this.ctx.fillStyle = '#000000';
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix.length; x++) {
                if (matrix[y][x] === 1) {
                    this.ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
                }
            }
        }
    }

    toggleDebugPanel() {
        this.debugPanel.style.display = this.debugToggle.checked ? 'flex' : 'none';
    }

    displayDebugInfo(matrix, debug) {
        if (!debug) return;

        const padBytesDisplay = debug.padBytesUsed.length
            ? debug.padBytesUsed.map((byte) => `0x${byte.toString(16).padStart(2, '0')}`).join(', ')
            : 'None';

        const infoLines = [
            `Mode: ${debug.modeName} (${debug.mode})`,
            `Mode bits: ${debug.modeBits}`,
            `Version: ${debug.version}`,
            `Error correction: ${debug.errorLevel}`,
            `Matrix size: ${debug.matrixSize}x${debug.matrixSize}`,
            `Char count (${debug.charCountBits} bits): ${debug.charCountValueBits}`,
            `Data payload bits: ${debug.dataPayloadBitsLength}`,
            `Bits before padding: ${debug.dataBitsBeforePadding}/${debug.capacityBits}`,
            `Terminator bits added: ${debug.terminatorBitsAdded}`,
            `Pad-to-byte bits added: ${debug.padToByteBits}`,
            `Pad bytes: ${padBytesDisplay}`,
            `Final data bits: ${debug.dataBitsLength}/${debug.capacityBits}`,
            `Data codewords: ${debug.dataCodewords}`,
            `EC codewords: ${debug.ecCodewords}`,
            `Total codewords: ${debug.totalCodewords}`,
            `Mask pattern: ${debug.maskPattern}`,
            `Format bits: ${debug.formatBits}`,
            `Mask penalties: ${debug.maskPenalties.join(', ')}`
        ];

        this.debugInfo.textContent = infoLines.join('\n');
        this.matrixOutput.value = this.matrixToString(matrix);

        if (this.debugToggle.checked) {
            this.debugPanel.style.display = 'flex';
        }

        console.debug('[QR] Matrix\n' + this.matrixOutput.value);
    }

    matrixToString(matrix) {
        return matrix.map(row => row.map(cell => (cell === 1 ? '1' : '0')).join('')).join('\n');
    }

    clearDebugInfo() {
        this.debugInfo.textContent = '';
        this.matrixOutput.value = '';
    }

    async copyMatrixToClipboard() {
        try {
            if (!this.matrixOutput.value) {
                this.showStatus('No matrix data to copy.', 'error');
                return;
            }
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                this.showStatus('Clipboard not supported in this browser', 'error');
                return;
            }
            await navigator.clipboard.writeText(this.matrixOutput.value);
            this.showStatus('Matrix copied to clipboard!', 'success');
            setTimeout(() => this.hideStatus(), 1500);
        } catch (error) {
            console.error('Copy matrix error:', error);
            this.showStatus('Failed to copy matrix.', 'error');
        }
    }

    showPlaceholder() {
        this.canvas.style.display = 'none';
        this.placeholder.style.display = 'flex';
        this.downloadBtn.disabled = true;
        this.copyBtn.disabled = true;
    }

    hidePlaceholder() {
        this.canvas.style.display = 'block';
        this.placeholder.style.display = 'none';
    }

    enableButtons() {
        this.downloadBtn.disabled = false;
        this.copyBtn.disabled = false;
    }

    downloadQR() {
        const data = this.dataInput.value.trim();
        const filename = `qrcode-${Date.now()}.png`;
        
        this.canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                this.showStatus('Downloaded!', 'success');
                setTimeout(() => this.hideStatus(), 1500);
            }
        }, 'image/png');
    }

    async copyToClipboard() {
        try {
            if (navigator.clipboard && navigator.clipboard.write) {
                const blob = await new Promise(resolve => this.canvas.toBlob(resolve, 'image/png'));
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                this.showStatus('Copied to clipboard!', 'success');
                setTimeout(() => this.hideStatus(), 1500);
            } else {
                this.showStatus('Clipboard not supported in this browser', 'error');
            }
        } catch (error) {
            console.error('Clipboard error:', error);
            this.showStatus('Failed to copy. Try downloading instead.', 'error');
        }
    }

    showStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        this.status.style.display = 'block';
    }

    hideStatus() {
        this.status.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QRCodeApp();
});
