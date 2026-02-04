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
        
        this.init();
    }

    init() {
        this.dataInput.addEventListener('input', () => this.generateQR());
        this.errorLevel.addEventListener('change', () => this.generateQR());
        this.size.addEventListener('change', () => this.generateQR());
        this.downloadBtn.addEventListener('click', () => this.downloadQR());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        this.generateQR();
    }

    generateQR() {
        const data = this.dataInput.value.trim();
        const errorLevel = this.errorLevel.value;
        const size = parseInt(this.size.value);
        
        if (!data) {
            this.showPlaceholder();
            return;
        }

        try {
            this.showStatus('Generating...');
            
            setTimeout(() => {
                try {
                    const matrix = this.qrCode.generate(data, errorLevel);
                    this.renderQR(matrix, size);
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
