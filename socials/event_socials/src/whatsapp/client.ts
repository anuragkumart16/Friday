import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import getReply from "../service/llm.service";

export const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
});

const HUMAN_DELAY_MS = 15000; // 15 seconds

const assistantIntroducedMap = new Map<string, boolean>();

whatsappClient.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("Scan the QR code with WhatsApp");
});

whatsappClient.on("ready", () => {
    console.log("WhatsApp Client is ready!");
});

whatsappClient.on("message", async (msg) => {

    try {

        // Ignore your own messages
        if (msg.fromMe) return;

        // Ignore status updates
        if (msg.isStatus || msg.from === "status@broadcast") return;

        // Ignore old messages (older than 1 day)
        if (Date.now() - msg.timestamp * 1000 > 24 * 60 * 60 * 1000) return;

        const chat = await msg.getChat();

        // Ignore muted chats
        if (chat.isMuted) {
            console.log(`Muted chat skipped: ${chat.name}`);
            return;
        }

        // Ignore archived chats
        if (chat.archived) {
            console.log(`Archived chat skipped: ${chat.name}`);
            return;
        }

        // Ignore group chats
        if (chat.isGroup) {
            console.log(`Group message noted (${chat.name}): ${msg.body}`);
            return;
        }

        const contact = await msg.getContact();
        const senderName = contact.name || contact.pushname || msg.from;
        const senderId = msg.from;

        const assistantIntroduced = assistantIntroducedMap.get(senderId) || false;

        const messageTime = new Date(msg.timestamp * 1000).toLocaleString();

        let context = "This is a new standalone message.";

        if (msg.hasQuotedMsg) {

            const quotedMsg = await msg.getQuotedMessage();

            if (quotedMsg.fromMe) {

                const timeDiffMins =
                    (msg.timestamp - quotedMsg.timestamp) / 60;

                context = `They are replying to your previous message ("${quotedMsg.body}") sent ${timeDiffMins.toFixed(
                    1
                )} minutes ago.`;

            } else {

                context = `They are replying to another message ("${quotedMsg.body}").`;

            }
        }

        // Fetch chat history
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
Time: ${messageTime}
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

        if (cleanText === "NO_REPLY") {

            console.log(`LLM decided not to reply to ${senderName}`);
            return;

        }

        // URGENT detection
        if (cleanText.startsWith("URGENT_ALERT")) {

            console.log("🚨 URGENT MESSAGE DETECTED");

            const reply = cleanText.replace("URGENT_ALERT:", "").trim();

            await new Promise((res) =>
                setTimeout(res, HUMAN_DELAY_MS)
            );

            await msg.reply(reply);

            assistantIntroducedMap.set(senderId, true);

            console.log(`Urgent reply sent to ${senderName}`);

            return;
        }

        // Normal reply
        await new Promise((res) =>
            setTimeout(res, HUMAN_DELAY_MS)
        );

        await msg.reply(cleanText);

        assistantIntroducedMap.set(senderId, true);

        console.log(`Reply sent to ${senderName}: ${cleanText}`);

    } catch (error) {

        console.error("Error handling message:", error);

    }

});

export const initializeWhatsAppClient = () => {

    whatsappClient.initialize().catch((err) => {

        console.error("Error initializing WhatsApp client:", err);

    });

};