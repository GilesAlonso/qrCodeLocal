class QRCode {
    constructor() {
        this.errorCorrectionLevels = {
            L: { codewordsPerBlock: [1, 1, 1, 1, 1, 1, 2, 2, 2, 2], ecCodewords: [7, 10, 15, 20, 26, 36, 40, 48, 60, 72] },
            M: { codewordsPerBlock: [1, 1, 1, 1, 1, 2, 4, 4, 4, 4], ecCodewords: [10, 16, 26, 36, 48, 64, 72, 88, 110, 130] },
            Q: { codewordsPerBlock: [1, 1, 2, 2, 4, 4, 4, 4, 6, 6], ecCodewords: [13, 22, 36, 52, 72, 96, 108, 132, 160, 192] },
            H: { codewordsPerBlock: [1, 1, 2, 2, 4, 4, 6, 6, 8, 8], ecCodewords: [17, 28, 44, 64, 88, 112, 130, 156, 192, 224] }
        };

        this.alphanumericCharset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
        this.initGF();
    }

    initGF() {
        this.gfExp = new Array(512);
        this.gfLog = new Array(256);
        
        let x = 1;
        for (let i = 0; i < 255; i++) {
            this.gfExp[i] = x;
            this.gfLog[x] = i;
            x *= 2;
            if (x >= 256) {
                x ^= 285;
            }
        }
        
        for (let i = 255; i < 512; i++) {
            this.gfExp[i] = this.gfExp[i - 255];
        }
    }

    gfMultiply(a, b) {
        if (a === 0 || b === 0) return 0;
        return this.gfExp[this.gfLog[a] + this.gfLog[b]];
    }

    generate(data, errorLevel = 'M') {
        const mode = this.getMode(data);
        const version = this.getVersion(data.length, mode, errorLevel);
        
        const encoded = this.encodeData(data, mode, version, errorLevel);
        const matrix = this.createMatrix(version);
        this.addDataToMatrix(matrix, encoded, version);
        this.addFormatInfo(matrix, version, errorLevel);
        return matrix;
    }

    getMode(data) {
        const numeric = /^\d+$/;
        if (numeric.test(data)) return 1; // Numeric
        if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) return 2; // Alphanumeric
        return 4; // Byte
    }

    getVersion(dataLength, mode, errorLevel) {
        const capacities = {
            1: { 1: [41, 34, 27, 17], 2: [25, 20, 16, 10], 4: [17, 14, 11, 7] },
            2: { 1: [77, 63, 48, 34], 2: [47, 38, 29, 20], 4: [32, 26, 20, 14] },
            3: { 1: [127, 101, 77, 58], 2: [77, 61, 47, 35], 4: [53, 42, 32, 24] },
            4: { 1: [187, 149, 111, 82], 2: [114, 90, 67, 50], 4: [78, 62, 46, 34] },
            5: { 1: [255, 202, 144, 106], 2: [154, 122, 87, 64], 4: [106, 84, 60, 44] },
            6: { 1: [322, 255, 178, 139], 2: [195, 154, 108, 84], 4: [134, 106, 74, 58] },
            7: { 1: [370, 293, 207, 154], 2: [224, 178, 125, 93], 4: [154, 122, 86, 64] },
            8: { 1: [461, 365, 259, 202], 2: [279, 221, 155, 121], 4: [192, 152, 108, 84] },
            9: { 1: [552, 432, 312, 235], 2: [335, 262, 186, 143], 4: [230, 180, 128, 98] },
            10: { 1: [652, 513, 364, 288], 2: [395, 311, 219, 174], 4: [271, 213, 151, 119] }
        };

        const ecIndex = { L: 0, M: 1, Q: 2, H: 3 }[errorLevel];
        
        for (let v = 1; v <= 10; v++) {
            if (capacities[v][mode] && dataLength <= capacities[v][mode][ecIndex]) {
                return v;
            }
        }
        
        return 10;
    }

    encodeData(data, mode, version, errorLevel) {
        let bitString = '';

        bitString += this.toBits(mode, 4);
        
        const charCountBits = version < 10 ? [8, 9, 8][mode - 1] : [10, 11, 8][mode - 1];
        bitString += this.toBits(data.length, charCountBits);

        if (mode === 1) {
            bitString += this.encodeNumeric(data);
        } else if (mode === 2) {
            bitString += this.encodeAlphanumeric(data);
        } else {
            bitString += this.encodeByte(data);
        }

        const maxBits = version * 8 + 16;
        while (bitString.length < maxBits && bitString.length % 8 !== 0) {
            bitString += '0';
        }

        while (bitString.length < maxBits) {
            bitString += '1110110000010001';
        }

        const capacity = version * 8;
        bitString = bitString.substring(0, capacity);

        const ecInfo = this.errorCorrectionLevels[errorLevel];
        const codewords = this.bitsToBytes(bitString);
        const ecCodewords = this.calculateErrorCorrection(codewords, version, errorLevel);
        
        return [...codewords, ...ecCodewords];
    }

    encodeNumeric(data) {
        let bits = '';
        for (let i = 0; i < data.length; i += 3) {
            const chunk = data.substring(i, i + 3);
            const value = parseInt(chunk, 10);
            const bitCount = chunk.length * 3 + 1;
            bits += this.toBits(value, bitCount);
        }
        return bits;
    }

    encodeAlphanumeric(data) {
        let bits = '';
        for (let i = 0; i < data.length; i += 2) {
            if (i + 1 < data.length) {
                const val1 = this.alphanumericCharset.indexOf(data[i]);
                const val2 = this.alphanumericCharset.indexOf(data[i + 1]);
                bits += this.toBits(val1 * 45 + val2, 11);
            } else {
                const val = this.alphanumericCharset.indexOf(data[i]);
                bits += this.toBits(val, 6);
            }
        }
        return bits;
    }

    encodeByte(data) {
        let bits = '';
        for (let i = 0; i < data.length; i++) {
            bits += this.toBits(data.charCodeAt(i), 8);
        }
        return bits;
    }

    toBits(value, length) {
        return value.toString(2).padStart(length, '0');
    }

    bitsToBytes(bitString) {
        const bytes = [];
        for (let i = 0; i < bitString.length; i += 8) {
            const byteStr = bitString.substring(i, i + 8);
            bytes.push(parseInt(byteStr, 2));
        }
        return bytes;
    }

    createMatrix(version) {
        const size = version * 4 + 17;
        const matrix = Array(size).fill(null).map(() => Array(size).fill(null));
        
        this.addFinderPatterns(matrix);
        this.addTimingPatterns(matrix, size);
        this.addAlignmentPatterns(matrix, version, size);
        this.addDarkModule(matrix, version);
        this.addReservedAreas(matrix, version, size);
        
        return matrix;
    }

    addFinderPatterns(matrix) {
        const size = matrix.length;
        const positions = [[0, 0], [size - 7, 0], [0, size - 7]];
        
        const pattern = [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ];

        for (const [x, y] of positions) {
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 7; j++) {
                    matrix[y + i][x + j] = pattern[i][j];
                }
            }
        }
    }

    addTimingPatterns(matrix, size) {
        for (let i = 8; i < size - 8; i++) {
            matrix[6][i] = i % 2 === 0;
            matrix[i][6] = i % 2 === 0;
        }
    }

    addAlignmentPatterns(matrix, version, size) {
        if (version < 2) return;
        
        const positions = this.getAlignmentPatternPositions(version);
        
        for (const x of positions) {
            for (const y of positions) {
                if (this.isOverlap(matrix, x, y)) continue;
                
                for (let i = -2; i <= 2; i++) {
                    for (let j = -2; j <= 2; j++) {
                        const val = Math.abs(i) === 2 || Math.abs(j) === 2 ? 1 : 
                                   Math.abs(i) === 1 || Math.abs(j) === 1 ? 0 : 1;
                        matrix[y + i][x + j] = val;
                    }
                }
            }
        }
    }

    getAlignmentPatternPositions(version) {
        const positions = {
            2: [18, 6],
            3: [22, 6],
            4: [26, 10],
            5: [30, 10],
            6: [34, 12],
            7: [38, 12],
            8: [42, 14],
            9: [46, 14],
            10: [50, 18]
        };
        
        if (!positions[version]) return [];
        
        const result = [...positions[version]];
        result.push(6);
        result.sort((a, b) => a - b);
        
        return result;
    }

    isOverlap(matrix, x, y) {
        const size = matrix.length;
        if ((x < 9 && y < 9) || (x > size - 10 && y < 9) || (x < 9 && y > size - 10)) {
            return true;
        }
        if (x === 6 || y === 6) return true;
        return false;
    }

    addDarkModule(matrix, version) {
        matrix[4 * version + 9][8] = 1;
    }

    addReservedAreas(matrix, version, size) {
        for (let i = 0; i < 8; i++) {
            matrix[i][8] = -1;
            matrix[8][i] = -1;
            matrix[size - 1 - i][8] = -1;
            matrix[8][size - 1 - i] = -1;
        }
        matrix[8][8] = -1;
        matrix[size - 8][8] = 0;
    }

    addDataToMatrix(matrix, data, version) {
        const size = matrix.length;
        let bitIndex = 0;
        let direction = -1;
        let x = size - 1;
        let y = size - 1;

        while (x >= 0) {
            if (x === 6) x = 5;
            
            while (y >= 0 && y < size) {
                for (const col of [x, x - 1]) {
                    if (col < 0) continue;
                    if (matrix[y][col] === null) {
                        matrix[y][col] = bitIndex < data.length ? 
                            ((data[Math.floor(bitIndex / 8)] >> (7 - (bitIndex % 8))) & 1) : 0;
                        bitIndex++;
                    }
                }
                y += direction;
            }
            direction = -direction;
            y += direction;
            x -= 2;
        }
    }

    calculateErrorCorrection(data, version, errorLevel) {
        const ecInfo = this.errorCorrectionLevels[errorLevel];
        const numEcCodewords = ecInfo.ecCodewords[version - 1];
        const blocksPerGroup = ecInfo.codewordsPerBlock[version - 1];
        
        const dataBlocks = this.splitDataIntoBlocks(data, version, errorLevel);
        
        let result = [];
        for (const block of dataBlocks) {
            const ecBlock = this.generateErrorCorrectionCodewords(block, numEcCodewords);
            result.push(...ecBlock);
        }
        
        return result;
    }

    splitDataIntoBlocks(data, version, errorLevel) {
        const ecInfo = this.errorCorrectionLevels[errorLevel];
        const blocksPerGroup = ecInfo.codewordsPerBlock[version - 1];
        const totalEcCodewords = ecInfo.ecCodewords[version - 1];
        
        const totalDataCodewords = version * 8 - totalEcCodewords;
        const blockSize = Math.floor(totalDataCodewords / blocksPerGroup);
        const remainder = totalDataCodewords % blocksPerGroup;
        
        const blocks = [];
        let offset = 0;
        
        for (let i = 0; i < blocksPerGroup; i++) {
            const size = blockSize + (i < remainder ? 1 : 0);
            blocks.push(data.slice(offset, offset + size));
            offset += size;
        }
        
        return blocks;
    }

    generateErrorCorrectionCodewords(data, numCodewords) {
        const generator = this.buildGeneratorPolynomial(numCodewords);
        const message = [...data];
        
        for (let i = 0; i < data.length; i++) {
            const coef = message[i];
            if (coef !== 0) {
                for (let j = 0; j < generator.length; j++) {
                    message[i + j] ^= this.gfMultiply(generator[j], coef);
                }
            }
        }
        
        return message.slice(data.length, data.length + numCodewords);
    }

    buildGeneratorPolynomial(degree) {
        let generator = [1];
        
        for (let i = 0; i < degree; i++) {
            const poly = [1, this.gfExp[i]];
            const newGen = new Array(generator.length + 1).fill(0);
            
            for (let j = 0; j < generator.length; j++) {
                newGen[j] ^= generator[j];
                newGen[j + 1] ^= this.gfMultiply(generator[j], poly[1]);
            }
            
            generator = newGen;
        }
        
        return generator;
    }

    addFormatInfo(matrix, version, errorLevel) {
        const size = matrix.length;
        const ecIndex = { L: 1, M: 0, Q: 3, H: 2 }[errorLevel];
        
        const formatBits = this.generateFormatBits(ecIndex);
        
        let bitIndex = 0;
        for (let i = 0; i <= 8; i++) {
            if (i !== 6) {
                matrix[8][size - 1 - i] = formatBits[bitIndex];
                matrix[i][8] = formatBits[formatBits.length - 1 - bitIndex];
                bitIndex++;
            }
        }
        
        for (let i = 0; i < 7; i++) {
            matrix[8][i] = formatBits[6 - i];
            matrix[size - 7 + i][8] = formatBits[14 - bitIndex];
            bitIndex++;
        }
        
        matrix[8][7] = formatBits[7];
        matrix[8][8] = formatBits[8];
        matrix[7][8] = formatBits[6];
    }

    generateFormatBits(ecIndex) {
        const formatInfo = [
            0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
            0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976
        ];
        
        const bits = (formatInfo[ecIndex] ^ 0x5412).toString(2).padStart(15, '0');
        return bits.split('').map(b => parseInt(b));
    }
}
