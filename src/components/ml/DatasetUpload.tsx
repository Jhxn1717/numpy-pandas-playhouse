import { useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { mlApi } from '@/services/mlApi';
import type { Dataset } from '@/types/ml';

interface DatasetUploadProps {
  onUploadSuccess: (dataset: Dataset) => void;
}

export const DatasetUpload = ({ onUploadSuccess }: DatasetUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Solo se permiten archivos CSV o XLSX');
      return;
    }

    setUploading(true);
    try {
      const dataset = await mlApi.uploadDataset(file);
      toast.success('Dataset subido exitosamente');
      onUploadSuccess(dataset);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir el dataset';
      if (errorMessage.includes('Failed to fetch')) {
        toast.error('No se puede conectar con el servidor Python. Verifica que tu API esté corriendo en localhost:8000');
      } else {
        toast.error(errorMessage);
      }
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          Subir Dataset
        </CardTitle>
        <CardDescription className="text-sm">
          Sube tus datos en formato CSV o XLSX para comenzar el entrenamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]' 
              : 'border-border/50 hover:border-primary/50 hover:bg-accent/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={`inline-block p-4 rounded-2xl mb-4 transition-all ${
            dragActive ? 'bg-primary/20 scale-110' : 'bg-muted'
          }`}>
            <Upload className={`h-10 w-10 transition-colors ${
              dragActive ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>
          <p className="text-base font-medium mb-2">
            {dragActive ? '¡Suelta tu archivo aquí!' : 'Arrastra tu archivo'}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            o haz clic en el botón para seleccionar
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.xlsx"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            disabled={uploading}
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
            className="px-8 shadow-lg shadow-primary/20"
            size="lg"
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Subiendo...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Seleccionar Archivo
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
