'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientAge: number;
  symptom: string;
  userEmail?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  patientProfile?: any;
}

export default function EmailDialog({
  isOpen,
  onClose,
  patientName,
  patientAge,
  symptom,
  userEmail,
  messages,
  setMessages,
  patientProfile
}: EmailDialogProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && patientName && patientAge > 0 && symptom) {
      generateDraft();
    }
  }, [isOpen, patientName, patientAge, symptom]);

  const generateDraft = async () => {
    setIsGenerating(true);
    try {
      // Ensure we have required values
      if (!patientName || patientAge === 0 || !symptom) {
        console.error('Missing required data:', { patientName, patientAge, symptom });
        // Set default values as fallback
        setSubject(`Patient Alert: ${symptom || 'Symptom'}`);
        setBody(`Dear Dr. Patel,\n\nPatient ${patientName || 'Unknown'} reported: ${symptom || 'symptom'}\n\nPlease advise.\n\nBest regards,\nMedical Assistant`);
        setIsGenerating(false);
        return;
      }

      const response = await fetch('http://localhost:5001/api/generate-email-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: patientName,
          patient_age: patientAge,
          symptom: symptom,
          additional_context: `Patient reported: ${symptom}`,
          patient_profile: patientProfile || {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate email draft');
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.draft) {
        setSubject(data.draft.subject);
        setBody(data.draft.body);
      }
    } catch (error) {
      console.error('Error generating draft:', error);
      // Set default values if generation fails
      setSubject(`Patient Alert: ${symptom}`);
      setBody(`Dear Dr. Patel,\n\nPatient ${patientName} reported the following symptom: ${symptom}\n\nPlease advise.\n\nBest regards,\nMedical Assistant`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Please fill in both subject and body');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('http://localhost:5001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject,
          body: body,
          patient_email: userEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const data = await response.json();
      
      console.log('[EmailDialog] Response data:', data);
      
      if (data.status === 'success') {
        toast.success('Email sent successfully to your doctor!');
        
        // Add confirmation message to chat
        const confirmationMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `✅ Email sent to your doctor!\n\nI've notified your doctor about your symptom (${symptom}). They should get back to you soon.\n\nMeanwhile, I'm here to help with any other questions you might have.`,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, confirmationMessage]);
        
        onClose();
      } else {
        console.error('[EmailDialog] Error response:', data);
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to send email: ${errorMessage}`);
      
      // Also log full error details
      console.error('Full error details:', {
        error,
        errorMessage,
        subject,
        body
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Email Your Doctor</DialogTitle>
        </DialogHeader>
        
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Generating email draft...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email body"
                rows={10}
                className="resize-none"
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              You can edit the email before sending. It will be sent to Dr. Patel.
            </p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating || isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isGenerating || isSending}>
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

