const descriptions = {
    caesar: "The Caesar cipher is a substitution cipher where each letter is shifted a certain number of places down or up the alphabet.",
    railfence: "The plaintext is written in a zigzag pattern and then read off line by line. The depth is followed by the given key value.",
    playfair: "The Playfair cipher encrypts pairs of letters (bigrams) instead of single letters.",
    hill: "The Hill cipher uses linear algebra and matrix multiplication to encrypt blocks of text.",
    poly: "The Polyalphabetic cipher uses multiple substitution alphabets to encrypt the text."
};

function selectCipher(algo) {
    document.getElementById("cipherName").innerText = algo.charAt(0).toUpperCase() + algo.slice(1) + " Cipher";
    document.getElementById("description").innerText = descriptions[algo];
    
    // Show the input options
    document.getElementById("cipherOptions").style.display = 'block';
    
    // Clear previous results
    document.getElementById("result").innerText = '';

    // Show or hide rails input based on selected algorithm
    if (algo === 'railfence') {
        document.getElementById("rails").style.display = 'block';
        document.querySelector('label[for=rails]').style.display = 'block';
        document.getElementById("key").style.display = 'none'; // Hide key input for Rail Fence
        document.querySelector('label[for=key]').style.display = 'none'; // Hide key label
    } else {
        document.getElementById("rails").style.display = 'none';
        document.querySelector('label[for=rails]').style.display = 'none';
        document.getElementById("key").style.display = 'block'; // Show key input for other ciphers
        document.querySelector('label[for=key]').style.display = 'block'; // Show key label
    }
}

// Process encryption or decryption based on user input
function processCipher() {
    const algo = document.getElementById("cipherName").innerText.split(" ")[0].toLowerCase();
    const text = document.getElementById("inputText").value.replace(/[^A-Za-z]/g, '').toUpperCase();

    if (algo === 'railfence') {
        const rails = parseInt(document.getElementById("rails").value);
        
        if (text.length === 0 || rails < 2) {
            alert("Please enter valid input text and number of rails.");
            return;
        }

        if (document.querySelector(' input[name="action"]:checked').value === 'encrypt') {
            const encrypted = encryptRailFence(text, rails);
            document.getElementById("result").innerText = "Ciphertext (Rail Fence): " + encrypted;
        } else {
            const decrypted = decryptRailFence(text, rails);
            document.getElementById("result").innerText = "Plaintext (Rail Fence): " + decrypted;
        }
        
        return; // Exit after handling Rail Fence
    }

    const key = document.getElementById("key").value;

    if (document.querySelector('input[name="action"]:checked').value === 'encrypt') {
        switch (algo) {
            case 'caesar':
                convertToCipherCaesar(text, key);
                break;
            case 'playfair':
                convertToCipherPlayfair(text, key);
                break;
            case 'hill':
                convertToCipherHill(text);
                break;
            case 'poly':
                convertToCipherPoly(text, key);
                break;
        }
    } else {
        switch (algo) {
            case 'caesar':
                convertToPlainCaesar(text, key);
                break;
            case 'playfair':
                convertToPlainPlayfair(text, key);
                break;
            case 'hill':
                alert("Decryption not implemented for Hill Cipher.");
                break; // Implement decryption if needed
            case 'poly':
                convertToPlainPoly(text, key);
                break;
        }
    }
}

// Caesar Cipher Functions
function convertToCipherCaesar(text, shift) {
    const encrypted = text.split('').map(char => {
        if (char.match(/[A-Z]/i)) {
            const code = char.charCodeAt();
            const base = code >= 65 && code <= 90 ? 65 : 97; // ASCII A=65, a=97
            return String.fromCharCode(((code - base + parseInt(shift)) % 26) + base);
        }
        return char; // Non-alphabetical characters remain unchanged
    }).join('');

    document.getElementById("result").innerText = "Ciphertext (Caesar): " + encrypted;
}

function convertToPlainCaesar(text, shift) {
    const decrypted = text.split('').map(char => {
        if (char.match(/[A-Z]/i)) {
            const code = char.charCodeAt();
            const base = code >= 65 && code <= 90 ? 65 : 97; // ASCII A=65, a=97
            return String.fromCharCode(((code - base - parseInt(shift) + 26) % 26) + base);
        }
        return char; // Non-alphabetical characters remain unchanged
    }).join('');

    document.getElementById("result").innerText = "Plaintext (Caesar): " + decrypted;
}

// Rail Fence Cipher Functions
function encryptRailFence(text, key) {
    let rail = Array.from({ length: key }, () => []);
    
    let dir_down = false; // Direction flag
    let row = 0;

    for (let char of text) {
        // Change direction if we've just filled the top or bottom rail
        if (row === 0 || row === key - 1) dir_down = !dir_down;

        // Fill the corresponding alphabet
        rail[row].push(char);

        // Find the next row using direction flag                                                                             
        dir_down ? row++ : row--;
    }

    // Construct the cipher using the rail matrix
    let result = '';
    for (let i = 0; i < key; i++)
        for (let j = 0; j < text.length; j++)
            if (rail[i][j] !== undefined) result += rail[i][j];

    return result;
}

function decryptRailFence(cipher, key) {
    let rail = Array.from({ length: key }, () => []);
    
    let dir_down = false; // Direction flag
    let row = 0;

    // Mark positions in rail
    for (let i = 0; i < cipher.length; i++) {
        // Change direction if we've just filled the top or bottom rail
        if (row === 0) dir_down = true;
        if (row === key - 1) dir_down = false;

        // Place a marker in the rail matrix
        rail[row].push('*');

        // Find the next row using direction flag
        dir_down ? row++ : row--;
    }

    // Fill in the placeholders with actual characters from cipher text
    let index = 0;
    for (let i = 0; i < key; i++)
        for (let j = 0; j < cipher.length; j++)
            if (rail[i][j] === '*' && index < cipher.length) rail[i][j] = cipher[index++];

    // Read characters in zig-zag manner to construct the resultant text
    let result = '';
    row = 0;
    dir_down = false;

    for (let i = 0; i < cipher.length; i++) {
        // Change direction at the top and bottom rails
        if (row === 0) dir_down = true;
        if (row === key - 1) dir_down = false;

        // Place the character in result if it's not a placeholder
        if (rail[row][i % rail[row].length] !== '*') result += rail[row][i % rail[row].length];

        // Find the next row using direction flag
        dir_down ? row++ : row--;
    }

    return result;
}

// Playfair Cipher Functions
function playfairCipher(text, key, decrypt = false) {
    const matrix = createPlayfairMatrix(key);
    text = preparePlayfairText(text);
    let result = '';

    for (let i = 0; i < text.length; i += 2) {
        let char1 = text[i];
        let char2 = (i + 1 < text.length) ? text[i + 1] : 'X'; // Add X if odd length

        const pos1 = findPosition(matrix, char1);
        const pos2 = findPosition(matrix, char2);

        if (pos1.row === pos2.row) { // Same row 
            result += matrix[pos1.row][(pos1.col + (decrypt ? -1 : 1) + 5) % 5];
            result += matrix[pos2.row][(pos2.col + (decrypt ? -1 : 1) + 5) % 5];
        } else if (pos1.col === pos2.col) { // Same column 
            result += matrix[(pos1.row + (decrypt ? -1 : 1) + 5) % 5][pos1.col];
            result += matrix[(pos2.row + (decrypt ? -1 : 1) + 5) % 5][pos2.col];
        } else { // Rectangle swap 
            result += matrix[pos1.row][pos2.col];
            result += matrix[pos2.row][pos1.col];
        }
    }
    return result;
}

function createPlayfairMatrix(key) {
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // I/J are combined 
    let usedChars = new Set();
    let matrix = [];

    for (let char of key.toUpperCase()) {
        if (!usedChars.has(char) && alphabet.includes(char)) {
            usedChars.add(char);
            matrix.push(char);
        }
    }
    for (let char of alphabet) {
        if (!usedChars.has(char)) {
            usedChars.add(char);
            matrix.push(char);
        }
    }

    return [
        [matrix[0], matrix[1], matrix[2], matrix[3], matrix[4]],
        [matrix[5], matrix[6], matrix[7], matrix[8], matrix[9]],
        [matrix[10], matrix[11], matrix[12], matrix[13], matrix[14]],
        [matrix[15], matrix[16], matrix[17], matrix[18], matrix[19]],
        [matrix[20], matrix[21], matrix[22], matrix[23], matrix[24]]
    ];
}

function findPosition(matrix, char) {
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (matrix[row][col] === char) {
                return { row: row, col: col };
            }
        }
    }
}

function preparePlayfairText(text) {
    text = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    let preparedText = '';

    for (let i = 0; i < text.length; i++) {
        preparedText += text[i];
        if (i + 1 < text.length && text[i] === text[i + 1]) {
            preparedText += 'X'; // Insert X between duplicate letters
        }
    }
    return preparedText;
}

function convertToCipherPlayfair(text, key) {
    const encrypted = playfairCipher(text, key);
    document.getElementById("result").innerText = "Ciphertext (Playfair): " + encrypted;
}

function convertToPlainPlayfair(text, key) {
    const decrypted = playfairCipher(text, key, true);
    document.getElementById("result").innerText = "Plaintext (Playfair): " + decrypted;
}

// Hill Cipher Functions
function hillCipher(text, keyMatrix, decrypt = false) {
    const size = Math.sqrt(keyMatrix.length); // Assuming square keyMatrix 
    let result = '';
    let paddedText = padHillText(text, size);

    for (let i = 0; i < paddedText.length; i += size) {
        let block = paddedText.slice(i, i + size).split('').map(c => c.charCodeAt(0) - 'A'.charCodeAt(0));
        let transformedBlock = new Array(size).fill(0);

        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                transformedBlock[j] += keyMatrix[j * size + k] * block[k];
            }
            transformedBlock[j] %= 26; // Modulo to wrap around alphabet 
        }
        transformedBlock.forEach(num => result += String.fromCharCode(num + 'A'.charCodeAt(0)));
    }
    return result;
}

function padHillText(text, size) {
    while (text.length % size !== 0) text += 'X'; // Padding with X 
    return text.toUpperCase().replace(/[^A-Z]/g, '');
}

// Example usage of Hill Cipher with a fixed keyMatrix 
const hillKeyMatrixExample = [
    6, 24, 1,
    13, 16, 10,
    20, 17, 15,
];

function convertToCipherHill(text) {
    const encrypted = hillCipher(text, hillKeyMatrixExample);
    document.getElementById("result").innerText = "Ciphertext (Hill): " + encrypted;
}

// Polyalphabetic Cipher Functions
function polyalphabeticCipher(text, key, decrypt = false) {
    let result = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < text.length; i++) {
        const textCharIndex = alphabet.indexOf(text[i].toUpperCase());
        const keyCharIndex = alphabet.indexOf(key[i % key.length].toUpperCase());

        if (textCharIndex !== -1) {
            if (!decrypt) {
                result += alphabet[(textCharIndex + keyCharIndex) % alphabet.length];
            } else {
                result += alphabet[(textCharIndex - keyCharIndex + alphabet.length) % alphabet.length];
            }
        } else {
            result += text[i]; // Non-alphabetical characters remain unchanged 
        }
    }

    return result;
}

function convertToCipherPoly(text, key) {
    const encrypted = polyalphabeticCipher(text.toUpperCase(), key);
    document.getElementById("result").innerText = "Ciphertext (Polyalphabetic): " + encrypted;
}

function convertToPlainPoly(text, key) {
    const decrypted = polyalphabeticCipher(text.toUpperCase(), key, true);
    document.getElementById("result").innerText = "Plaintext (Polyalphabetic): " + decrypted;
}