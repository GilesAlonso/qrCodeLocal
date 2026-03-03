class QRCode {
    constructor() {
        this.alphanumericCharset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
        this.rsBlockTable = {
            1: {
                L: [1, 26, 19],
                M: [1, 26, 16],
                Q: [1, 26, 13],
                H: [1, 26, 9]
            },
            2: {
                L: [1, 44, 34],
                M: [1, 44, 28],
                Q: [1, 44, 22],
                H: [1, 44, 16]
            },
            3: {
                L: [1, 70, 55],
                M: [1, 70, 44],
                Q: [2, 35, 17],
                H: [2, 35, 13]
            },
            4: {
                L: [1, 100, 80],
                M: [2, 50, 32],
                Q: [2, 50, 24],
                H: [4, 25, 9]
            },
            5: {
                L: [1, 134, 108],
                M: [2, 67, 43],
                Q: [2, 33, 15, 2, 34, 16],
                H: [2, 33, 11, 2, 34, 12]
            },
            6: {
                L: [2, 86, 68],
                M: [4, 43, 27],
                Q: [4, 43, 19],
                H: [4, 43, 15]
            },
            7: {
                L: [2, 98, 78],
                M: [4, 49, 31],
                Q: [2, 32, 14, 4, 33, 15],
                H: [4, 39, 13, 1, 40, 14]
            },
            8: {
                L: [2, 121, 97],
                M: [2, 60, 38, 2, 61, 39],
                Q: [4, 40, 18, 2, 41, 19],
                H: [4, 40, 14, 2, 41, 15]
            },
            9: {
                L: [2, 146, 116],
                M: [3, 58, 36, 2, 59, 37],
                Q: [4, 36, 16, 4, 37, 17],
                H: [4, 36, 12, 4, 37, 13]
            },
            10: {
                L: [2, 86, 68, 2, 87, 69],
                M: [4, 69, 43, 1, 70, 44],
                Q: [6, 43, 19, 2, 44, 20],
                H: [6, 43, 15, 2, 44, 16]
            },
            11: {
                L: [4, 101, 81],
                M: [1, 80, 50, 4, 81, 51],
                Q: [4, 50, 22, 4, 51, 23],
                H: [3, 36, 12, 8, 37, 13]
            },
            12: {
                L: [2, 116, 92, 2, 117, 93],
                M: [6, 58, 36, 2, 59, 37],
                Q: [4, 46, 20, 6, 47, 21],
                H: [7, 42, 14, 4, 43, 15]
            },
            13: {
                L: [4, 133, 107],
                M: [8, 59, 37, 1, 60, 38],
                Q: [8, 44, 20, 4, 45, 21],
                H: [12, 33, 11, 4, 34, 12]
            },
            14: {
                L: [3, 145, 115, 1, 146, 116],
                M: [4, 64, 40, 5, 65, 41],
                Q: [11, 36, 16, 5, 37, 17],
                H: [11, 36, 12, 5, 37, 13]
            },
            15: {
                L: [5, 109, 87, 1, 110, 88],
                M: [5, 65, 41, 5, 66, 42],
                Q: [5, 54, 24, 7, 55, 25],
                H: [11, 36, 12, 7, 37, 13]
            },
            16: {
                L: [5, 122, 98, 1, 123, 99],
                M: [7, 73, 45, 3, 74, 46],
                Q: [15, 43, 19, 2, 44, 20],
                H: [3, 45, 15, 13, 46, 16]
            },
            17: {
                L: [1, 135, 107, 5, 136, 108],
                M: [10, 74, 46, 1, 75, 47],
                Q: [1, 50, 22, 15, 51, 23],
                H: [2, 42, 14, 17, 43, 15]
            },
            18: {
                L: [5, 150, 120, 1, 151, 121],
                M: [9, 69, 43, 4, 70, 44],
                Q: [17, 50, 22, 1, 51, 23],
                H: [2, 42, 14, 19, 43, 15]
            },
            19: {
                L: [3, 141, 113, 4, 142, 114],
                M: [3, 70, 44, 11, 71, 45],
                Q: [17, 47, 21, 4, 48, 22],
                H: [9, 39, 13, 16, 40, 14]
            },
            20: {
                L: [3, 135, 107, 5, 136, 108],
                M: [3, 67, 41, 13, 68, 42],
                Q: [15, 54, 24, 5, 55, 25],
                H: [15, 43, 15, 10, 44, 16]
            },
            21: {
                L: [4, 144, 116, 4, 145, 117],
                M: [17, 68, 42],
                Q: [17, 50, 22, 6, 51, 23],
                H: [19, 46, 16, 6, 47, 17]
            },
            22: {
                L: [2, 139, 111, 7, 140, 112],
                M: [17, 74, 46],
                Q: [7, 54, 24, 16, 55, 25],
                H: [34, 37, 13]
            },
            23: {
                L: [4, 151, 121, 5, 152, 122],
                M: [4, 75, 47, 14, 76, 48],
                Q: [11, 54, 24, 14, 55, 25],
                H: [16, 45, 15, 14, 46, 16]
            },
            24: {
                L: [6, 147, 117, 4, 148, 118],
                M: [6, 73, 45, 14, 74, 46],
                Q: [11, 54, 24, 16, 55, 25],
                H: [30, 46, 16, 2, 47, 17]
            },
            25: {
                L: [8, 132, 106, 4, 133, 107],
                M: [8, 75, 47, 13, 76, 48],
                Q: [7, 54, 24, 22, 55, 25],
                H: [22, 45, 15, 13, 46, 16]
            },
            26: {
                L: [10, 142, 114, 2, 143, 115],
                M: [19, 74, 46, 4, 75, 47],
                Q: [28, 50, 22, 6, 51, 23],
                H: [33, 46, 16, 4, 47, 17]
            },
            27: {
                L: [8, 152, 122, 4, 153, 123],
                M: [22, 73, 45, 3, 74, 46],
                Q: [8, 53, 23, 26, 54, 24],
                H: [12, 45, 15, 28, 46, 16]
            },
            28: {
                L: [3, 147, 117, 10, 148, 118],
                M: [3, 73, 45, 23, 74, 46],
                Q: [4, 54, 24, 31, 55, 25],
                H: [11, 45, 15, 31, 46, 16]
            },
            29: {
                L: [7, 146, 116, 7, 147, 117],
                M: [21, 73, 45, 7, 74, 46],
                Q: [1, 53, 23, 37, 54, 24],
                H: [19, 45, 15, 26, 46, 16]
            },
            30: {
                L: [5, 145, 115, 10, 146, 116],
                M: [19, 75, 47, 10, 76, 48],
                Q: [15, 54, 24, 25, 55, 25],
                H: [23, 45, 15, 25, 46, 16]
            },
            31: {
                L: [13, 145, 115, 3, 146, 116],
                M: [2, 74, 46, 29, 75, 47],
                Q: [42, 54, 24, 1, 55, 25],
                H: [23, 45, 15, 28, 46, 16]
            },
            32: {
                L: [17, 145, 115],
                M: [10, 74, 46, 23, 75, 47],
                Q: [10, 54, 24, 35, 55, 25],
                H: [19, 45, 15, 35, 46, 16]
            },
            33: {
                L: [17, 145, 115, 1, 146, 116],
                M: [14, 74, 46, 21, 75, 47],
                Q: [29, 54, 24, 19, 55, 25],
                H: [11, 45, 15, 46, 46, 16]
            },
            34: {
                L: [13, 145, 115, 6, 146, 116],
                M: [14, 74, 46, 23, 75, 47],
                Q: [44, 54, 24, 7, 55, 25],
                H: [59, 46, 16, 1, 47, 17]
            },
            35: {
                L: [12, 151, 121, 7, 152, 122],
                M: [12, 75, 47, 26, 76, 48],
                Q: [39, 54, 24, 14, 55, 25],
                H: [22, 45, 15, 41, 46, 16]
            },
            36: {
                L: [6, 151, 121, 14, 152, 122],
                M: [6, 75, 47, 34, 76, 48],
                Q: [46, 54, 24, 10, 55, 25],
                H: [2, 45, 15, 64, 46, 16]
            },
            37: {
                L: [17, 152, 122, 4, 153, 123],
                M: [29, 74, 46, 14, 75, 47],
                Q: [49, 54, 24, 10, 55, 25],
                H: [24, 45, 15, 46, 46, 16]
            },
            38: {
                L: [4, 152, 122, 18, 153, 123],
                M: [13, 74, 46, 32, 75, 47],
                Q: [48, 54, 24, 14, 55, 25],
                H: [42, 45, 15, 32, 46, 16]
            },
            39: {
                L: [20, 147, 117, 4, 148, 118],
                M: [40, 75, 47, 7, 76, 48],
                Q: [43, 54, 24, 22, 55, 25],
                H: [10, 45, 15, 67, 46, 16]
            },
            40: {
                L: [19, 148, 118, 6, 149, 119],
                M: [18, 75, 47, 31, 76, 48],
                Q: [34, 54, 24, 34, 55, 25],
                H: [20, 45, 15, 61, 46, 16]
            }
        };
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
        const modeName = this.getModeName(mode);
        const version = this.getVersion(data.length, mode, errorLevel);
        const {
            dataBytes,
            bitString,
            capacityBits,
            dataCodewords,
            modeBits,
            charCountBits,
            charCountValueBits,
            dataBits,
            dataBitsBeforePadding,
            terminatorBitsAdded,
            padToByteBits,
            padBytesUsed
        } = this.encodeData(data, mode, version, errorLevel);
        const blocks = this.getRsBlocks(version, errorLevel);
        const codewords = this.createCodewords(dataBytes, blocks);

        const matrix = this.createMatrix(version);
        const dataMask = matrix.map(row => row.map(cell => cell === null));

        this.addDataToMatrix(matrix, codewords, version);

        const { maskPattern, penalties } = this.selectBestMask(matrix, dataMask, errorLevel, version);
        this.applyMask(matrix, dataMask, maskPattern);
        const formatBits = this.addFormatInfo(matrix, errorLevel, maskPattern);

        const debug = {
            input: data,
            mode,
            modeName,
            version,
            errorLevel,
            matrixSize: matrix.length,
            modeBits,
            charCountBits,
            charCountValueBits,
            dataPayloadBitsLength: dataBits.length,
            dataBitsBeforePadding,
            terminatorBitsAdded,
            padToByteBits,
            padBytesUsed,
            dataBitsLength: bitString.length,
            capacityBits,
            dataCodewords,
            totalCodewords: codewords.length,
            ecCodewords: codewords.length - dataCodewords,
            maskPattern,
            formatBits: formatBits.join(''),
            maskPenalties: penalties,
            dataBitString: bitString
        };

        console.debug('[QR] Generated', {
            mode: modeName,
            version,
            errorLevel,
            maskPattern,
            dataCodewords,
            capacityBits,
            dataBitsBeforePadding,
            terminatorBitsAdded,
            padToByteBits,
            padBytesUsed: padBytesUsed.length
        });

        return { matrix, debug };
    }

    getMode(data) {
        const numeric = /^\d+$/;
        if (numeric.test(data)) return 1;
        if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) return 2;
        return 4;
    }

    getModeName(mode) {
        return { 1: 'Numeric', 2: 'Alphanumeric', 4: 'Byte' }[mode];
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
            10: { 1: [652, 513, 364, 288], 2: [395, 311, 219, 174], 4: [271, 213, 151, 119] },
            11: { 1: [772, 604, 427, 331], 2: [468, 366, 259, 200], 4: [321, 251, 177, 137] },
            12: { 1: [883, 691, 489, 374], 2: [535, 419, 296, 227], 4: [367, 287, 203, 155] },
            13: { 1: [1022, 796, 580, 427], 2: [619, 483, 352, 259], 4: [425, 331, 241, 177] },
            14: { 1: [1101, 871, 621, 468], 2: [667, 528, 376, 283], 4: [458, 362, 258, 194] },
            15: { 1: [1250, 991, 703, 530], 2: [758, 600, 426, 321], 4: [520, 412, 292, 220] },
            16: { 1: [1408, 1082, 775, 602], 2: [854, 656, 470, 365], 4: [586, 450, 322, 250] },
            17: { 1: [1548, 1212, 876, 674], 2: [938, 734, 531, 408], 4: [644, 504, 364, 280] },
            18: { 1: [1725, 1346, 948, 746], 2: [1046, 816, 574, 452], 4: [718, 560, 394, 310] },
            19: { 1: [1903, 1500, 1063, 813], 2: [1153, 909, 644, 493], 4: [792, 624, 442, 338] },
            20: { 1: [2061, 1600, 1159, 919], 2: [1249, 970, 702, 557], 4: [858, 666, 482, 382] },
            21: { 1: [2232, 1708, 1224, 969], 2: [1352, 1035, 742, 587], 4: [929, 711, 509, 403] },
            22: { 1: [2409, 1872, 1358, 1056], 2: [1460, 1134, 823, 640], 4: [1003, 779, 565, 439] },
            23: { 1: [2620, 2059, 1468, 1108], 2: [1588, 1248, 890, 672], 4: [1091, 857, 611, 461] },
            24: { 1: [2812, 2188, 1588, 1228], 2: [1704, 1326, 963, 744], 4: [1171, 911, 661, 511] },
            25: { 1: [3057, 2395, 1718, 1286], 2: [1853, 1451, 1041, 779], 4: [1273, 997, 715, 535] },
            26: { 1: [3283, 2544, 1804, 1425], 2: [1990, 1542, 1094, 864], 4: [1367, 1059, 751, 593] },
            27: { 1: [3517, 2701, 1933, 1501], 2: [2132, 1637, 1172, 910], 4: [1465, 1125, 805, 625] },
            28: { 1: [3669, 2857, 2085, 1581], 2: [2223, 1732, 1263, 958], 4: [1528, 1190, 868, 658] },
            29: { 1: [3909, 3035, 2181, 1677], 2: [2369, 1839, 1322, 1016], 4: [1628, 1264, 908, 698] },
            30: { 1: [4158, 3289, 2358, 1782], 2: [2520, 1994, 1429, 1080], 4: [1732, 1370, 982, 742] },
            31: { 1: [4417, 3486, 2473, 1897], 2: [2677, 2113, 1499, 1150], 4: [1840, 1452, 1030, 790] },
            32: { 1: [4686, 3693, 2670, 2022], 2: [2840, 2238, 1618, 1226], 4: [1952, 1538, 1112, 842] },
            33: { 1: [4965, 3909, 2805, 2157], 2: [3009, 2369, 1700, 1307], 4: [2068, 1628, 1168, 898] },
            34: { 1: [5253, 4134, 2949, 2301], 2: [3183, 2506, 1787, 1394], 4: [2188, 1722, 1228, 958] },
            35: { 1: [5529, 4343, 3081, 2361], 2: [3351, 2632, 1867, 1431], 4: [2303, 1809, 1283, 983] },
            36: { 1: [5836, 4588, 3244, 2524], 2: [3537, 2780, 1966, 1530], 4: [2431, 1911, 1351, 1051] },
            37: { 1: [6153, 4775, 3417, 2625], 2: [3729, 2894, 2071, 1591], 4: [2563, 1989, 1423, 1093] },
            38: { 1: [6479, 5039, 3599, 2735], 2: [3927, 3054, 2181, 1658], 4: [2699, 2099, 1499, 1139] },
            39: { 1: [6743, 5313, 3791, 2927], 2: [4087, 3220, 2298, 1774], 4: [2809, 2213, 1579, 1219] },
            40: { 1: [7089, 5596, 3993, 3057], 2: [4296, 3391, 2420, 1852], 4: [2953, 2331, 1663, 1273] }
        };

        const ecIndex = { L: 0, M: 1, Q: 2, H: 3 }[errorLevel];

        for (let v = 1; v <= 40; v++) {
            if (capacities[v][mode] && dataLength <= capacities[v][mode][ecIndex]) {
                return v;
            }
        }

        throw new Error('Data too long');
    }

    getCharCountBits(mode, version) {
        const versionGroup = version <= 9 ? 0 : version <= 26 ? 1 : 2;
        const bitLengths = {
            1: [10, 12, 14],
            2: [9, 11, 13],
            4: [8, 16, 16]
        };
        return bitLengths[mode][versionGroup];
    }

    encodeData(data, mode, version, errorLevel) {
        const modeBits = this.toBits(mode, 4);
        const charCountBits = this.getCharCountBits(mode, version);
        const charCountValueBits = this.toBits(data.length, charCountBits);
        let dataBits = '';

        if (mode === 1) {
            dataBits = this.encodeNumeric(data);
        } else if (mode === 2) {
            dataBits = this.encodeAlphanumeric(data);
        } else {
            dataBits = this.encodeByte(data);
        }

        let bitString = modeBits + charCountValueBits + dataBits;
        const dataBitsBeforePadding = bitString.length;

        const blocks = this.getRsBlocks(version, errorLevel);
        const dataCodewords = blocks.reduce((sum, block) => sum + block.dataCount, 0);
        const capacityBits = dataCodewords * 8;

        if (bitString.length > capacityBits) {
            throw new Error('Data too long');
        }

        const terminatorBitsAdded = Math.min(4, capacityBits - bitString.length);
        bitString += '0'.repeat(terminatorBitsAdded);

        const padToByteBits = (8 - (bitString.length % 8)) % 8;
        if (padToByteBits !== 0) {
            bitString += '0'.repeat(padToByteBits);
        }

        const padBytes = [0xec, 0x11];
        const padBytesUsed = [];
        let padIndex = 0;
        while (bitString.length < capacityBits) {
            const padByte = padBytes[padIndex % 2];
            padBytesUsed.push(padByte);
            bitString += this.toBits(padByte, 8);
            padIndex++;
        }

        const dataBytes = this.bitsToBytes(bitString).slice(0, dataCodewords);
        return {
            dataBytes,
            bitString,
            capacityBits,
            dataCodewords,
            modeBits,
            charCountBits,
            charCountValueBits,
            dataBits,
            dataBitsBeforePadding,
            terminatorBitsAdded,
            padToByteBits,
            padBytesUsed
        };
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

    getRsBlocks(version, errorLevel) {
        const entry = this.rsBlockTable[version][errorLevel];
        const blocks = [];

        if (entry.length === 3) {
            const [count, totalCount, dataCount] = entry;
            for (let i = 0; i < count; i++) {
                blocks.push({ totalCount, dataCount, ecCount: totalCount - dataCount });
            }
        } else if (entry.length === 6) {
            const [count1, total1, data1, count2, total2, data2] = entry;
            for (let i = 0; i < count1; i++) {
                blocks.push({ totalCount: total1, dataCount: data1, ecCount: total1 - data1 });
            }
            for (let i = 0; i < count2; i++) {
                blocks.push({ totalCount: total2, dataCount: data2, ecCount: total2 - data2 });
            }
        } else {
            throw new Error('Invalid RS block table entry');
        }

        return blocks;
    }

    createCodewords(dataBytes, blocks) {
        const dataBlocks = [];
        let offset = 0;

        for (const block of blocks) {
            const blockData = dataBytes.slice(offset, offset + block.dataCount);
            offset += block.dataCount;
            const ecBlock = this.generateErrorCorrectionCodewords(blockData, block.ecCount);
            dataBlocks.push({ data: blockData, ec: ecBlock });
        }

        const maxDataLength = Math.max(...dataBlocks.map(block => block.data.length));
        const maxEcLength = Math.max(...dataBlocks.map(block => block.ec.length));
        const result = [];

        // Interleave data blocks
        for (let i = 0; i < maxDataLength; i++) {
            for (const block of dataBlocks) {
                if (i < block.data.length) {
                    result.push(block.data[i]);
                }
            }
        }

        // Interleave EC blocks
        for (let i = 0; i < maxEcLength; i++) {
            for (const block of dataBlocks) {
                if (i < block.ec.length) {
                    result.push(block.ec[i]);
                }
            }
        }

        return result;
    }

    createMatrix(version) {
        const size = version * 4 + 17;
        const matrix = Array(size).fill(null).map(() => Array(size).fill(null));

        this.addFinderPatterns(matrix);
        this.addSeparators(matrix);
        this.addTimingPatterns(matrix, size);
        this.addAlignmentPatterns(matrix, version, size);
        this.addReservedAreas(matrix, version, size);
        this.addDarkModule(matrix, version);
        this.addVersionInfo(matrix, version, size);

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

    addSeparators(matrix) {
        const size = matrix.length;
        const positions = [[0, 0], [size - 7, 0], [0, size - 7]];

        for (const [x, y] of positions) {
            for (let i = -1; i <= 7; i++) {
                for (let j = -1; j <= 7; j++) {
                    const row = y + i;
                    const col = x + j;
                    if (row < 0 || col < 0 || row >= size || col >= size) continue;
                    if (i >= 0 && i <= 6 && j >= 0 && j <= 6) continue;
                    if (matrix[row][col] === null) {
                        matrix[row][col] = 0;
                    }
                }
            }
        }
    }

    addTimingPatterns(matrix, size) {
        for (let i = 8; i < size - 8; i++) {
            matrix[6][i] = i % 2 === 0 ? 1 : 0;
            matrix[i][6] = i % 2 === 0 ? 1 : 0;
        }
    }

    addAlignmentPatterns(matrix, version, size) {
        const positions = this.getAlignmentPatternPositions(version);
        if (positions.length === 0) return;

        for (const x of positions) {
            for (const y of positions) {
                if (this.isOverlap(matrix, x, y, size)) continue;

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
            1: [],
            2: [6, 18],
            3: [6, 22],
            4: [6, 26],
            5: [6, 30],
            6: [6, 34],
            7: [6, 22, 38],
            8: [6, 24, 42],
            9: [6, 26, 46],
            10: [6, 28, 50],
            11: [6, 30, 54],
            12: [6, 32, 58],
            13: [6, 34, 62],
            14: [6, 26, 46, 66],
            15: [6, 26, 48, 70],
            16: [6, 26, 50, 74],
            17: [6, 30, 54, 78],
            18: [6, 30, 56, 82],
            19: [6, 30, 58, 86],
            20: [6, 34, 62, 90],
            21: [6, 28, 50, 72, 94],
            22: [6, 26, 50, 74, 98],
            23: [6, 30, 54, 78, 102],
            24: [6, 28, 54, 80, 106],
            25: [6, 32, 58, 84, 110],
            26: [6, 30, 58, 86, 114],
            27: [6, 34, 62, 90, 118],
            28: [6, 26, 50, 74, 98, 122],
            29: [6, 30, 54, 78, 102, 126],
            30: [6, 26, 52, 78, 104, 130],
            31: [6, 30, 56, 82, 108, 134],
            32: [6, 34, 60, 86, 112, 138],
            33: [6, 30, 58, 86, 114, 142],
            34: [6, 34, 62, 90, 118, 146],
            35: [6, 30, 54, 78, 102, 126, 150],
            36: [6, 24, 50, 76, 102, 128, 154],
            37: [6, 28, 54, 80, 106, 132, 158],
            38: [6, 32, 58, 84, 110, 136, 162],
            39: [6, 26, 54, 82, 110, 138, 166],
            40: [6, 30, 58, 86, 114, 142, 170]
        };

        return positions[version] || [];
    }

    isOverlap(matrix, x, y, size) {
        if ((x <= 8 && y <= 8) || (x >= size - 9 && y <= 8) || (x <= 8 && y >= size - 9)) {
            return true;
        }
        return false;
    }

    addDarkModule(matrix, version) {
        matrix[4 * version + 9][8] = 1;
    }

    addReservedAreas(matrix, version, size) {
        for (let i = 0; i < 9; i++) {
            if (i !== 6) {
                matrix[8][i] = -1;
                matrix[i][8] = -1;
            }
        }

        for (let i = 0; i < 7; i++) {
            matrix[size - 1 - i][8] = -1;
        }
        for (let i = 0; i < 8; i++) {
            matrix[8][size - 1 - i] = -1;
        }

        if (version >= 7) {
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 3; j++) {
                    matrix[i][size - 11 + j] = -1;
                    matrix[size - 11 + j][i] = -1;
                }
            }
        }
    }

    addVersionInfo(matrix, version, size) {
        if (version < 7) return;

        let bits = version << 12;
        const generator = 0x1f25;

        for (let i = 17; i >= 12; i--) {
            if ((bits >> i) & 1) {
                bits ^= generator << (i - 12);
            }
        }

        const versionBits = (version << 12) | (bits & 0xfff);

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 3; j++) {
                const bit = (versionBits >> (i * 3 + j)) & 1;
                matrix[i][size - 11 + j] = bit;
                matrix[size - 11 + j][i] = bit;
            }
        }
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
                        matrix[y][col] = bitIndex < data.length * 8 ?
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

    applyMask(matrix, dataMask, maskPattern) {
        const size = matrix.length;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!dataMask[y][x]) continue;
                if (this.maskCondition(maskPattern, x, y)) {
                    matrix[y][x] = matrix[y][x] ? 0 : 1;
                }
            }
        }
    }

    maskCondition(maskPattern, x, y) {
        switch (maskPattern) {
            case 0:
                return (x + y) % 2 === 0;
            case 1:
                return y % 2 === 0;
            case 2:
                return x % 3 === 0;
            case 3:
                return (x + y) % 3 === 0;
            case 4:
                return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
            case 5:
                return ((x * y) % 2) + ((x * y) % 3) === 0;
            case 6:
                return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
            case 7:
                return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
            default:
                return false;
        }
    }

    selectBestMask(matrix, dataMask, errorLevel, version) {
        let bestMask = 0;
        let bestScore = Infinity;
        const penalties = [];

        for (let mask = 0; mask < 8; mask++) {
            const temp = matrix.map(row => row.slice());
            this.applyMask(temp, dataMask, mask);
            this.addFormatInfo(temp, errorLevel, mask);
            const score = this.evaluateMask(temp);
            penalties[mask] = score;
            if (score < bestScore) {
                bestScore = score;
                bestMask = mask;
            }
        }

        return { maskPattern: bestMask, penalties };
    }

    evaluateMask(matrix) {
        const size = matrix.length;
        let penalty = 0;

        for (let y = 0; y < size; y++) {
            let runColor = matrix[y][0];
            let runLength = 1;
            for (let x = 1; x < size; x++) {
                if (matrix[y][x] === runColor) {
                    runLength++;
                } else {
                    if (runLength >= 5) penalty += 3 + (runLength - 5);
                    runColor = matrix[y][x];
                    runLength = 1;
                }
            }
            if (runLength >= 5) penalty += 3 + (runLength - 5);
        }

        for (let x = 0; x < size; x++) {
            let runColor = matrix[0][x];
            let runLength = 1;
            for (let y = 1; y < size; y++) {
                if (matrix[y][x] === runColor) {
                    runLength++;
                } else {
                    if (runLength >= 5) penalty += 3 + (runLength - 5);
                    runColor = matrix[y][x];
                    runLength = 1;
                }
            }
            if (runLength >= 5) penalty += 3 + (runLength - 5);
        }

        for (let y = 0; y < size - 1; y++) {
            for (let x = 0; x < size - 1; x++) {
                const value = matrix[y][x];
                if (
                    value === matrix[y][x + 1] &&
                    value === matrix[y + 1][x] &&
                    value === matrix[y + 1][x + 1]
                ) {
                    penalty += 3;
                }
            }
        }

        const pattern = [1, 0, 1, 1, 1, 0, 1];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x <= size - 7; x++) {
                if (pattern.every((val, idx) => matrix[y][x + idx] === val)) {
                    if (this.hasLightBorder(matrix[y], x, x + 6)) {
                        penalty += 40;
                    }
                }
            }
        }

        for (let x = 0; x < size; x++) {
            for (let y = 0; y <= size - 7; y++) {
                if (pattern.every((val, idx) => matrix[y + idx][x] === val)) {
                    const column = matrix.map(row => row[x]);
                    if (this.hasLightBorder(column, y, y + 6)) {
                        penalty += 40;
                    }
                }
            }
        }

        const totalModules = size * size;
        const darkModules = matrix.flat().filter(value => value === 1).length;
        const darkPercent = (darkModules / totalModules) * 100;
        const deviation = Math.abs(darkPercent - 50);
        penalty += Math.floor(deviation / 5) * 10;

        return penalty;
    }

    hasLightBorder(line, start, end) {
        const left = line.slice(Math.max(0, start - 4), start);
        const right = line.slice(end + 1, end + 5);
        const leftClear = left.length === 4 && left.every(val => val === 0);
        const rightClear = right.length === 4 && right.every(val => val === 0);
        return leftClear || rightClear;
    }

    generateErrorCorrectionCodewords(data, numCodewords) {
        const generator = this.buildGeneratorPolynomial(numCodewords);
        const message = [...data, ...new Array(numCodewords).fill(0)];

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

    addFormatInfo(matrix, errorLevel, maskPattern) {
        const size = matrix.length;
        const ecBits = { L: 1, M: 0, Q: 3, H: 2 }[errorLevel];
        const data = (ecBits << 3) | maskPattern;
        let bits = data << 10;
        const generator = 0x537;

        for (let i = 14; i >= 10; i--) {
            if ((bits >> i) & 1) {
                bits ^= generator << (i - 10);
            }
        }

        const formatBits = ((data << 10) | (bits & 0x3ff)) ^ 0x5412;
        const bitArray = Array.from({ length: 15 }, (_, i) => (formatBits >> i) & 1);

        // Top-left placement: bitArray index maps to bit number (0=LSB, 14=MSB)
        // QR spec: bit 14 should be placed first (leftmost/upmost)
        // So we place bitArray[14-i] at position i
        for (let i = 0; i <= 5; i++) {
            matrix[8][i] = bitArray[14 - i];
        }
        matrix[8][7] = bitArray[14 - 6];
        matrix[8][8] = bitArray[14 - 7];
        matrix[7][8] = bitArray[14 - 8];
        for (let i = 9; i < 15; i++) {
            matrix[14 - i][8] = bitArray[14 - i];
        }

        // Bottom-left vertical: bits go to rows (size-1) down to (size-7)
        for (let i = 0; i < 7; i++) {
            matrix[size - 1 - i][8] = bitArray[14 - i];
        }
        // Top-right horizontal: cols (size-8) through (size-1)
        for (let i = 7; i < 15; i++) {
            matrix[8][size - 8 + (i - 7)] = bitArray[14 - i];
        }

        return bitArray;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRCode;
}
