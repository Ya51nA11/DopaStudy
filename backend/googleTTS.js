/*const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

// Create Google TTS client
const client = new textToSpeech.TextToSpeechClient();

// Function to convert text to speech
async function googleTTS(text, languageCode = 'en-US') {
  // Construct the request
  const request = {
    input: { text },
    voice: { languageCode, ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);

  // Write the binary audio content to a local file
  const outputFile = `output-${Date.now()}.mp3`;
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(outputFile, response.audioContent, 'binary');
  console.log(`Audio content written to file: ${outputFile}`);

  return outputFile;  // Return path of the audio file
}

module.exports = { googleTTS };*/

import googleTTS from 'google-tts-api';

// Function to split text into manageable chunks
const splitTextIntoChunks = (text, chunkSize = 200) => {
    const chunks = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
        chunks.push(text.slice(currentIndex, currentIndex + chunkSize));
        currentIndex += chunkSize;
    }

    return chunks;
};

// Main function to generate Google TTS URLs for all text chunks
export const googleTTSFunction = async (text, lang = 'en') => {
    const chunks = splitTextIntoChunks(text);
    const audioUrls = await Promise.all(
        chunks.map(chunk =>
            googleTTS.getAudioUrl(chunk, {
                lang: lang,
                slow: false,
                host: 'https://translate.google.com',
            })
        )
    );
    return audioUrls;  // Array of URLs for sequential playback
};