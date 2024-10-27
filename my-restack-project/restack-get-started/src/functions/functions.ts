import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: process.env[''],
});

async function boardstate1() {
    const chatCompletion = await client.chat.completions.create({
        messages: [{ role: 'system', content: 'You are the following chess board state ' + chessboardstate1 + 'provide an evaluation value on the standard scale, and why there are positional advantages and disadvantages' }],
        model: 'gpt-3.5-turbo-0125',
    });
    boardstate1_respo = chatCompletion.choices[0].message.content
}

async function boardstate2() {
    const chatCompletion = await client.chat.completions.create({
        messages: [{ role: 'system', content: 'You are the following chess board state ' + chessboardstate2 + 'provide an evaluation value on the standard scale, and why there are positional advantages and disadvantages' }],
        model: 'gpt-3.5-turbo-0125',
    });
}


/*


export async function boardstate1(boardstate1: Array<string>) {
    return { message: `Goodbye, ${name}!` };
};

export async function welcome(name: String) {
    return { message: `Hello, ${name}!` };
};

export function analyzeBoardState(emailContent: string) {



    return "Analyzed email content";
}

export function openAiPrompt(prompt: string) {
    // Function logic
    return "OpenAI response";
*/