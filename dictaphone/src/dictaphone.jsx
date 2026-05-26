import { useState, useRef } from 'react'

import './App.css'

function App() {
  const [isListening, setIsListening] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [records,setRecords] = useState([]);

  const stream = useRef(null);
  const chunksRef = useRef([]);
  const recorderRef = useRef(null);

  const handleMic = async () => {

    if (isListening === false) {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream.current);
      recorderRef.current = recorder;

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecords(prev => [...prev, url]);
        
      };


      recorder.start();

      setIsListening(true);

    } else {
      recorderRef.current.stop();
      setIsListening(false);
      if (stream.current) {
        const tracks = stream.current.getTracks();
        tracks.forEach(track => track.stop());
      }
      stream.current = null
    }

  }
  return (
    <>
      <h1>Dictaphone</h1>
      {audioUrl && (
        
        records.map((record, index) => (
          <div key={index}>
            <audio controls src={record} />
          </div>
        ))
      )}
      <button onClick={handleMic}>
        {isListening ? 'Stop' : 'Start'}
      </button>

    </>
  )
}

export default App
