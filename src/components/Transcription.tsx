import React, { useState, useEffect, useRef } from 'react';
import { useMicVAD } from '@ricky0123/vad-react';
import './Transcription.css';

const TranscriptionOutput = React.memo(({ transcription }: { transcription: string }) => {
  return <p>{transcription}</p>;
});

const Transcription = () => {
  const [backendTranscription, setBackendTranscription] = useState('');
  const [useDiarization, setUseDiarization] = useState(false);
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  const wsRef = useRef<WebSocket | null>(null);

  // Fetch available voices on load
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('http://localhost:5001/voices');
        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }
        const data = await response.json();
        setVoices(data);
        if (data.length > 0) setSelectedVoice(data[0].voice_id); // Set default voice
      } catch (error) {
        console.error('Error fetching voices:', error);
      }
    };

    fetchVoices();
  }, []);

  const handleGenerateVoice = async () => {
    if (!text || !selectedVoice) {
      alert('Please enter text and select a voice');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const { audioUrl } = await response.json();

      // Force audio refresh by appending a unique timestamp
      setAudioUrl(`http://localhost:5001${audioUrl}?t=${Date.now()}`);
    } catch (error) {
      console.error('Error generating voice:', error);
      alert(error.message);
    }
  };



  // WebSocket Connection
  useEffect(() => {
    connectWebSocket();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    const ws = new WebSocket('ws://localhost:5001');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      try {
        const { transcription, error } = JSON.parse(event.data);
        if (error) {
          console.error('Backend error:', error);
          setError(error);
          return;
        }
        setBackendTranscription((prev) => prev + ' ' + transcription);
      } catch (err) {
        console.error('Error parsing WebSocket data:', err);
      }
    };

    ws.onerror = () => {
      console.error('WebSocket error, reconnecting...');
      setTimeout(connectWebSocket, 5000);
    };

    ws.onclose = () => {
      console.log('WebSocket closed, attempting to reconnect...');
      setTimeout(connectWebSocket, 5000);
    };
  };

  // Handle Audio Processing for VAD
  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechStart: () => {
      console.log('Speech started');
    },
    onSpeechEnd: (audio) => {
      console.log('User stopped speaking');
      handleAudioProcessing(audio);
    },
    additionalAudioConstraints: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const handleAudioProcessing = async (audioData) => {
    try {
      const wavBlob = encodeWAV(audioData);
      const audioBase64 = await convertBlobToBase64(wavBlob);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            audioChunk: audioBase64,
            diarization: useDiarization,
          })
        );
        console.log('Audio chunk sent to WebSocket');
      } else {
        console.error('WebSocket not open, skipping audio chunk');
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio.');
    }
  };

  // AI Voice Generation


  // Utility Functions
  // Convert raw audio samples to WAV format
const encodeWAV = (samples: Float32Array) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // WAV file header
  writeString(view, 0, 'RIFF'); // Chunk ID
  view.setUint32(4, 36 + samples.length * 2, true); // Chunk Size
  writeString(view, 8, 'WAVE'); // Format
  writeString(view, 12, 'fmt '); // Subchunk1 ID
  view.setUint32(16, 16, true); // Subchunk1 Size
  view.setUint16(20, 1, true); // Audio format (PCM)
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, 16000, true); // Sample rate
  view.setUint32(28, 16000 * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data'); // Subchunk2 ID
  view.setUint32(40, samples.length * 2, true); // Subchunk2 Size

  floatTo16BitPCM(view, 44, samples); // Convert audio data

  return new Blob([buffer], { type: 'audio/wav' });
};

// Helper function to write ASCII strings into WAV header
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Convert float audio samples to 16-bit PCM
const floatTo16BitPCM = (view: DataView, offset: number, samples: Float32Array) => {
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const sample = Math.max(-1, Math.min(1, samples[i])); // Normalize sample range
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true); // Convert to PCM
  }
};

// Convert a Blob (WAV file) to Base64 for WebSocket transmission
const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve((reader.result as string).split(',')[1]); // Extract Base64 data
      } else {
        reject(new Error('Failed to convert blob to Base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

  // Render UI
  return (
    <div className="transcription-container">
      <h1 className="title">Real-Time Transcription & AI Voice Generator</h1>
      <div className="button-group">
        <button onClick={vad.start} disabled={vad.listening}>
          Start Listening
        </button>
        <button onClick={vad.pause} disabled={!vad.listening}>
          Stop Listening
        </button>
        <label>
          <input type="checkbox" checked={useDiarization} onChange={() => setUseDiarization(!useDiarization)} />
          Enable Speaker Identification
        </label>
      </div>
      <div className="transcription-output">
        <TranscriptionOutput transcription={backendTranscription} />
      </div>

      <div>
        <h1>AI Voice Generator</h1>
        {error && <p className="error">{error}</p>}
        <textarea
          rows={4}
          placeholder="Enter text to generate AI voice"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div>
          <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
            {voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleGenerateVoice}>Generate Voice</button>
        {audioUrl && (
          <div>
            <h2>Generated Voice:</h2>
            <audio key={audioUrl} controls>
              <source src={audioUrl} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

      </div>
    </div>
  );
};

export default Transcription;
