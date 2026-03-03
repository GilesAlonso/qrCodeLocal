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

        this.charCount = document.getElementById('charCount');
        this.charMax = document.getElementById('charMax');
        this.capacityBar = document.getElementById('capacityBar');

        // Max byte-mode characters per EC level (version 10 is max supported)
        // Computed from rsBlockTable: total data codewords minus 3 bytes overhead
        // (4-bit mode indicator + 8-bit char count for v1-9 byte or 16-bit for v10)
        this.maxCapacity = this.computeMaxCapacities();

        this.init();
    }

    computeMaxCapacities() {
        // For each EC level, compute the max number of byte-mode characters
        // that fit in the largest supported version (10)
        const caps = {};
        for (const ec of ['L', 'M', 'Q', 'H']) {
            const blocks = this.qrCode.getRsBlocks(10, ec);
            let totalData = 0;
            for (const b of blocks) totalData += b.dataCount;
            // Byte mode overhead: 4 bits mode + 16 bits count (v10 uses 16-bit count for byte) = 20 bits
            // So max chars = totalData - ceil(20/8) = totalData - 3
            // Actually the overhead is within the data: 4+16=20 bits. Remaining = totalData*8 - 20.
            // Max chars = floor((totalData*8 - 20) / 8) = totalData - 3 (since 20/8 = 2.5, ceil = 3)
            caps[ec] = totalData - 3;
        }
        return caps;
    }

    init() {
        this.dataInput.addEventListener('input', () => {
            this.updateCharCounter();
            this.generateQR();
        });
        this.errorLevel.addEventListener('change', () => {
            this.updateCharCounter();
            this.generateQR();
        });
        this.size.addEventListener('change', () => this.generateQR());
        this.downloadBtn.addEventListener('click', () => this.downloadQR());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.debugToggle.addEventListener('change', () => this.toggleDebugPanel());
        this.copyMatrixBtn.addEventListener('click', () => this.copyMatrixToClipboard());
        this.toggleDebugPanel();

        this.updateCharCounter();
        this.generateQR();
    }

    updateCharCounter() {
        const text = this.dataInput.value;
        const len = text.length;
        const ec = this.errorLevel.value;
        const max = this.maxCapacity[ec];
        const pct = max > 0 ? Math.min((len / max) * 100, 100) : 0;

        this.charCount.textContent = len;
        this.charMax.textContent = '/ ' + max;

        // Set warning / danger states
        this.charCount.classList.remove('warning', 'danger');
        this.capacityBar.classList.remove('warning', 'danger');

        if (len > max) {
            this.charCount.classList.add('danger');
            this.capacityBar.classList.add('danger');
        } else if (pct > 80) {
            this.charCount.classList.add('warning');
            this.capacityBar.classList.add('warning');
        }

        this.capacityBar.style.width = pct + '%';
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
                    this.showStatus('Text too long for the selected error correction level. Try a shorter text or lower EC.', 'error');
                }
            }, 10);
        } catch (error) {
            console.error('QR generation error:', error);
            this.showStatus('Text too long for the selected error correction level. Try a shorter text or lower EC.', 'error');
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
            `Mask penalties: ${debug.maskPenalties.join(', ')}`,
            '',
            '=== Block Structure ===',
            this.getBlockStructureDebug(debug)
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

    getBlockStructureDebug(debug) {
        const dataCodewordsPerBlock = Math.floor(debug.dataCodewords / 2);
        const ecCodewordsPerBlock = Math.floor(debug.ecCodewords / 2);

        return [
            `Expected for V${debug.version} ${debug.errorLevel}:`,
            `- Block count: 2`,
            `- Data per block: ${dataCodewordsPerBlock} bytes`,
            `- EC per block: ${ecCodewordsPerBlock} bytes`,
            `- Total: ${debug.dataCodewords} + ${debug.ecCodewords} = ${debug.totalCodewords} codewords`,
            '',
            `Interleaving order:`,
            `- Data: Block0[0], Block1[0], Block0[1], Block1[1], ...`,
            `- EC: Block0[0], Block1[0], Block0[1], Block1[1], ...`,
            '',
            `Check console for detailed block info`
        ].join('\n');
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
