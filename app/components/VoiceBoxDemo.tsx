import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoContext } from '@/lib/demo-context';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface VoiceBoxDemoProps {
  onTextModeToggle: () => void;
}

export default function VoiceBox({ onTextModeToggle }: VoiceBoxDemoProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const {
    messages,
    setMessages,
    lastMessage,
    setLastMessage,
    isLoading,
    setIsLoading,
    addMessage,
  } = useDemoContext();


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Transcription API error:', errorData);
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setTranscript('Failed to transcribe audio. Please try again.');
    }
  };

  const submitVoiceMessage = async () => {
    if (!transcript.trim()) return;
    
    const userMessage: Message = { 
      role: 'user', 
      content: transcript.trim() 
    };
    
    addMessage(userMessage);
        
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.content 
      };
      
      addMessage(assistantMessage);
      
      speakResponse(data.content);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      addMessage(errorMessage);
    }
    
    setTranscript('');
  };

  const speakResponse = async (text: string) => {
    setIsSpeaking(true);
    
    try {
      const elevenlabsApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      if (elevenlabsApiKey) {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenlabsApiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to get voice response');
        }
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play();
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full w-full mx-auto p-4">
      <div className="flex justify-between mb-4">
        <button 
          onClick={onTextModeToggle}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg transition-all hover:bg-blue-600"
        >
          Back to Chat
        </button>
      </div>
      <motion.div 
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
        {isSpeaking ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <div className="flex space-x-1">
                {/* Simple audio wave animation */}
                <div className="w-2 h-8 bg-blue-500 animate-pulse"></div>
                <div className="w-2 h-12 bg-blue-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-16 bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-10 bg-blue-500 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-2 h-8 bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            <p className="text-lg">Companion is speaking...</p>
          </motion.div>
        ) : isRecording ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[300px]"
          >
            <button
              onClick={toggleRecording}
              className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center mb-4 hover:bg-red-200 transition"
            >
              <div className="w-16 h-16 rounded-full bg-red-500 animate-pulse"></div>
            </button>
            <p className="text-lg mb-2">Recording... (Tap to stop)</p>
          </motion.div>
        ) : transcript ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="mb-4">
              <p className="text-lg mb-2">Your message:</p>
              <p className="bg-blue-100 p-3 rounded-lg max-w-md mx-auto">{transcript}</p>
              <div className="mt-4 flex space-x-3 justify-center">
                <button 
                  onClick={() => setTranscript('')}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-all hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitVoiceMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg transition-all hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[300px]"
          >
            <button 
              onClick={toggleRecording}
              className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4 hover:bg-blue-200 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
            <p className="text-lg">Tap to speak</p>
            {lastMessage && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 p-4 bg-gray-100 rounded-lg max-w-md mx-auto text-left"
              >
                <p className="text-sm text-gray-500 mb-1">
                  {lastMessage.role === 'user' ? 'You' : 'Companion'}:
                </p>
                <p>{lastMessage.content}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}