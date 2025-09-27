// Import necessary modules and set up app
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors()); // Enable CORS

// Configure file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

// Helper function to run Python text-to-speech script
const textToSpeech = (text) => {
    return new Promise((resolve, reject) => {
        const outputFile = path.join(__dirname, 'uploads', 'output_audio.mp3');
        // Execute Python script for text-to-speech
        exec(`python text_to_speech.py "${text}"`, (error) => {
            if (error) reject(`Error: ${error.message}`);
            resolve(outputFile);
        });
    });
};

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded.');

        const filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const dataBuffer = fs.readFileSync(filePath);
        let extractedText = '';

        if (fileExtension === '.pdf') {
            const pdf = (await import('pdf-parse')).default;
            const data = await pdf(dataBuffer);
            extractedText = data.text.replace(/\n{2,}/g, '<br><br>');

        } else if (fileExtension === '.docx') {
            const mammoth = await import('mammoth');
            const result = await mammoth.convertToHtml({ buffer: dataBuffer });
            extractedText = result.value;

        } else if (fileExtension === '.pptx') {
            const pptx = await import('pptx-parser');
            extractedText = await pptx.parse(dataBuffer);
            extractedText = extractedText.replace(/\n/g, '<br><br>');
        } else {
            return res.status(400).send('Unsupported file type.');
        }

        // Clean extracted text for text-to-speech
        const cleanedText = extractedText.replace(/<[^>]*>/g, '');
        
        // Generate audio and store in uploads folder
        const audioFilePath = await textToSpeech(cleanedText);

        // Send response with HTML text and audio file path
        res.send({
            text: extractedText, // HTML content with formatting
            audio: `http://localhost:5000/uploads/output_audio.mp3`
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing the file.');
    }
});

// Serve static files for audio playback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(5000, () => {
    console.log(`Server is running on http://localhost:5000`);
});