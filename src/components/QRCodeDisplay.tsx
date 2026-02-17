import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

/** Génère un QR code localement (sans API externe) */
export function QRCodeDisplay({ value, size = 180, className = '' }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setDataUrl(null);
      return;
    }
    QRCode.toDataURL(value, { width: size, margin: 2 })
      .then(setDataUrl)
      .catch((err) => {
        setError(err?.message || 'Erreur de génération');
        setDataUrl(null);
      });
  }, [value, size]);

  if (error) {
    return (
      <div className={`rounded-lg border-2 border-red-300 bg-red-50 p-4 text-red-700 text-sm ${className}`}>
        Erreur : {error}
      </div>
    );
  }
  if (!dataUrl) {
    return (
      <div className={`rounded-lg border-2 border-stone-300 bg-stone-100 p-4 flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <span className="text-stone-500 text-sm">Chargement...</span>
      </div>
    );
  }
  return (
    <img
      src={dataUrl}
      alt="QR Code"
      width={size}
      height={size}
      className={`rounded-lg border-2 border-green-300 bg-white p-2 ${className}`}
    />
  );
}
