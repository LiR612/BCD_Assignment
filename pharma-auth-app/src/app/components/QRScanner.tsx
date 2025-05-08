"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface QRScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const containerId = "qr-reader";
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Prevent double init
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        containerId,
        {
          fps: 10,
          qrbox: 250,
          rememberLastUsedCamera: false,
          // supportedScanTypes: [Html5QrcodeScanner.SCAN_TYPE_CAMERA],
        },
        /* verbose */ false
      );

      scannerRef.current.render(
        (result) => {
          scannerRef.current?.clear().then(() => {
            scannerRef.current = null;
            onScanSuccess(result);
          });
        },
        (error) => {
          // Silent or optional log
          // console.warn("QR scan error", error);
        }
      );
    }

    return () => {
      // Cleanup camera properly
      scannerRef.current?.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [onScanSuccess]);

  const handleCancel = () => {
    scannerRef.current
      ?.clear()
      .then(() => {
        scannerRef.current = null;
        onClose();
      })
      .catch(() => {
        scannerRef.current = null;
        onClose();
      });
  };

  return (
    <div className="w-full mt-4">
      <div id={containerId} />
      <button
        onClick={handleCancel}
        className="mt-2 text-sm text-red-600 hover:underline"
      >
        Cancel Scan
      </button>
    </div>
  );
}
