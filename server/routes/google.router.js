const express = require('express'); // Express web server framework
const router = express.Router();


 

router.post('/transcription', async function (req, res) {
    console.log('post to googleCloud hit');
    
    // Imports the Google Cloud client library
    const speech = require('@google-cloud/speech');
    const fs = require('fs');

    // Creates a client
    const client = new speech.SpeechClient();

    // The name of the audio file to transcribe
    const fileName = './resources/sampleinterview2.wav';
    

    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');
    

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
        content: audioBytes,
    };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 44100,
        languageCode: 'en-US',
        audioChannelCount: 2,
        enableSeparateRecognitionPerChannel: true,
    };
    const request = {
        audio: audio,
        config: config,
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    console.log(`Transcription: ${transcription}`);
    res.send(transcription);
});

module.exports = router;