import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Upload, FileText, X } from 'lucide-react';
import { useStore } from '../store';
import * as pdfjsLib from 'pdfjs-dist';
import { generateChatResponse } from '../lib/cohere';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  isLoading?: boolean;
}

export default function InterestChat() {
  const navigate = useNavigate();
  const { interests, setSelectedInterests } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: "Hi! I'm here to help you discover professional events. Would you like to upload your resume or tell me about your professional interests?",
    sender: 'bot'
  }]);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.includes('pdf')) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Please upload a PDF file.",
        sender: 'bot'
      }]);
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setUserMessageCount(prev => prev + 1);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }

      if (userMessageCount < 1) {
        const response = await generateChatResponse(
          `Analyze this resume and suggest relevant professional interests: ${fullText}`
        );
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: response,
          sender: 'bot'
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "Great! Let me fetch relevant events for you.",
          sender: 'bot'
        }]);
      }

      setSelectedInterests(['1', '2']); // Technology and Music as defaults
      checkAndNavigate();
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Sorry, I couldn't process your resume. Would you like to tell me about your interests instead?",
        sender: 'bot'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    await handleFileUpload(file);
  };

  const checkAndNavigate = () => {
    if (userMessageCount >= 2) {
      setTimeout(() => {
        navigate('/events');
      }, 2000);
    }
  };

  const handleCustomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput;
    setUserInput('');
    setUserMessageCount(prev => prev + 1);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user'
    }]);

    setIsTyping(true);
    try {
      if (userMessageCount < 2) {
        const response = await generateChatResponse(userMessage);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: response,
          sender: 'bot'
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "Great! Let me fetch relevant events for you.",
          sender: 'bot'
        }]);
      }

      setSelectedInterests(['1', '3']); // Technology and Sports as defaults
      checkAndNavigate();
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "I apologize, but I'm having trouble processing your message. Could you try rephrasing it?",
        sender: 'bot'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-center px-6 py-4 bg-white/80 backdrop-blur-sm border-b">
        <h1 className="text-2xl font-bold text-gray-800">Proactive Networking</h1>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-6 ${
                  message.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white shadow-lg text-gray-800'
                }`}
              >
                <p className="text-lg">{message.text}</p>
              </div>
            </div>
          ))}

          {uploadedFile && (
            <div className="max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-600" />
                <span className="font-medium">{uploadedFile.name}</span>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}

          {(isProcessing || isTyping) && (
            <div className="max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-sm text-center">
              <p className="text-gray-600">
                {isProcessing ? "Processing your resume..." : "Typing..."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/80 backdrop-blur-sm px-4 py-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleCustomMessage} className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 text-lg"
            />
            <button
              type="submit"
              className="p-4 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
              disabled={isTyping}
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}