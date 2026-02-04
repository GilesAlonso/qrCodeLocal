class QRCode {
    constructor() {
        this.EC_LEVELS = {
            L: { code: 1, name: 'L' },
            M: { code: 0, name: 'M' },
            Q: { code: 3, name: 'Q' },
            H: { code: 2, name: 'H' }
        };

        this.ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

        this.VERSION_INFO = this.generateVersionInfo();
    }

    generateVersionInfo() {
        const versionInfo = [];
        for (let v = 1; v <= 10; v++) {
            versionInfo[v] = {
                size: v * 4 + 17,
                alignmentPatterns: this.getAlignmentPatternPositions(v),
                ecCodewords: {
                    L: [null, 7, 10, 15, 20, 26, 36, 40, 48, 60, 72][v],
                    M: [null, 10, 16, 26, 36, 48, 64, 72, 88, 110, 130][v],
                    Q: [null, 13, 22, 36, 52, 72, 96, 108, 132, 160, 192][v],
                    H: [null, 17, 28, 44, 64, 84, 112, 130, 156, 192, 224][v]
                },
                group1: { blocks: [null, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2][v], dataCodewords: [null, 19, 34, 55, 80, 108, 136, 156, 182, 212, 240][v] },
                group2: { blocks: [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][v], dataCodewords: [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][v] }
            };
        }
        return versionInfo;
    }

    getAlignmentPatternPositions(version) {
        if (version === 1) return [];
        const positions = [];
        const intervals = [6, 18, 22, 26, 30, 34, 22, 24, 24, 28, 28][version];
        const offset = [null, null, null, null, null, null, 38, 42, 46, 52, 56][version];
        positions.push(6);
        for (let i = 0; i < version - 1; i++) {
            positions.push(positions[positions.length - 1] + intervals);
        }
        return positions;
    }

    determineMode(text) {
        if (/^\d+$/.test(text)) {
            return 'numeric';
        }
        if (/^[0-9A-Z $%*+\-./:]+$/.test(text.toUpperCase())) {
            return 'alphanumeric';
        }
        return 'byte';
    }

    getModeIndicator(mode) {
        switch (mode) {
            case 'numeric': return 0b0001;
            case 'alphanumeric': return 0b0010;
            case 'byte': return 0b0100;
            default: throw new Error('Unknown mode');
        }
    }

    getCharacterCountBits(mode, version) {
        if (version <= 9) {
            switch (mode) {
                case 'numeric': return 10;
                case 'alphanumeric': return 9;
                case 'byte': return 8;
            }
        }
        switch (mode) {
            case 'numeric': return 12;
            case 'alphanumeric': return 11;
            case 'byte': return 16;
        }
    }

    encodeNumeric(text) {
        const bits = [];
        for (let i = 0; i < text.length; i += 3) {
            const chunk = text.substr(i, 3);
            const value = parseInt(chunk, 10);
            let bitLength = chunk.length === 3 ? 10 : (chunk.length === 2 ? 7 : 4);
            bits.push({ value, bitLength });
        }
        return bits;
    }

    encodeAlphanumeric(text) {
        const bits = [];
        text = text.toUpperCase();
        for (let i = 0; i < text.length; i += 2) {
            if (i + 1 < text.length) {
                const char1 = this.ALPHANUMERIC_CHARS.indexOf(text[i]);
                const char2 = this.ALPHANUMERIC_CHARS.indexOf(text[i + 1]);
                const value = char1 * 45 + char2;
                bits.push({ value, bitLength: 11 });
            } else {
                const char = this.ALPHANUMERIC_CHARS.indexOf(text[i]);
                bits.push({ value: char, bitLength: 6 });
            }
        }
        return bits;
    }

    encodeByte(text) {
        const bits = [];
        for (let i = 0; i < text.length; i++) {
            bits.push({ value: text.charCodeAt(i), bitLength: 8 });
        }
        return bits;
    }

    bitsToByteArray(bits) {
        const bytes = [];
        let currentByte = 0;
        let bitsRemaining = 8;

        for (const bit of bits) {
            const { value, bitLength } = bit;
            let bitsToAdd = bitLength;

            while (bitsToAdd > 0) {
                const bitsToTake = Math.min(bitsToAdd, bitsRemaining);
                const shift = bitsToAdd - bitsToTake;
                const maskedValue = (value >> shift) & ((1 << bitsToTake) - 1);
                currentByte = (currentByte << bitsToTake) | maskedValue;
                bitsRemaining -= bitsToTake;
                bitsToAdd -= bitsToTake;

                if (bitsRemaining === 0) {
                    bytes.push(currentByte);
                    currentByte = 0;
                    bitsRemaining = 8;
                }
            }
        }

        if (bitsRemaining < 8) {
            bytes.push(currentByte << bitsRemaining);
        }

        return bytes;
    }

    addTerminator(data, maxBits) {
        const bits = [];
        for (const bit of data) {
            bits.push(bit);
        }

        const terminatorLength = Math.min(4, maxBits - this.getTotalBits(bits));
        for (let i = 0; i < terminatorLength; i++) {
            bits.push({ value: 0, bitLength: 1 });
        }

        while (this.getTotalBits(bits) % 8 !== 0) {
            bits.push({ value: 0, bitLength: 1 });
        }

        return bits;
    }

    getTotalBits(bits) {
        return bits.reduce((sum, bit) => sum + bit.bitLength, 0);
    }

    addPadding(data, totalBytes) {
        const bytes = [...data];
        const padBytes = [0xEC, 0x11];

        for (let i = bytes.length; i < totalBytes; i++) {
            bytes.push(padBytes[(i - bytes.length) % 2]);
        }

        return bytes;
    }

    reedSolomonEncode(data, ecCodewords) {
        const generator = this.generateGeneratorPolynomial(ecCodewords);
        const message = new Uint8Array(data.length + ecCodewords);
        message.set(data);

        for (let i = 0; i < data.length; i++) {
            const coef = message[i];
            if (coef !== 0) {
                for (let j = 0; j < generator.length; j++) {
                    message[i + j] ^= this.gfMultiply(generator[j], coef);
                }
            }
        }

        return Array.from(message.slice(data.length));
    }

    generateGeneratorPolynomial(degree) {
        const generator = [1];
        for (let i = 0; i < degree; i++) {
            const newGenerator = new Array(generator.length + 1).fill(0);
            for (let j = 0; j < generator.length; j++) {
                newGenerator[j] = generator[j];
                newGenerator[j + 1] ^= this.gfMultiply(generator[j], this.gfExp(i));
            }
            generator.length = 0;
            generator.push(...newGenerator);
        }
        return generator;
    }

    gfExp(exponent) {
        return this.gfPow(2, exponent);
    }

    gfPow(base, exponent) {
        let result = 1;
        for (let i = 0; i < exponent; i++) {
            result = this.gfMultiply(result, base);
        }
        return result;
    }

    gfMultiply(a, b) {
        if (a === 0 || b === 0) return 0;
        let result = 0;
        while (b > 0) {
            if ((b & 1) !== 0) {
                result ^= a;
            }
            a <<= 1;
            if ((a & 0x100) !== 0) {
                a ^= 0x11D;
            }
            b >>= 1;
        }
        return result;
    }

    createEmptyMatrix(size) {
        return Array(size).fill(null).map(() => Array(size).fill(null));
    }

    placeFinderPatterns(matrix) {
        const size = matrix.length;
        const positions = [
            [0, 0],
            [size - 7, 0],
            [0, size - 7]
        ];

        for (const [row, col] of positions) {
            for (let r = 0; r < 7; r++) {
                for (let c = 0; c < 7; c++) {
                    const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
                    const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                    matrix[row + r][col + c] = isOuter || isInner ? 1 : 0;
                }
            }
            matrix[row + 7][col + 7] = 0;
        }
    }

    placeTimingPatterns(matrix) {
        const size = matrix.length;
        for (let i = 8; i < size - 8; i++) {
            matrix[6][i] = i % 2 === 0 ? 1 : 0;
            matrix[i][6] = i % 2 === 0 ? 1 : 0;
        }
    }

    placeAlignmentPatterns(matrix, positions) {
        const size = matrix.length;
        for (const row of positions) {
            for (const col of positions) {
                if (matrix[row][col] !== null) continue;
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
                        const isCenter = r === 0 && c === 0;
                        matrix[row + r][col + c] = isOuter || isCenter ? 1 : 0;
                    }
                }
            }
        }
    }

    placeVersionInfo(matrix, version) {
        if (version < 7) return;
        const versionBits = this.getVersionBits(version);
        for (let i = 0; i < 18; i++) {
            const bit = (versionBits >> i) & 1;
            const row = Math.floor(i / 3);
            const col = i % 3;
            matrix[matrix.length - 11 + col][row] = bit;
            matrix[row][matrix.length - 11 + col] = bit;
        }
    }

    getVersionBits(version) {
        const versionInfo = version - 7;
        const poly = 0x1F25;
        let result = versionInfo << 12;
        for (let i = 11; i >= 0; i--) {
            if ((result >> (i + 12)) & 1) {
                result ^= poly << i;
            }
        }
        return (versionInfo << 12) | result;
    }

    reserveFormatAreas(matrix) {
        const size = matrix.length;
        for (let i = 0; i < 9; i++) {
            matrix[8][i] = null;
            matrix[i][8] = null;
        }
        matrix[8][7] = null;
        matrix[7][8] = null;
        matrix[8][size - 8] = null;
        matrix[size - 8][8] = null;
        for (let i = 0; i < 8; i++) {
            matrix[8][size - 1 - i] = null;
            matrix[size - 1 - i][8] = null;
        }
    }

    placeDataBits(matrix, dataBits) {
        const size = matrix.length;
        let bitIndex = 0;
        let direction = -1;
        let row = size - 1;
        let col = size - 1;

        while (col >= 0) {
            if (col === 6) col = 5;

            for (let i = 0; i < size; i++) {
                const currentRow = row + i * direction;
                for (let c = 0; c < 2; c++) {
                    const currentCol = col - c;
                    if (matrix[currentRow][currentCol] === null && bitIndex < dataBits.length) {
                        matrix[currentRow][currentCol] = dataBits[bitIndex];
                        bitIndex++;
                    }
                }
            }

            row += direction * (size - 1);
            direction *= -1;
            col -= 2;
        }
    }

    applyMask(matrix, maskPattern) {
        const size = matrix.length;
        const masked = matrix.map(row => [...row]);

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (masked[row][col] === null) continue;
                let invert = false;
                switch (maskPattern) {
                    case 0: invert = (row + col) % 2 === 0; break;
                    case 1: invert = row % 2 === 0; break;
                    case 2: invert = col % 3 === 0; break;
                    case 3: invert = (row + col) % 3 === 0; break;
                    case 4: invert = (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0; break;
                    case 5: invert = (row * col) % 2 + (row * col) % 3 === 0; break;
                    case 6: invert = ((row * col) % 2 + (row * col) % 3) % 2 === 0; break;
                    case 7: invert = ((row + col) % 2 + (row * col) % 3) % 2 === 0; break;
                }
                if (invert) {
                    masked[row][col] ^= 1;
                }
            }
        }

        return masked;
    }

    calculatePenalty(matrix) {
        let penalty = 0;
        const size = matrix.length;

        penalty += this.calculateLinePenalty(matrix);
        penalty += this.calculateBlockPenalty(matrix);
        penalty += this.calculateFinderPenalty(matrix);
        penalty += this.calculateBalancePenalty(matrix);

        return penalty;
    }

    calculateLinePenalty(matrix) {
        let penalty = 0;
        const size = matrix.length;

        for (let i = 0; i < size; i++) {
            let consecutive = 1;
            for (let j = 1; j < size; j++) {
                if (matrix[i][j] === matrix[i][j - 1]) {
                    consecutive++;
                } else {
                    if (consecutive >= 5) {
                        penalty += consecutive - 2;
                    }
                    consecutive = 1;
                }
            }
            if (consecutive >= 5) {
                penalty += consecutive - 2;
            }
        }

        for (let j = 0; j < size; j++) {
            let consecutive = 1;
            for (let i = 1; i < size; i++) {
                if (matrix[i][j] === matrix[i - 1][j]) {
                    consecutive++;
                } else {
                    if (consecutive >= 5) {
                        penalty += consecutive - 2;
                    }
                    consecutive = 1;
                }
            }
            if (consecutive >= 5) {
                penalty += consecutive - 2;
            }
        }

        return penalty;
    }

    calculateBlockPenalty(matrix) {
        let penalty = 0;
        const size = matrix.length;

        const pattern1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
        const pattern2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];

        for (let row = 0; row < size; row++) {
            for (let col = 0; col <= size - 11; col++) {
                let match1 = true;
                let match2 = true;
                for (let i = 0; i < 11; i++) {
                    if (matrix[row][col + i] !== pattern1[i]) match1 = false;
                    if (matrix[row][col + i] !== pattern2[i]) match2 = false;
                }
                if (match1 || match2) penalty += 40;
            }
        }

        for (let col = 0; col < size; col++) {
            for (let row = 0; row <= size - 11; row++) {
                let match1 = true;
                let match2 = true;
                for (let i = 0; i < 11; i++) {
                    if (matrix[row + i][col] !== pattern1[i]) match1 = false;
                    if (matrix[row + i][col] !== pattern2[i]) match2 = false;
                }
                if (match1 || match2) penalty += 40;
            }
        }

        return penalty;
    }

    calculateFinderPenalty(matrix) {
        let penalty = 0;
        const size = matrix.length;

        const finderPositions = [
            [4, 4],
            [size - 5, 4],
            [4, size - 5]
        ];

        for (const [centerRow, centerCol] of finderPositions) {
            let darkCount = 0;
            for (let row = centerRow - 2; row <= centerRow + 2; row++) {
                for (let col = centerCol - 2; col <= centerCol + 2; col++) {
                    if (matrix[row][col] === 1) darkCount++;
                }
            }
            if (darkCount === 0 || darkCount === 10) {
                penalty += 10;
            }
        }

        return penalty;
    }

    calculateBalancePenalty(matrix) {
        const size = matrix.length;
        let darkCount = 0;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (matrix[row][col] === 1) darkCount++;
            }
        }
        const total = size * size;
        const darkPercent = (darkCount * 100) / total;
        const lower = Math.floor(darkPercent / 5) * 5;
        const upper = lower + 5;
        const prevMultiple = Math.max(0, lower - 5);
        const nextMultiple = Math.min(100, upper + 5);
        
        const percent = Math.min(
            Math.abs(darkPercent - 50),
            Math.abs(darkPercent - 45),
            Math.abs(darkPercent - 55)
        );

        return Math.floor(percent / 5) * 10;
    }

    getFormatBits(ecLevel, maskPattern) {
        const formatBits = (this.EC_LEVELS[ecLevel].code << 3) | maskPattern;
        const poly = 0x537;
        let result = formatBits << 10;
        for (let i = 14; i >= 5; i--) {
            if ((result >> i) & 1) {
                result ^= poly << (i - 5);
            }
        }
        const finalBits = ((formatBits << 10) | result) ^ 0x5412;
        return finalBits;
    }

    placeFormatInfo(matrix, ecLevel, maskPattern) {
        const formatBits = this.getFormatBits(ecLevel, maskPattern);
        const size = matrix.length;

        for (let i = 0; i < 6; i++) {
            const bit = (formatBits >> i) & 1;
            if (i < 6) {
                matrix[8][i] = bit;
            }
            if (i < 8) {
                matrix[size - 1 - i][8] = bit;
            }
        }
        matrix[8][7] = (formatBits >> 6) & 1;
        matrix[8][8] = (formatBits >> 7) & 1;
        matrix[8][size - 7] = (formatBits >> 8) & 1;

        for (let i = 0; i < 7; i++) {
            const bit = (formatBits >> i) & 1;
            matrix[i][8] = bit;
        }
        matrix[7][8] = (formatBits >> 6) & 1;
        matrix[8][8] = (formatBits >> 7) & 1;
        matrix[8][size - 8] = (formatBits >> 8) & 1;
        for (let i = 0; i < 8; i++) {
            matrix[8][size - 8 + i] = (formatBits >> (14 - i)) & 1;
        }
    }

    determineVersion(text, ecLevel) {
        const mode = this.determineMode(text);
        const charCountBits = this.getCharacterCountBits(mode, 10);

        let dataBits = 4 + charCountBits;
        const encoded = this.encodeData(text, mode);
        dataBits += encoded.reduce((sum, bit) => sum + bit.bitLength, 0);

        for (let version = 1; version <= 10; version++) {
            const versionInfo = this.VERSION_INFO[version];
            const ecCodewords = versionInfo.ecCodewords[ecLevel];
            const totalCodewords = versionInfo.group1.dataCodewords * versionInfo.group1.blocks +
                                   versionInfo.group2.dataCodewords * versionInfo.group2.blocks;
            const totalBits = totalCodewords * 8;

            let estimatedBits = dataBits + 4;
            while (estimatedBits % 8 !== 0) {
                estimatedBits++;
            }

            if (estimatedBits <= totalBits) {
                return version;
            }
        }

        throw new Error('Data too long for QR code (maximum version 10)');
    }

    encodeData(text, mode) {
        switch (mode) {
            case 'numeric': return this.encodeNumeric(text);
            case 'alphanumeric': return this.encodeAlphanumeric(text);
            case 'byte': return this.encodeByte(text);
            default: throw new Error('Unknown mode');
        }
    }

    generate(text, ecLevel = 'M') {
        const mode = this.determineMode(text);
        const version = this.determineVersion(text, ecLevel);
        const versionInfo = this.VERSION_INFO[version];
        const size = versionInfo.size;

        let dataBits = [
            { value: this.getModeIndicator(mode), bitLength: 4 },
            { value: text.length, bitLength: this.getCharacterCountBits(mode, version) },
            ...this.encodeData(text, mode)
        ];

        const ecCodewords = versionInfo.ecCodewords[ecLevel];
        const totalCodewords = versionInfo.group1.dataCodewords * versionInfo.group1.blocks +
                               versionInfo.group2.dataCodewords * versionInfo.group2.blocks;
        const maxDataBits = totalCodewords * 8;

        dataBits = this.addTerminator(dataBits, maxDataBits);
        let dataBytes = this.bitsToByteArray(dataBits);
        dataBytes = this.addPadding(dataBytes, totalCodewords);

        const blockData = this.splitIntoBlocks(dataBytes, versionInfo);
        const ecBlocks = blockData.map(block => this.reedSolomonEncode(block, ecCodewords));
        const finalData = this.interleaveBlocks(blockData, ecBlocks, versionInfo);

        let finalBits = [];
        for (const byte of finalData) {
            finalBits.push((byte >> 7) & 1);
            finalBits.push((byte >> 6) & 1);
            finalBits.push((byte >> 5) & 1);
            finalBits.push((byte >> 4) & 1);
            finalBits.push((byte >> 3) & 1);
            finalBits.push((byte >> 2) & 1);
            finalBits.push((byte >> 1) & 1);
            finalBits.push(byte & 1);
        }

        let bestMatrix = null;
        let bestPenalty = Infinity;
        let bestMask = 0;

        for (let mask = 0; mask < 8; mask++) {
            const matrix = this.createEmptyMatrix(size);
            this.placeFinderPatterns(matrix);
            this.placeTimingPatterns(matrix);
            this.placeAlignmentPatterns(matrix, versionInfo.alignmentPatterns);
            this.reserveFormatAreas(matrix);
            this.placeVersionInfo(matrix, version);
            this.placeDataBits(matrix, finalBits);
            const maskedMatrix = this.applyMask(matrix, mask);
            this.placeFormatInfo(maskedMatrix, ecLevel, mask);

            const penalty = this.calculatePenalty(maskedMatrix);
            if (penalty < bestPenalty) {
                bestPenalty = penalty;
                bestMatrix = maskedMatrix;
                bestMask = mask;
            }
        }

        return {
            matrix: bestMatrix,
            version: version,
            ecLevel: ecLevel,
            maskPattern: bestMask,
            size: size
        };
    }

    splitIntoBlocks(data, versionInfo) {
        const blocks = [];
        let dataIndex = 0;

        const group1Blocks = versionInfo.group1.blocks;
        const group1DataCodewords = versionInfo.group1.dataCodewords;
        const group2Blocks = versionInfo.group2.blocks;
        const group2DataCodewords = versionInfo.group2.dataCodewords;

        for (let i = 0; i < group1Blocks; i++) {
            blocks.push(data.slice(dataIndex, dataIndex + group1DataCodewords));
            dataIndex += group1DataCodewords;
        }

        for (let i = 0; i < group2Blocks; i++) {
            blocks.push(data.slice(dataIndex, dataIndex + group2DataCodewords));
            dataIndex += group2DataCodewords;
        }

        return blocks;
    }

    interleaveBlocks(dataBlocks, ecBlocks, versionInfo) {
        const totalBlocks = versionInfo.group1.blocks + versionInfo.group2.blocks;
        const maxDataLen = Math.max(
            versionInfo.group1.dataCodewords,
            versionInfo.group2.dataCodewords
        );
        const ecLen = ecBlocks[0].length;

        const interleaved = [];

        for (let i = 0; i < maxDataLen; i++) {
            for (let j = 0; j < totalBlocks; j++) {
                if (dataBlocks[j][i] !== undefined) {
                    interleaved.push(dataBlocks[j][i]);
                }
            }
        }

        for (let i = 0; i < ecLen; i++) {
            for (let j = 0; j < totalBlocks; j++) {
                interleaved.push(ecBlocks[j][i]);
            }
        }

        return interleaved;
    }
}
