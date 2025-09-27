from gtts import gTTS
from pydub import AudioSegment
import os
import sys
import math
import tempfile

def text_to_speech(text, output_file):
    # Normalize whitespace: replace double newlines with a period and space for pauses between paragraphs
    text = text.replace('\n\n', '. ')
    text = ' '.join(text.split())  # Remove any remaining extra whitespace
    
    # Define the maximum character length per chunk for gTTS
    chunk_size = 4000  # Adjust this if necessary
    # Calculate the number of chunks needed
    num_chunks = math.ceil(len(text) / chunk_size)
    
    # Use a temporary directory to store chunks
    with tempfile.TemporaryDirectory() as temp_dir:
        audio_chunks = []
        
        # Create audio chunks
        for i in range(num_chunks):
            chunk_text = text[i * chunk_size: (i + 1) * chunk_size]
            tts = gTTS(chunk_text, lang='en')
            
            # Temporary file for this chunk
            chunk_filename = os.path.join(temp_dir, f"temp_chunk_{i}.mp3")
            tts.save(chunk_filename)
            audio_chunks.append(chunk_filename)
        
        # Combine all audio chunks
        combined_audio = AudioSegment.empty()
        for chunk_filename in audio_chunks:
            # Read each chunk and append to combined audio
            combined_audio += AudioSegment.from_mp3(chunk_filename)
        
        # Export the combined audio as the final output file
        combined_audio.export(output_file, format="mp3")

if __name__ == "__main__":
    # Check if text is provided
    if len(sys.argv) < 2:
        print("No text provided. Please provide the text to convert to speech.")
        sys.exit(1)
    
    # Join all command line arguments into a single string
    text = " ".join(sys.argv[1:]).replace('\\"', '"')  # Unescape the text
    output_file = "output_audio.mp3"
    
    # Generate the speech and save to file
    text_to_speech(text, output_file)
    
    # Return the output file path
    print(f"Audio saved to {output_file}")