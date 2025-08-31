import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ApiKey } from '@/types';
import { Check, Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DisplayApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKey | null;
}

export const DisplayApiKeyDialog: React.FC<DisplayApiKeyDialogProps> = ({ open, onOpenChange, apiKey }) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey.key);
      setHasCopied(true);
      toast.success("Chave API copiada para a área de transferência!");
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  if (!apiKey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chave API Gerada</DialogTitle>
          <DialogDescription>
            Sua nova chave API para "{apiKey.name}" foi gerada com sucesso.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 relative">
                <Input
                    id="apiKey"
                    readOnly
                    value={apiKey.key}
                    className="pr-10"
                />
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleCopy}
                >
                    {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Copie esta chave e guarde-a em um local seguro. Por motivos de segurança,
                            <span className="font-bold"> você não poderá vê-la novamente</span> através do sistema.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
