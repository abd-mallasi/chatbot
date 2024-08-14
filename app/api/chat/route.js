import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = "You are a helpful and knowledgeable AI chatbot designed to provide support and guidance to computer science students. Your goal is to assist students with a wide range of topics, including programming, algorithms, data structures, debugging, coursework, and general academic advice. Respond with clear, concise, and accurate information. When answering technical questions, provide examples or code snippets where applicable. If a question is outside your scope or requires specific academic guidance, encourage the student to reach out to their instructor or academic advisor. Maintain a friendly and encouraging tone to motivate students in their learning journey.";

export async function POST(req) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const data = await req.json();

    // Adjusting the API call based on the provided code image
    const response = await openai.ChatCompletion.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            ...data,
        ],
        max_tokens: 150,  // Set the maximum number of tokens
        response_format: "json",  // Assuming JSON format as shown in the image
    });

    // Streaming the response
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });

    return new NextResponse(stream);
}
