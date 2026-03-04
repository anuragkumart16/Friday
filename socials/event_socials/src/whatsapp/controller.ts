import { Request, Response } from "express";


export const healthcheck = async (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Event Socials is up and running",
    })
}