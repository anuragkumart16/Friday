"use client";
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface WhatsAppClient {
    id: string;
    status: 'INITIALIZING' | 'QR_READY' | 'READY' | 'AUTHENTICATED' | 'DISCONNECTED';
}

export default function WhatsAppConnectionsManager() {
    const [clients, setClients] = useState<WhatsAppClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [newClientId, setNewClientId] = useState('');
    const [activeQr, setActiveQr] = useState<string | null>(null);
    const [pollingId, setPollingId] = useState<string | null>(null);

    // Fetch existing clients
    const fetchClients = async () => {
        try {
            const res = await fetch('http://localhost:5001/whatsapp/clients'); // Assuming Event Socials is on 5001
            if (res.ok) {
                const data = await res.json();
                setClients(data.sessions || []);
            }
        } catch (error) {
            console.error('Failed to fetch WhatsApp clients', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
        const interval = setInterval(fetchClients, 5000); // Poll every 5s to keep statuses updated
        return () => clearInterval(interval);
    }, []);

    // Poll for QR code of a specific client that is initializing
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (pollingId) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`http://localhost:5001/whatsapp/clients/${pollingId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === 'QR_READY' && data.qrCode) {
                            setActiveQr(data.qrCode);
                        } else if (data.status === 'READY' || data.status === 'AUTHENTICATED') {
                            setPollingId(null);
                            setActiveQr(null);
                            fetchClients(); // Refresh list immediately
                        }
                    }
                } catch (e) {
                    console.error('Error polling status', e);
                }
            }, 2000); // Poll every 2 seconds for aggressive QR updates
        }
        return () => clearInterval(interval);
    }, [pollingId]);

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClientId.trim()) return;

        try {
            const res = await fetch('http://localhost:5001/whatsapp/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: newClientId.trim() }),
            });
            if (res.ok) {
                setNewClientId('');
                setPollingId(newClientId.trim());
                fetchClients();
            } else {
                alert('Failed to create client connection.');
            }
        } catch (error) {
            console.error('Error creating client', error);
        }
    };

    const handleDeleteClient = async (id: string) => {
        if (!confirm(`Are you sure you want to delete connection ${id}?`)) return;

        try {
            await fetch(`http://localhost:5001/whatsapp/clients/${id}`, {
                method: 'DELETE',
            });
            fetchClients();
        } catch (error) {
            console.error('Error deleting client', error);
        }
    };

    const handleShowQr = (id: string) => {
        setPollingId(id);
        setActiveQr(null);
    };

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'READY':
            case 'AUTHENTICATED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>Connected</span>;
            case 'QR_READY':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5 animate-pulse"></span>Needs Scan</span>;
            case 'INITIALIZING':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>Starting...</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Disconnected</span>;
        }
    };

    return (
        <div className="space-y-8">
            {/* Create New Connection */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New WhatsApp Connection</h3>
                <form onSubmit={handleCreateClient} className="flex gap-4">
                    <input
                        type="text"
                        value={newClientId}
                        onChange={(e) => setNewClientId(e.target.value)}
                        placeholder="Enter unique connection name (e.g., SupportBot)"
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none dark:text-white"
                        required
                    />
                    <button
                        type="submit"
                        disabled={!newClientId.trim()}
                        className="px-6 py-2 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Connection
                    </button>
                </form>
            </div>

            {/* QR Code Modal/Display Area */}
            {pollingId && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800/30 flex flex-col items-center justify-center min-h-[300px] transition-all">
                    <div className="flex justify-between w-full mb-6">
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
                            Connecting <span className="text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded ml-1">{pollingId}</span>
                        </h3>
                        <button onClick={() => setPollingId(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            Close
                        </button>
                    </div>

                    {activeQr ? (
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-4 inline-block">
                                <QRCodeSVG value={activeQr} size={256} />
                            </div>
                            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                                Open WhatsApp on your phone and scan to link device.
                            </p>
                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">
                                QR updates automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-indigo-800 dark:text-indigo-300 font-medium">Starting WhatsApp Web Client...</p>
                            <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70 mt-1">This may take up to 30 seconds to generate the QR code.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Existing Connections */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Connections</h3>

                {loading ? (
                    <div className="py-8 text-center text-gray-500">Loading connections...</div>
                ) : clients.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No WhatsApp connections found. Create one above to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clients.map((client) => (
                            <div key={client.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white font-mono">{client.id}</span>
                                        </div>
                                        {getStatusUI(client.status)}
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    {(client.status === 'QR_READY' || client.status === 'INITIALIZING') && (
                                        <button
                                            onClick={() => handleShowQr(client.id)}
                                            className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            View QR
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteClient(client.id)}
                                        className="flex-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
