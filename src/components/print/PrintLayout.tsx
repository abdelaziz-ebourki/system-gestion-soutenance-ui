import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui";
import type { GeneralSettings } from "@/lib/api-core";

interface PrintLayoutProps {
  title: string;
  settings?: GeneralSettings;
  children: ReactNode;
  autoPrint?: boolean;
}

export default function PrintLayout({ title, settings, children, autoPrint }: PrintLayoutProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const logoUrl = settings?.institutionLogoUrl && !imgError ? settings.institutionLogoUrl : "/logo.svg";
  const institutionName = settings?.institutionName ?? "Université";

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print fixed right-4 top-4 z-50 flex gap-2">
        <Button onClick={() => window.print()} variant="default">
          <Printer className="mr-2 size-4" />
          Imprimer
        </Button>
      </div>

      <div className="mx-auto max-w-4xl p-8 print:mx-0 print:p-0">
        <div className="mb-8 flex items-center gap-4 border-b pb-4 print:mb-6 print:pb-3">
          <img
            src={logoUrl}
            alt="Logo"
            className="size-14 object-contain print:size-12"
            onError={() => setImgError(true)}
          />
          <div>
            <h1 className="text-xl font-bold print:text-lg">{institutionName}</h1>
            <p className="text-sm text-muted-foreground print:text-xs">{title}</p>
          </div>
        </div>

        {children}

        <div className="mt-8 border-t pt-3 text-center text-xs text-muted-foreground print:mt-6 print:pt-2">
          Généré le {new Date().toLocaleDateString("fr-FR")} — {institutionName}
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 15mm; size: A4; }
          body { font-size: 12pt; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
