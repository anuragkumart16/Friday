import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import getReply from "../service/llm.service";

export const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
const lastReplyMap: Map<string, number> = new Map();

whatsappClient.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("QR RECEIVED. Please scan this QR code with WhatsApp.");
});

whatsappClient.on("ready", () => {
    console.log("WhatsApp Client is ready!");
});

whatsappClient.on("message", async (msg) => {

    try {

        const chat = await msg.getChat();

        // -----------------------------
        // Ignore group chats
        // -----------------------------
        if (chat.isGroup) {
            console.log(`Group message noted from ${chat.name}: ${msg.body}`);
            return;
        }

        const contact = await msg.getContact();
        const senderName = contact.name || contact.pushname || msg.from;
        const senderId = msg.from;

        const now = Date.now();
        const lastReply = lastReplyMap.get(senderId);

        // -----------------------------
        // Rate limiting
        // -----------------------------
        if (lastReply && now - lastReply < RATE_LIMIT_MS) {
            console.log(`Rate limit active. Skipping reply to ${senderName}`);
            return;
        }

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

        // -----------------------------
        // Fetch chat history
        // -----------------------------
        const recentMessages = await chat.fetchMessages({ limit: 10 });

        const chatHistory = recentMessages
            .map(m => {
                const time = new Date(m.timestamp * 1000).toLocaleString();
                const sender = m.fromMe ? "Anurag" : senderName;

                return `[${time}] ${sender}: ${m.body}`;
            })
            .join("\n");

        // -----------------------------
        // Call LLM
        // -----------------------------
        const text = await getReply(
            msg.body,
            senderName,
            messageTime,
            context,
            chatHistory
        );

        // -----------------------------
        // Send reply
        // -----------------------------
        if (text.trim() !== "NO_REPLY") {

            await msg.reply(text);

            lastReplyMap.set(senderId, now);

            console.log(`Replied to ${senderName}: ${text}`);

        } else {

            console.log(`Skipped replying to ${senderName}`);

        }

    } catch (error) {

        console.error("Error handling message:", error);

    }

});

export const initializeWhatsAppClient = () => {

    whatsappClient.initialize().catch(err => {

        console.error("Error initializing WhatsApp client:", err);

    });

};