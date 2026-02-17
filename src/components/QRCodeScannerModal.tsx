import { X, Camera, QrCode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

/** Modal pour scanner un QR code (ex: code d'invitation au foyer) */
export function QRCodeScannerModal({ isOpen, onClose, onScan }: QRCodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      mountedRef.current = true;
      const timer = setTimeout(() => {
        if (mountedRef.current) startScanner();
      }, 100);
      return () => {
        clearTimeout(timer);
        mountedRef.current = false;
        stopScanner();
      };
    } else {
      mountedRef.current = false;
      stopScanner();
    }
  }, [isOpen]);

  const startScanner = async () => {
    const element = document.getElementById('qrcode-reader');
    if (!element || !mountedRef.current) return;

    try {
      setError(null);
      setCameraUnavailable(false);

      const html5QrCode = new Html5Qrcode('qrcode-reader', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        useBarCodeDetectorIfSupported: true,
      });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: (w, h) => ({ width: Math.min(256, Math.min(w, h) * 0.8), height: Math.min(256, Math.min(w, h) * 0.8) }),
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err: any) {
      let errorMessage = 'Impossible d\'accéder à la caméra.';
      if (err.name === 'NotAllowedError' || err.message?.includes('NotAllowedError')) {
        errorMessage = 'Accès à la caméra refusé. Autorisez la caméra dans les paramètres.';
      } else if (err.name === 'NotFoundError' || err.message?.includes('NotFoundError')) {
        errorMessage = 'Aucune caméra détectée.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'La caméra est peut-être utilisée par une autre application.';
      } else if (!window.isSecureContext) {
        errorMessage = 'HTTPS requis pour accéder à la caméra.';
      }
      setError(errorMessage);
      setCameraUnavailable(true);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (isScanning) await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        /* ignore */
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-stone-100 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-stone-300">
          <h2 className="text-stone-800">Scanner un QR code</h2>
          <button onClick={() => { stopScanner(); onClose(); }} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {!cameraUnavailable && (
            <div className="space-y-4">
              <div className="bg-stone-200 rounded-xl overflow-hidden" style={{ minHeight: '280px', maxHeight: '320px' }}>
                <div id="qrcode-reader" className="w-full [&_video]:object-cover" style={{ overflow: 'hidden' }} />
                {!isScanning && !error && (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <QrCode className="w-16 h-16 text-stone-500 mb-4" />
                    <p className="text-stone-500 text-center text-sm">Initialisation de la caméra...</p>
                  </div>
                )}
              </div>
              {isScanning && (
                <p className="text-center text-sm text-stone-600">Positionnez le QR code dans le cadre</p>
              )}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <Camera className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Caméra indisponible</p>
                <p className="mt-1 text-xs">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
