import { X, Camera, Barcode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onScan }: BarcodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const mountedRef = useRef(false);
  const scanHandledRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      mountedRef.current = true;
      scanHandledRef.current = false;
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          startScanner();
        }
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
    // Check if element exists before trying to start scanner
    const element = document.getElementById('barcode-reader');
    if (!element || !mountedRef.current) {
      return;
    }

    try {
      setError(null);
      setCameraUnavailable(false);
      
      const html5QrCode = new Html5Qrcode('barcode-reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
        ],
        useBarCodeDetectorIfSupported: true,
      });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Caméra arrière sur mobile
        {
          fps: 15,
          qrbox: (w, h) => ({ width: Math.min(280, w * 0.95), height: Math.min(140, h * 0.45) }),
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (scanHandledRef.current) return;
          scanHandledRef.current = true;
          html5QrCode.stop().then(() => {
            scannerRef.current = null;
            setIsScanning(false);
            onScan(decodedText);
            onClose();
          }).catch(() => {
            onScan(decodedText);
            onClose();
          });
        },
        (errorMessage) => {
          // Erreur de scan (normale, se produit continuellement jusqu'à ce qu'un code soit détecté)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      
      let errorMessage = 'Impossible d\'accéder à la caméra.';
      
      if (err.name === 'NotAllowedError' || err.message?.includes('NotAllowedError')) {
        errorMessage = 'Accès à la caméra refusé. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.';
      } else if (err.name === 'NotFoundError' || err.message?.includes('NotFoundError')) {
        errorMessage = 'Aucune caméra détectée sur cet appareil.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'La caméra est peut-être utilisée par une autre application.';
      } else if (!window.isSecureContext) {
        errorMessage = 'L\'accès à la caméra nécessite une connexion sécurisée (HTTPS).';
      }
      
      setError(errorMessage);
      setCameraUnavailable(true);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-stone-100 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden [&_#barcode-reader]:overflow-hidden [&_#barcode-reader_*]:overflow-hidden shadow-xl transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-300">
          <h2 className="text-stone-800">Scanner un code-barres</h2>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-6 space-y-6">
          {/* Camera View - Only show if camera is available */}
          {!cameraUnavailable && (
            <div className="space-y-4">
              <div className="bg-stone-200 rounded-xl overflow-hidden" style={{ minHeight: '300px', maxHeight: '320px' }}>
                <div id="barcode-reader" className="w-full overflow-hidden [&_video]:object-cover [&_*]:max-h-[300px]" style={{ overflow: 'hidden' }} />
                {!isScanning && !error && (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Camera className="w-16 h-16 text-stone-500 mb-4" />
                    <p className="text-stone-500 text-center text-sm">
                      Initialisation de la caméra...
                    </p>
                  </div>
                )}
              </div>

              {isScanning && (
                <div className="text-center text-sm text-stone-600">
                  <p>Positionnez le code-barres dans le cadre</p>
                  <p className="text-xs text-stone-500 mt-1">
                    Le scan se fera automatiquement
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <Camera className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Caméra indisponible</p>
                  <p className="mt-1 text-xs">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Entry */}
          <div className="space-y-3">
            {!cameraUnavailable && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-stone-100 text-stone-500">ou</span>
                </div>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label htmlFor="manual-barcode" className="block text-sm text-stone-700 mb-2">
                  {cameraUnavailable ? 'Entrer le code-barres' : 'Entrer le code-barres manuellement'}
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-500" />
                  <input
                    id="manual-barcode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Ex: 3017620422003"
                    className="w-full pl-11 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-50 text-stone-800 placeholder:text-stone-500"
                    autoFocus={cameraUnavailable}
                  />
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Le code-barres se trouve généralement sous le produit, composé de 13 chiffres.
                </p>
              </div>
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Valider le code-barres
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
