import React, { useState, useEffect, useRef } from 'react';
import styles from './app.module.css';
import MicIcon from './assets/MicIcon';

const SpeechToText = ({ onTranscript, onClear }) => {
    const [transcript, setTranscript] = useState('');
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef(null);

    if (!recognitionRef.current) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'pl-PL';
    }

    const { current: recognition } = recognitionRef;

    recognition.onresult = event => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
                newTranscript += result[0].transcript + ' ';
            }
        }
        setTranscript(prevTranscript => {
            const updatedTranscript = prevTranscript.includes(newTranscript.trim()) ? prevTranscript : prevTranscript + newTranscript;
            onTranscript(updatedTranscript.trim());
            return updatedTranscript;
        });
    };

    const startListening = () => {
        setListening(true);
        recognition.start();
    };

    const stopListening = () => {
        recognition.stop();
        setListening(false);
    };

    const clearTranscript = () => {
        setTranscript('');
        stopListening();
        onClear();
    };

    useEffect(() => {
        return () => {
            recognition.stop();
        };
    }, []);

    return (
        <div className={styles.buttonBox}>
            <button className={styles.speachToText} onTouchStart={startListening} onTouchEnd={stopListening}>
                <MicIcon />
                <span>Naciśnij i mów</span>
            </button>
            <button className={styles.speachToText} onClick={clearTranscript}>
                Wyczyść
            </button>
        </div>
    );
};

export default SpeechToText;
