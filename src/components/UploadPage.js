import React, { useState } from 'react';
import axios from 'axios';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [audioUrls, setAudioUrls] = useState([]);  // Change from single audioFile to array of URLs
    const [error, setError] = useState(null);
    const [documentText, setDocumentText] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleUpload = () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            axios.post('http://localhost:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((response) => {
                setDocumentText(response.data.text);  // Set document text content
                setAudioUrls(response.data.audioUrls);  // Update to handle array of audio URLs
            })
            .catch((err) => {
                console.error("Error uploading file", err);
                setError('Failed to upload the file. Please try again.');
            });
        } else {
            setError('Please select a file before uploading.');
        }
    };

    // Function to play audio URLs in sequence
    const playAudioSequentially = async () => {
        for (let i = 0; i < audioUrls.length; i++) {
            await playAudio(audioUrls[i]);
        }
    };

    // Helper function to play a single audio URL and wait for it to finish
    const playAudio = (url) => {
        return new Promise((resolve) => {
            const audio = new Audio(url);
            audio.onended = resolve;  // Resolve promise when audio finishes
            audio.play();
        });
    };

    return (
        <div className="upload-page">
            <div className="content">
                <h1>Upload Document for Text-to-Speech</h1>
                <input type="file" accept=".docx,.pdf,.pptx" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload</button>

                <div id="document-container" style={{ padding: '20px', backgroundColor: '#f4f4f4' }}>
                    <h3>Uploaded Document:</h3>
                    <div
                        style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}
                        dangerouslySetInnerHTML={{ __html: documentText }}
                    ></div>
                </div>

                {audioUrls.length > 0 && (
                    <div id="audio-container">
                        <h3>Generated Audio:</h3>
                        <button onClick={playAudioSequentially}>Play Audio</button>  {/* Button to start sequential playback */}
                    </div>
                )}

                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
};

export default UploadPage;