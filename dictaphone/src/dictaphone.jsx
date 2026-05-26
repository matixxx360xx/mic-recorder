import { useState, useRef } from "react"
import "./App.css"

function App() {
  const [isListening, setIsListening] = useState(false)
  const [records, setRecords] = useState([])
  const [playingIndex, setPlayingIndex] = useState(null)
  const [progress, setProgress] = useState({})
  const [durations, setDurations] = useState({})

  const stream = useRef(null)
  const chunksRef = useRef([])
  const recorderRef = useRef(null)
  const audioRefs = useRef({})

  const handleMic = async () => {
    if (!isListening) {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      const recorder = new MediaRecorder(stream.current)
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)

        setRecords((prev) => [...prev, url])
      }

      recorder.start()
      setIsListening(true)
    } else {
      recorderRef.current.stop()
      setIsListening(false)

      stream.current?.getTracks().forEach((t) => t.stop())
      stream.current = null
    }
  }

  const toggleAudio = (index) => {
    const audio = audioRefs.current[index]
    if (!audio) return

    if (playingIndex === index) {
      audio.pause()
      setPlayingIndex(null)
      return
    }

    audio.play()
    setPlayingIndex(index)
  }

  const handleLoaded = (index, e) => {
    setDurations((prev) => ({
      ...prev,
      [index]: e.target.duration,
    }))
  }

  const handleTimeUpdate = (index, e) => {
    setProgress((prev) => ({
      ...prev,
      [index]: e.target.currentTime,
    }))
  }

  const handleEnded = (index) => {
    setPlayingIndex(null)
  }

  const seek = (index, e) => {
    const audio = audioRefs.current[index]
    const value = Number(e.target.value)

    if (!audio) return

    audio.currentTime = value
    setProgress((prev) => ({
      ...prev,
      [index]: value,
    }))
  }

  const setVolume = (index, value) => {
    const audio = audioRefs.current[index]
    if (!audio) return

    audio.volume = Number(value)
  }

  return (
    <div className="container">
      <h1>Dictaphone</h1>

      <button onClick={handleMic} className="ButtonMic">
        {isListening ? "Stop" : "Start"}
      </button>
      <div className="AudioContainer">
      {records.map((record, index) => (
        <div key={index} className="Audio">
          <audio
            ref={(el) => (audioRefs.current[index] = el)}
            src={record}
            onLoadedMetadata={(e) => handleLoaded(index, e)}
            onTimeUpdate={(e) => handleTimeUpdate(index, e)}
            onEnded={() => handleEnded(index)}
          />

          <button onClick={() => toggleAudio(index)}>
            {playingIndex === index ? "Pause" : "Play"}
          </button>

          <div>
            🔊
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue="1"
              onChange={(e) => setVolume(index, e.target.value)}
            />
          </div>

          <input
            type="range"
            min="0"
            max={durations[index] || 0}
            step="0.01"
            value={progress[index] || 0}
            onInput={(e) => seek(index, e)}
          />
        </div>
      ))}

      </div>
    </div>
  )
}

export default App