import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import getReply from "../service/llm.service";

const HUMAN_DELAY_MS = 15000; // 15 seconds
const assistantIntroducedMap = new Map<string, boolean>();

export let status: 'INITIALIZING' | 'QR_READY' | 'READY' | 'AUTHENTICATED' | 'DISCONNECTED' = 'DISCONNECTED';
export let qrCodeData: string | undefined = undefined;

export const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
});

export const initializeWhatsAppClient = () => {
    if (status !== 'DISCONNECTED') {
        console.log("Client is already initializing or connected.");
        return;
    }

    status = 'INITIALIZING';

    whatsappClient.initialize().catch((err) => {
        console.error("Error initializing WhatsApp client:", err);
        status = 'DISCONNECTED';
    });
};

whatsappClient.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("Scan the QR code with WhatsApp");
    status = 'QR_READY';
    qrCodeData = qr;
});

whatsappClient.on("ready", () => {
    console.log("WhatsApp Client is ready!");
    status = 'READY';
    qrCodeData = undefined;
});

whatsappClient.on("authenticated", () => {
    console.log("WhatsApp Client authenticated!");
    status = 'AUTHENTICATED';
    qrCodeData = undefined;
});

whatsappClient.on("disconnected", (reason) => {
    console.log("WhatsApp Client disconnected", reason);
    status = 'DISCONNECTED';
    qrCodeData = undefined;
});

whatsappClient.on("message", async (msg) => {
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
NEW MESSAGE RECEIVED
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
        console.error(`Error handling message:`, error);
    }
});