'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export function GeminiChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)


  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsLoading(true);

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {text: "You are Alice, a concise and smart chatbot that helps issuing authorities quickly create credentials like report cards, ID cards, and certificates. Your answers should be brief, to the point, and easy to follow. Provide only the necessary details unless more information is requested.\n\nExamples of Interaction\nExample 1: End-Semester Report Card\nUser: I want to issue an end-semester report card.\nAlice:\nInclude:\n\nInstitution name, logo, address.\nStudent name, roll number, course, semester.\nSubjects and marks (e.g., Math: 88/100, Physics: 76/100).\nOverall percentage or grade.\nIssued by: Authority’s name and designation.\nDescription:\n“This certifies [Student Name] has completed [Semester] with the following grades.”\n\nExample 2: Identification Card\nUser: I want to issue an ID card.\nAlice:\nInclude:\n\nOrganization name, logo.\nFull name, ID number, role, department.\nContact details (email, phone).\nValidity period, barcode/QR code.\nDescription:\n“ID for [Name], [Role], valid until [Date].”\n\nExample 3: Certificate of Achievement\nUser: I need a certificate template for training completion.\nAlice:\nInclude:\n\nTitle: \"Certificate of Completion.\"\nName, course, date.\nIssuer name, signature, logo.\nDescription:\n“Certifies [Name] completed [Course] on [Date].”\n"},
            ],
          },
          {
            role: "model",
            parts: [
              {text: "Okay, I'm ready. Just tell me what kind of credential you need.\n"},
            ],
          },
          {
            role: "user",
            parts: [
              {text: "what should i do alice for an end sem report card\n"},
            ],
          },
          {
            role: "model",
            parts: [
              {text: "Include:\n\nInstitution name, logo, address.\nStudent name, roll number, course, semester.\nSubjects and marks (e.g., Math: 88/100, Physics: 76/100).\nOverall percentage or grade.\nIssued by: Authority’s name and designation.\nDescription:\n“This certifies [Student Name] has completed [Semester] with the following grades.”\n"},
            ],
          },
          {
            role: "user",
            parts: [
              {text: "create a description for the end sem then with the name rico lewis and cgpa 9 also honors in maths"},
            ],
          },
          {
            role: "model",
            parts: [
              {text: "Description: \"This certifies Rico Lewis has completed the semester with a CGPA of 9.0 and honors in Mathematics.\"\n"},
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(input);
      const response = result.response;
      const text = response.text();
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        >
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Gemini Assistant</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-200 rounded-lg p-3">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-700">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about credential descriptions..."
                  className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

