import { NextResponse } from 'next/server';
import { SpeechClient, protos } from '@google-cloud/speech';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // const speechClient = new SpeechClient({
    //   keyFilename: path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!)
    // });
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '');
    const speechClient = new SpeechClient({
      credentials: credentials
    });
    
    const speechRequest = {
      audio: {
        content: buffer.toString('base64'),
      },
      config: {
        encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sampleRateHertz: 48000,
        languageCode: 'en-US',
      },
    };
    
    const responseArray = await speechClient.recognize(speechRequest);
    const recognizeResponse = responseArray[0];
    
    let transcription = '';
    if (recognizeResponse.results && recognizeResponse.results.length > 0) {
      transcription = recognizeResponse.results
        .map((result) => {
          if (result.alternatives && result.alternatives.length > 0) {
            return result.alternatives[0].transcript || '';
          }
          return '';
        })
        .join('\n');
    }
    
    return NextResponse.json({ transcript: transcription });
  } catch (error) {
    console.error('Speech-to-Text API error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}