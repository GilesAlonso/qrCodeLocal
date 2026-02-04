class QRCodeApp {
    constructor() {
        this.qrCode = new QRCode();
        this.initializeElements();
        this.attachEventListeners();
        this.canvasSize = 300;
    }

    initializeElements() {
        this.textInput = document.getElementById('textInput');
        this.errorLevel = document.getElementById('errorLevel');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.canvas = document.getElementById('qrCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.placeholder = document.getElementById('placeholder');
        this.qrContainer = document.getElementById('qrContainer');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateQRCode());
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        this.textInput.addEventListener('input', () => this.handleInput());
        this.errorLevel.addEventListener('change', () => this.handleInput());

        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateQRCode();
            }
        });
    }

    handleInput() {
        if (this.textInput.value.trim() === '') {
            this.showPlaceholder();
        } else {
            this.generateQRCode();
        }
    }

    generateQRCode() {
        const text = this.textInput.value.trim();
        const ecLevel = this.errorLevel.value;

        if (!text) {
            this.showPlaceholder();
            return;
        }

        try {
            const result = this.qrCode.generate(text, ecLevel);
            this.renderQRCode(result.matrix);
            this.showQRCode();
        } catch (error) {
            console.error('Error generating QR code:', error);
            this.showError(error.message);
        }
    }

    renderQRCode(matrix) {
        const size = matrix.length;
        const moduleSize = this.canvasSize / size;
        
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        this.ctx.fillStyle = '#000000';
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (matrix[row][col] === 1) {
                    this.ctx.fillRect(
                        Math.floor(col * moduleSize),
                        Math.floor(row * moduleSize),
                        Math.ceil(moduleSize),
                        Math.ceil(moduleSize)
                    );
                }
            }
        }
    }

    showQRCode() {
        this.canvas.style.display = 'block';
        this.placeholder.style.display = 'none';
        this.downloadBtn.disabled = false;
        this.copyBtn.disabled = false;
        this.qrContainer.style.background = '#ffffff';
    }

    showPlaceholder() {
        this.canvas.style.display = 'none';
        this.placeholder.style.display = 'flex';
        this.downloadBtn.disabled = true;
        this.copyBtn.disabled = true;
        this.qrContainer.style.background = '#f8fafc';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #fee2e2;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin-top: 16px;
            text-align: center;
            border: 1px solid #fecaca;
        `;
        errorDiv.textContent = message;

        const existingError = this.qrContainer.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        this.qrContainer.style.background = '#fef2f2';
        this.canvas.style.display = 'none';
        this.placeholder.style.display = 'flex';
        this.placeholder.querySelector('p').textContent = message;
        this.placeholder.querySelector('svg').style.display = 'none';
        this.downloadBtn.disabled = true;
        this.copyBtn.disabled = true;
    }

    downloadQRCode() {
        try {
            const link = document.createElement('a');
            link.download = this.generateFileName();
            link.href = this.canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            this.showError('Failed to download QR code');
        }
    }

    generateFileName() {
        const text = this.textInput.value.trim();
        const timestamp = new Date().toISOString().slice(0, 10);
        
        let sanitizedText = text
            .replace(/[^a-zA-Z0-9]/g, '_')
            .slice(0, 30);
        
        if (sanitizedText.length === 0) {
            sanitizedText = 'qrcode';
        }
        
        return `${sanitizedText}_${timestamp}.png`;
    }

    async copyToClipboard() {
        try {
            const blob = await new Promise(resolve => {
                this.canvas.toBlob(resolve, 'image/png');
            });

            if (navigator.clipboard && navigator.clipboard.write) {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                this.showCopySuccess();
            } else {
                throw new Error('Clipboard API not supported');
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.fallbackCopy();
        }
    }

    fallbackCopy() {
        try {
            const dataUrl = this.canvas.toDataURL('image/png');
            
            const tempInput = document.createElement('input');
            tempInput.value = dataUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            const success = document.execCommand('copy');
            document.body.removeChild(tempInput);

            if (success) {
                this.showCopySuccess();
            } else {
                throw new Error('Copy command failed');
            }
        } catch (error) {
            console.error('Fallback copy failed:', error);
            this.showError('Failed to copy to clipboard. Try downloading instead.');
        }
    }

    showCopySuccess() {
        const originalText = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied!
        `;
        this.copyBtn.style.borderColor = '#10b981';
        this.copyBtn.style.color = '#10b981';

        setTimeout(() => {
            this.copyBtn.innerHTML = originalText;
            this.copyBtn.style.borderColor = '';
            this.copyBtn.style.color = '';
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QRCodeApp();
});
