'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageShell from '@/components/PageShell';
import CharacterGif from '@/components/CharacterGif';
import SpeechBubble from '@/components/SpeechBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/auth-store';
import EmailDialog from '@/components/EmailDialog';

// Audio recording type definitions
interface AudioRecorder {
  start(): void;
  stop(): void;
  state: string;
  ondataavailable: (event: BlobEvent) => void;
  onstop: () => void;
  onerror: (event: any) => void;
}

declare global {
  interface Window {
    MediaRecorder: new (stream: MediaStream) => MediaRecorder;
    webkitMediaRecorder: new (stream: MediaStream) => AudioRecorder;
  }
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatbotPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${user?.name || 'there'}! I'm your medical assistant. How can I help you today?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  // Email dialog state
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSymptom, setEmailSymptom] = useState('');
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [lastNotificationMessageId, setLastNotificationMessageId] = useState<string | null>(null);
  
  // Ref for messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Authentication and onboarding checks
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (user && !user.hasCompletedOnboarding) {
      router.push('/onboarding/basic');
      return;
    }

    // If we reach here, user is authenticated and has completed onboarding
    // Use setTimeout to avoid setState in effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Initialize audio recording
  useEffect(() => {
    const MediaRecorderClass = window.MediaRecorder || (window as any).webkitMediaRecorder;
    
    if (!MediaRecorderClass) {
      console.warn('MediaRecorder not supported in this browser');
      return;
    }

    const chunks: Blob[] = [];

    const handleDataAvailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    const handleStop = () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      setAudioChunks([...chunks]);
      chunks.length = 0;
      
      // Convert blob to base64 and send to backend for transcription
      if (audioBlob.size > 0) {
        transcribeAudio(audioBlob);
      }
    };

    if (isRecording && mediaRecorder) {
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.onstop = handleStop;

      if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start(1000); // Collect data every second
      }
    }

    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [isRecording, mediaRecorder]);

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const MediaRecorderClass = window.MediaRecorder || (window as any).webkitMediaRecorder;
      const recorder = new MediaRecorderClass(stream, { mimeType: 'audio/webm' });
      
      setMediaRecorder(recorder);
      setTranscript('');
      setAudioChunks([]);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    // Stop all tracks to release microphone
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setMediaRecorder(null);
  };

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Transcribe audio using ElevenLabs
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setIsTranscribing(false);
    setTranscript('Speech-to-text is temporarily unavailable. Please type your message instead.');
    alert('Speech-to-text is temporarily unavailable. Please type your message instead.');
    return;
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onload = async () => {
        const base64Audio = reader.result as string;
        
        try {
          const response = await fetch('http://localhost:5001/api/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          if (!response.ok) {
            // Get error details from response
            const responseText = await response.text();
            console.error('[TRANSCRIBE] Error response status:', response.status);
            console.error('[TRANSCRIBE] Error response text:', responseText);
            
            let errorData = { error: 'Unknown error' };
            try {
              errorData = JSON.parse(responseText);
            } catch (e) {
              errorData = { error: responseText || 'Failed to transcribe audio' };
            }
            
            throw new Error(errorData.error || `Failed to transcribe audio (${response.status})`);
          }

          const data = await response.json();
          console.log('[TRANSCRIBE] Success response:', data);
          const transcribedText = data.transcription;
          
          setTranscript(transcribedText);
          setInputValue(transcribedText);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          setTranscript('Error transcribing audio. Please try again.');
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsTranscribing(false);
    }
  };

  // Submit the transcript
  const submitTranscript = async () => {
    if (transcript.trim()) {
      const finalText = transcript.trim();
      setTranscript('');
      setInputValue(''); // Clear the input field
      
      // Send the message directly
      const userMessage: Message = {
        id: Date.now().toString(),
        text: finalText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const response = await fetch('http://localhost:5001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: finalText,
            user_id: user?.id || null
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response from server');
        }

        const data = await response.json();
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Re-record
  const reRecord = () => {
    setTranscript('');
    setInputValue(''); // Clear the input field
    startRecording();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Call the backend API
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput,
          user_id: user?.id || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updatedMessages = [...prev, botMessage];
        
        // Check if user responded "no" to email notification
        if (currentInput.toLowerCase().trim() === 'no' && lastNotificationMessageId) {
          // Clear the notification message ID so button disappears
          setLastNotificationMessageId(null);
        }
        
        return updatedMessages;
      });
      
      // Check if response asks about severe symptoms and notify doctor
      if (data.response.toLowerCase().includes('severe') && 
          (data.response.toLowerCase().includes('notify') || data.response.toLowerCase().includes('doctor'))) {
        // Extract symptom from user's message
        const symptomWords = ['pain', 'headache', 'fever', 'cough', 'ache', 'hurt', 'sore', 'dizzy', 'nausea', 'rash'];
        const foundSymptom = symptomWords.find(word => currentInput.toLowerCase().includes(word));
        if (foundSymptom) {
          setEmailSymptom(foundSymptom);
        }
        // Store this bot message ID so we can show button
        setLastNotificationMessageId(botMessage.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.div
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Medical Assistant Chat
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Ask me anything about your health.
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Sign Out
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character Column */}
          <motion.div
            className="flex flex-col items-center space-y-1"
            variants={itemVariants}
          >
            {isTyping && (
              <SpeechBubble className="max-w-xs" type="thinking">
                Thinking...
              </SpeechBubble>
            )}
            <CharacterGif
              pose={isTyping ? 'prompt' : 'idle'}
              size={500}
              ariaLabel="Medical assistant ready to help"
              className="w-96 h-96"
            />
          </motion.div>

          {/* Chat Column */}
          <motion.div
            className="lg:col-span-2 flex flex-col h-[600px]"
            variants={itemVariants}
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-background/50">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.text.split('\n').map((line, lineIdx) => {
                          // Check if the line contains a URL
                          const urlRegex = /(https?:\/\/[^\s]+)/g;
                          const parts = line.split(urlRegex);
                          
                          return (
                            <span key={lineIdx}>
                              {parts.map((part, partIdx) => {
                                if (part.match(urlRegex)) {
                                  return (
                                    <a
                                      key={partIdx}
                                      href={part}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary underline hover:text-primary/80 break-all"
                                    >
                                      {part}
                                    </a>
                                  );
                                }
                                return <span key={partIdx}>{part}</span>;
                              })}
                              {lineIdx < message.text.split('\n').length - 1 && <br />}
                            </span>
                          );
                        })}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Check if last bot message asks about severe symptoms and notifying doctor */}
                {messages.length > 0 && messages[messages.length - 1].id === lastNotificationMessageId && !showEmailDialog && (
                  <div className="flex justify-center py-2">
                    <Button
                      onClick={async () => {
                        // Fetch patient profile first
                        try {
                          const res = await fetch('http://localhost:5001/api/get-profile', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ patient_id: `patient_${user?.id}` })
                          });
                          const data = await res.json();
                          if (data.status === 'success' && data.profile) {
                            const profileData = JSON.parse(data.profile);
                            setPatientProfile(profileData);
                            // Now open the dialog
                            setShowEmailDialog(true);
                            // Clear the last notification message ID so button disappears
                            setLastNotificationMessageId(null);
                          }
                        } catch (error) {
                          console.error('Error fetching profile:', error);
                          // Still open dialog with fallback data
                          setShowEmailDialog(true);
                          setLastNotificationMessageId(null);
                        }
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Yes, notify my doctor
                    </Button>
                  </div>
                )}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Transcription Display */}
            {(transcript || isTranscribing) && (
              <div className="mb-3 p-3 bg-muted rounded-lg border-2 border-primary/20">
                {isTranscribing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Transcribing...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Transcription:</p>
                        <p className="text-foreground">{transcript}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={reRecord}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Re-record"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                          </svg>
                        </Button>
                        <Button
                          onClick={submitTranscript}
                          variant="default"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Submit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? "Recording... (or type here)" : "Ask me anything about your health..."}
                disabled={isTyping}
                className="flex-1"
              />
              
              {/* Microphone Button */}
              <Button
                onClick={toggleRecording}
                variant={isRecording ? "destructive" : "outline"}
                size="lg"
                disabled={isTyping}
                className="flex items-center justify-center"
                title={isRecording ? "Stop recording" : "Start voice input"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isRecording ? "animate-pulse" : ""}
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </Button>
              
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="lg"
                data-testid="send-button"
              >
                Send
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Email Dialog */}
      <EmailDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        patientName={patientProfile?.full_name || user?.name || 'Patient'}
        patientAge={patientProfile?.age || 0}
        symptom={emailSymptom}
        userEmail={user?.email}
        messages={messages}
        setMessages={setMessages}
        patientProfile={patientProfile}
      />
      
    </PageShell>
  );
}
