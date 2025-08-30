import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { XIcon, DownloadIcon } from './Icons';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, title, url }) => {
    const qrRef = useRef<HTMLDivElement>(null);

    const downloadQRCode = () => {
        if (!qrRef.current) return;

        const canvas = qrRef.current.querySelector('canvas');
        if (!canvas) return;

        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        
        const downloadLink = document.createElement("a");
        const fileName = `${title.replace(/\s+/g, '_')}_QR_Code.png`;
        downloadLink.href = pngUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-8 flex flex-col items-center justify-center space-y-4">
                    <div ref={qrRef} className="p-4 bg-white border rounded-lg">
                       <QRCodeCanvas
                            value={url}
                            size={256}
                            level={'H'}
                            includeMargin={true}
                        />
                    </div>
                    <p className="text-xs text-slate-500 text-center max-w-xs break-words">{url}</p>
                </div>
                <div className="bg-slate-50 p-4 flex justify-end space-x-3 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={downloadQRCode}
                        className="flex items-center bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        Download PNG
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;