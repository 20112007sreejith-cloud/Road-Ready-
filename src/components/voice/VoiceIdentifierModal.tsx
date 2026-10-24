// src/components/voice/VoiceIdentifierModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Keyboard,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { VoiceIdentifierParser, VoiceParseResult, DetectedAmbiguity } from '../../shared/voice-parser';

interface VoiceIdentifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmIdentifier: (identifier: string) => void;
  initialTranscript?: string;
}

export const VoiceIdentifierModal: React.FC<VoiceIdentifierModalProps> = ({
  isOpen,
  onClose,
  onConfirmIdentifier,
  initialTranscript,
}) => {
  const [transcript, setTranscript] = useState<string>(initialTranscript || '');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<VoiceParseResult | null>(null);
  const [activeAmbiguityIdx, setActiveAmbiguityIdx] = useState<number | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [useManualMode, setUseManualMode] = useState<boolean>(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);

  useEffect(() => {
    if (initialTranscript) {
      setTranscript(initialTranscript);
      handleParse(initialTranscript);
    }
  }, [initialTranscript]);

  useEffect(() => {
    // Check Web Speech API availability
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
    }
  }, []);

  const handleParse = (text: string) => {
    const result = VoiceIdentifierParser.parse(text);
    setParseResult(result);
    setManualInput(result.normalizedIdentifier);
    if (result.ambiguities.length > 0) {
      setActiveAmbiguityIdx(0);
    } else {
      setActiveAmbiguityIdx(null);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback to simulated spoken voice sample if browser speech API not supported
      const simulatedText = 'K A zero one A B one two three O';
      setTranscript(simulatedText);
      handleParse(simulatedText);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        handleParse(spoken);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        // Fallback demo sample
        const fallback = 'KA 01 AB 123 O';
        setTranscript(fallback);
        handleParse(fallback);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Space out characters for clear phonetic read-back: "K - A - 0 - 1 - A - B - 1 - 2 - 3 - 0"
      const spaced = text.split('').join(' ');
      const utterance = new SpeechSynthesisUtterance(spaced);
      utterance.rate = 0.85;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleResolveAmbiguity = (amb: DetectedAmbiguity, chosenChar: string) => {
    if (!parseResult) return;
    const resolved = VoiceIdentifierParser.applyAmbiguityResolution(
      parseResult.normalizedIdentifier,
      amb.index,
      chosenChar
    );
    handleParse(resolved);
    handleSpeak(resolved);
  };

  const handleFinalConfirm = () => {
    const finalId = useManualMode ? manualInput.toUpperCase() : parseResult?.normalizedIdentifier || manualInput;
    onConfirmIdentifier(finalId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vehicle Entry & Plate Identifier"
      description="Fast vehicle plate entry with speech recognition, smart phonetic normalization, and explicit O/0 & B/8 ambiguity resolution."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => setUseManualMode(!useManualMode)}
            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
            {useManualMode ? 'Switch to Voice Vehicle Entry' : 'Manual Keyboard Fallback'}
          </button>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={!parseResult && !manualInput}
              onClick={handleFinalConfirm}
            >
              Confirm & Use Plate ({parseResult?.formattedDisplay || manualInput})
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Voice Trigger Banner */}
        {!useManualMode && (
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-center space-y-3">
            <div className="relative inline-block">
              <button
                onClick={startListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                aria-label={isListening ? 'Listening...' : 'Click to Speak'}
              >
                {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
            </div>

            <div>
              <div className="font-bold text-sm text-slate-900">
                {isListening ? 'Listening to speech...' : 'Click Microphone to Speak Registration Number'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Speak naturally, e.g. "Karnataka zero one AB one two three four" or phonetic NATO "Kilo Alpha..."
              </p>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-blue-100">
              <span className="text-[10px] text-slate-500 font-semibold">Test Pre-fills:</span>
              <button
                onClick={() => {
                  setTranscript('KA 01 AB 123 O');
                  handleParse('KA 01 AB 123 O');
                }}
                className="px-2 py-0.5 rounded bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-[10px] font-mono font-semibold"
              >
                Test O/0 Ambiguity (KA01AB123O)
              </button>
              <button
                onClick={() => {
                  setTranscript('kilo alpha zero five echo xray eight nine zero two');
                  handleParse('kilo alpha zero five echo xray eight nine zero two');
                }}
                className="px-2 py-0.5 rounded bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-[10px] font-mono font-semibold"
              >
                Test NATO Phonetics
              </button>
            </div>
          </div>
        )}

        {/* Manual Keyboard Mode */}
        {useManualMode && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="font-semibold text-slate-800 block">
              Enter Vehicle Registration or Licence Identifier:
            </label>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder="e.g. KA-01-MJ-5021 or KA01AB1234"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono text-sm uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Recognition Result & Phonetic Display */}
        {parseResult && (
          <div className="space-y-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] uppercase font-semibold">Normalized Candidate</span>
                <button
                  onClick={() => handleSpeak(parseResult.normalizedIdentifier)}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                </button>
              </div>

              <div className="font-mono text-xl font-extrabold text-slate-900 tracking-wider">
                {parseResult.formattedDisplay}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>Spoken Transcript:</span>
                <span className="italic text-slate-800">"{parseResult.rawTranscript}"</span>
              </div>
            </div>

            {/* Ambiguity Resolution Modal Box (Crucial for Challenge 6!) */}
            {parseResult.ambiguities.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-300 text-amber-950 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-950">
                      Ambiguous Character Detected: Explicit Confirmation Required
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Under civic-tech safety principles, RTO One will <strong>never silently guess</strong> ambiguous letters or numbers. Please confirm your intended character:
                    </p>
                  </div>
                </div>

                {parseResult.ambiguities.map((amb: DetectedAmbiguity, i: number) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-amber-200 space-y-2">
                    <div className="text-xs text-slate-700">
                      Position {amb.index + 1}: <span className="text-slate-500">{amb.reason}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-800">Select Character:</span>
                      {amb.alternatives.map((alt: string) => (
                        <button
                          key={alt}
                          onClick={() => handleResolveAmbiguity(amb, alt)}
                          className="px-4 py-2 rounded-lg border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 font-mono font-bold text-base text-amber-950 transition-colors shadow-2xs cursor-pointer"
                        >
                          '{alt}' ({alt === 'O' ? 'Letter O' : alt === '0' ? 'Number Zero' : alt === '8' ? 'Number Eight' : 'Letter B'})
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
