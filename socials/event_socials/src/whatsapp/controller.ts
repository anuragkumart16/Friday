import { Request, Response } from "express";
import { status, qrCodeData, initializeWhatsAppClient, whatsappClient } from "./client";

export const healthcheck = async (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Event Socials is up and running",
    });
};

export const listClients = async (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        sessions: status !== 'DISCONNECTED' ? [{ id: 'default', status }] : [],
    });
};

export const createClient = async (req: Request, res: Response) => {
    if (status !== 'DISCONNECTED') {
        return res.status(400).json({ success: false, message: "A client is already active or initializing" });
    }

    initializeWhatsAppClient();

    return res.status(201).json({
        success: true,
        message: `Client initialized. Please check its status for QR code.`,
    });
};

export const getClientStatus = async (req: Request, res: Response) => {
    if (status === 'DISCONNECTED') {
        return res.status(404).json({ success: false, message: "Client not found" });
    }

    return res.status(200).json({
        success: true,
        status: status,
        qrCode: qrCodeData,
    });
};

export const deleteClient = async (req: Request, res: Response) => {
    if (status === 'DISCONNECTED') {
        return res.status(404).json({ success: false, message: "Client not found" });
    }

    try {
        await whatsappClient.destroy();
        return res.status(200).json({ success: true, message: "Client destroyed" });
    } catch (e: any) {
        return res.status(500).json({ success: false, message: e.message });
    }
};