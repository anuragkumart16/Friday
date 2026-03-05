import { Request, Response } from "express";
import { sessions, createWhatsAppClient } from "./client";

export const healthcheck = async (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Event Socials is up and running",
    });
};

export const listClients = async (req: Request, res: Response) => {
    const activeSessions = Object.keys(sessions).map(id => ({
        id: sessions[id].id,
        status: sessions[id].status,
    }));
    return res.status(200).json({
        success: true,
        sessions: activeSessions,
    });
};

export const createClient = async (req: Request, res: Response) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ success: false, message: "ID is required" });
    }

    if (sessions[id]) {
        return res.status(400).json({ success: false, message: "Client ID already exists" });
    }

    createWhatsAppClient(id);

    return res.status(201).json({
        success: true,
        message: `Client ${id} initialized. Please check its status for QR code.`,
    });
};

export const getClientStatus = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const session = sessions[id];

    if (!session) {
        return res.status(404).json({ success: false, message: "Client not found" });
    }

    return res.status(200).json({
        success: true,
        status: session.status,
        qrCode: session.qrCode, // Returns actual QR string if in QR_READY state
    });
};

export const deleteClient = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const session = sessions[id];

    if (!session) {
        return res.status(404).json({ success: false, message: "Client not found" });
    }

    try {
        await session.client.destroy();
        delete sessions[id];
        return res.status(200).json({ success: true, message: "Client destroyed" });
    } catch (e: any) {
        return res.status(500).json({ success: false, message: e.message });
    }
};