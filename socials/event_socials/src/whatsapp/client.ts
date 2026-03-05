import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import getReply from "../service/llm.service";
import fs from "fs";
import path from "path";

const HUMAN_DELAY_MS = 15000; // 15 seconds
const assistantIntroducedMap = new Map<string, boolean>();

export interface WhatsAppSession {
    id: string;
    client: Client;
    status: 'INITIALIZING' | 'QR_READY' | 'READY' | 'AUTHENTICATED' | 'DISCONNECTED';
    qrCode?: string;
}

export const sessions: Record<string, WhatsAppSession> = {};

export const createWhatsAppClient = (id: string = "default") => {
    if (sessions[id]) {
        return sessions[id];
    }

    console.log(`Creating WhatsApp client with ID: ${id}`);

    let localAuthConfig = {};
    if (id !== "default") {
        localAuthConfig = { clientId: id };
    }

    const client = new Client({
        authStrategy: new LocalAuth(localAuthConfig),
        puppeteer: {
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
    });

    sessions[id] = {
        id,
        client,
        status: 'INITIALIZING',
    };

    client.on("qr", (qr) => {
        qrcode.generate(qr, { small: true });
        console.log(`Scan the QR code with WhatsApp for ID: ${id}`);
        sessions[id].status = 'QR_READY';
        sessions[id].qrCode = qr;
    });

    client.on("ready", () => {
        console.log(`WhatsApp Client ${id} is ready!`);
        sessions[id].status = 'READY';
        sessions[id].qrCode = undefined;
    });

    client.on("authenticated", () => {
        console.log(`WhatsApp Client ${id} authenticated!`);
        sessions[id].status = 'AUTHENTICATED';
        sessions[id].qrCode = undefined;
    });

    client.on("disconnected", (reason) => {
        console.log(`WhatsApp Client ${id} disconnected`, reason);
        sessions[id].status = 'DISCONNECTED';
        sessions[id].qrCode = undefined;
    });

    client.on("message", async (msg) => {
        try {
            if (msg.fromMe) return;
            if (msg.isStatus || msg.from === "status@broadcast") return;
            if (Date.now() - msg.timestamp * 1000 > 24 * 60 * 60 * 1000) return;

            const chat = await msg.getChat();
            if (chat.isMuted) return;
            if (chat.archived) return;
            if (chat.isGroup) return;

            const contact = await msg.getContact();
            const senderName = contact.name || contact.pushname || msg.from;
            const senderId = msg.from;

            const assistantIntroduced = assistantIntroducedMap.get(senderId) || false;
            const messageTime = new Date(msg.timestamp * 1000).toLocaleString();

            let context = "This is a new standalone message.";
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg.fromMe) {
                    const timeDiffMins = (msg.timestamp - quotedMsg.timestamp) / 60;
                    context = `They are replying to your previous message ("${quotedMsg.body}") sent ${timeDiffMins.toFixed(1)} minutes ago.`;
                } else {
                    context = `They are replying to another message ("${quotedMsg.body}").`;
                }
            }

            const recentMessages = await chat.fetchMessages({ limit: 20 });
            const chatHistory = recentMessages
                .map((m) => {
                    const time = new Date(m.timestamp * 1000).toLocaleString();
                    const sender = m.fromMe ? "Anurag" : senderName;
                    return `[${time}] ${sender}: ${m.body}`;
                })
                .join("\n");

            console.log(`
-----------------------------
NEW MESSAGE RECEIVED [${id}]
Sender: ${senderName}
Message: ${msg.body}
-----------------------------
`);

            const text = await getReply(
                msg.body,
                senderName,
                messageTime,
                context,
                chatHistory,
                assistantIntroduced
            );

            if (!text) return;
            const cleanText = text.trim();

            if (cleanText === "NO_REPLY") return;

            if (cleanText.startsWith("URGENT_ALERT")) {
                const reply = cleanText.replace("URGENT_ALERT:", "").trim();
                await new Promise((res) => setTimeout(res, HUMAN_DELAY_MS));
                await msg.reply(reply);
                assistantIntroducedMap.set(senderId, true);
                return;
            }

            await new Promise((res) => setTimeout(res, HUMAN_DELAY_MS));
            await msg.reply(cleanText);
            assistantIntroducedMap.set(senderId, true);

        } catch (error) {
            console.error(`Error handling message for ${id}:`, error);
        }
    });

    client.initialize().catch((err) => {
        console.error(`Error initializing WhatsApp client ${id}:`, err);
    });

    return sessions[id];
};

export const initializeWhatsAppClient = () => {
    // Scan existing .wwebjs_auth directories on startup
    try {
        const authParentDir = path.resolve(process.cwd(), '.wwebjs_auth');
        if (fs.existsSync(authParentDir)) {
            const items = fs.readdirSync(authParentDir);
            for (const item of items) {
                if (item.startsWith('session-')) {
                    const id = item.replace('session-', '');
                    createWhatsAppClient(id);
                } else if (item === 'session') {
                    createWhatsAppClient('default');
                }
            }
        }
    } catch (err) {
        console.error("Error reading auth directory:", err);
    }
};