import { useState, useEffect } from 'react';
import Chatbot from 'react-chatbot-kit';
import { useNavigate } from 'react-router-dom';
import config from '../chatbot/config';
import MessageParser from '../chatbot/MessageParser';
import ActionProvider from '../chatbot/ActionProvider';
import type { RetirementFormData } from '../chatbot/types';
import 'react-chatbot-kit/build/main.css';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  openAIKey?: string;
  desiredAmount?: number;
}

const ChatModal = ({ isOpen, onClose, openAIKey, desiredAmount }: ChatModalProps) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceMode, setVoiceMode] = useState(false);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'pl-PL';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice recognition result:', transcript);

        // Insert transcript into chat input
        const input = document.querySelector('.react-chatbot-kit-chat-input') as HTMLInputElement;
        console.log('Found input element:', input);

        if (input) {
          // Set value using native setter to trigger React's onChange
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, transcript);
          }

          // Trigger both input and change events
          const inputEvent = new Event('input', { bubbles: true });
          const changeEvent = new Event('change', { bubbles: true });
          input.dispatchEvent(inputEvent);
          input.dispatchEvent(changeEvent);

          console.log('Set input value to:', transcript);

          // Auto-submit after voice input with longer delay
          setTimeout(() => {
            const form = document.querySelector('.react-chatbot-kit-chat-input-form') as HTMLFormElement;
            console.log('Found form element:', form);

            if (form) {
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(submitEvent);
              console.log('Dispatched form submit event');
            } else {
              // Fallback to button click
              const submitButton = document.querySelector('.react-chatbot-kit-chat-btn-send') as HTMLButtonElement;
              console.log('Found submit button:', submitButton);
              if (submitButton) {
                submitButton.click();
                console.log('Clicked submit button');
              }
            }
          }, 300);
        }
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Auto-restart recognition when in voice mode
  useEffect(() => {
    if (voiceMode && recognition && !isListening) {
      console.log('Auto-restarting recognition in voice mode');
      setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
        } catch (error) {
          console.error('Error auto-restarting recognition:', error);
        }
      }, 1000);
    }
  }, [voiceMode, recognition, isListening]);

  const toggleVoiceMode = () => {
    console.log('Toggle voice mode clicked');

    if (!recognition) {
      alert('Rozpoznawanie mowy nie jest dostępne w Twojej przeglądarce.');
      return;
    }

    if (voiceMode) {
      // Turn off voice mode
      console.log('Turning off voice mode');
      setVoiceMode(false);
      if (isListening) {
        recognition.stop();
      }
    } else {
      // Turn on voice mode
      console.log('Turning on voice mode');
      setVoiceMode(true);
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setVoiceMode(false);
      }
    }
  };

  const handleComplete = (formData: RetirementFormData) => {
    console.log('Form completed:', formData);
    onClose();
    navigate('/calculator', { state: formData });
  };

  const initialState = {
    messages: [],
    formData: {
      currentStep: 'age',
      expectedPension: desiredAmount || undefined
    },
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: '450px',
        backgroundColor: 'white',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInFromRight 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'rgb(0, 65, 110)',
          color: 'white',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid rgb(63, 132, 210)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
          Asystent Emerytalny
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {recognition && (
            <button
              onClick={toggleVoiceMode}
              style={{
                backgroundColor: voiceMode ? 'rgb(240, 94, 94)' : 'rgb(0, 153, 63)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                animation: voiceMode && isListening ? 'pulse 1.5s infinite' : 'none',
              }}
              title={voiceMode ? 'Wyłącz tryb głosowy' : 'Włącz tryb głosowy'}
            >
              {voiceMode ? (
                <MicOffIcon style={{ color: 'white', fontSize: '20px' }} />
              ) : (
                <MicIcon style={{ color: 'white', fontSize: '20px' }} />
              )}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Zamknij chat"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Chatbot Container */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Chatbot
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
          headerText="Asystent Emerytalny"
          placeholderText="Wpisz wiadomość..."
          validator={(input: string) => {
            if (input.trim().length === 0) return false;
            return true;
          }}
          state={initialState}
          actionProviderProps={{ onComplete: handleComplete, openAIKey }}
        />
      </div>

      {/* Voice indicator */}
      {voiceMode && isListening && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgb(0, 153, 63)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'pulse 1.5s infinite',
          }}
        >
          <MicIcon style={{ fontSize: '20px' }} />
          🎤 Słucham...
        </div>
      )}

      {voiceMode && !isListening && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgb(63, 132, 210)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          ⏳ Przetwarzam...
        </div>
      )}

      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .react-chatbot-kit-chat-container {
          width: 100%;
          height: 100%;
        }

        .react-chatbot-kit-chat-inner-container {
          height: 100%;
        }

        .react-chatbot-kit-chat-header {
          display: none;
        }

        .react-chatbot-kit-chat-message-container {
          height: calc(100% - 60px);
          overflow-y: auto;
          padding: 1rem;
        }

        .react-chatbot-kit-chat-bot-message {
          background-color: rgb(63, 132, 210);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          max-width: 80%;
          margin-bottom: 0.5rem;
        }

        .react-chatbot-kit-user-chat-message {
          background-color: rgb(0, 153, 63);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          max-width: 80%;
          margin-bottom: 0.5rem;
        }

        .react-chatbot-kit-chat-input-container {
          padding: 1rem;
          border-top: 1px solid rgb(190, 195, 206);
        }

        .react-chatbot-kit-chat-input {
          border: 2px solid rgb(190, 195, 206);
          border-radius: 25px;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }

        .react-chatbot-kit-chat-input:focus {
          border-color: rgb(63, 132, 210);
        }

        .react-chatbot-kit-chat-btn-send {
          background-color: rgb(0, 153, 63);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: white;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }

        .react-chatbot-kit-chat-btn-send:hover {
          background-color: rgb(0, 130, 50);
          transform: scale(1.05);
        }

        .react-chatbot-kit-chat-input-form {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ChatModal;
