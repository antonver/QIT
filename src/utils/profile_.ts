export default function extractNumberAndWord(str) {
    // Match a number (with optional %) and a word
    const regex = /^(\d+(?:\.\d+)?)(?:%)?\s*(\w+)$/;
    const match = str.match(regex);

    if (match) {
        return {
            number: parseFloat(match[1]), // Extracted number
            word: match[2] // Extracted word
        };
    }
    return null; // Return null if no match
}