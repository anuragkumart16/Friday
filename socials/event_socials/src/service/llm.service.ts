import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { createPrompt, systemPrompt } from '../utils/prompt';


export default async function getReply(message: string, senderName: string, messageTime: string, context: string, chatHistory: string) {
    const prompt = createPrompt(message, senderName, messageTime, context, chatHistory);
    const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: systemPrompt,
        prompt: prompt,
        temperature: 0
    });
    return text;
}