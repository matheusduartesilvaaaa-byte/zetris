"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (code: string) => void;
}

const SCANNER_ELEMENT_ID = "zetris-barcode-scanner";

/**
 * Leitor óptico via câmera do dispositivo (webcam do notebook ou câmera do
 * celular). Usa `html5-qrcode`, que decodifica códigos de barras 1D (EAN,
 * Code128, UPC) e QR direto do stream de vídeo, sem precisar de hardware
 * dedicado — qualquer câmera serve.
 *
 * Leitores USB dedicados (que funcionam como teclado) não precisam deste
 * componente: eles já "digitam" o código + Enter em qualquer input focado.
 */
export function BarcodeScannerDialog({ open, onOpenChange, onDetected }: BarcodeScannerDialogProps) {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            onDetected(decodedText);
            onOpenChange(false);
          },
          () => {
            // erro de leitura por frame — ignorado silenciosamente (é esperado até achar o código)
          }
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível acessar a câmera. Verifique as permissões do navegador."
        );
      }
    }

    start();

    return () => {
      cancelled = true;
      scannerRef.current
        ?.stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => {});
    };
  }, [open, onDetected, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera size={18} /> Ler código de barras
          </DialogTitle>
          <DialogDescription>Aponte a câmera para o código de barras do produto</DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        ) : (
          <div id={SCANNER_ELEMENT_ID} className="overflow-hidden rounded-lg" />
        )}

        <Button variant="outline" onClick={() => onOpenChange(false)}>
          <X className="mr-2 h-4 w-4" /> Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
