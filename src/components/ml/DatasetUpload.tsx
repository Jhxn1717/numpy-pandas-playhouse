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
      toast.error('Error al subir el dataset');
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Subir Dataset
        </CardTitle>
        <CardDescription>
          Sube tus datos en formato CSV o XLSX
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-accent' : 'border-border'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Arrastra tu archivo aquí o haz clic para seleccionar
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
          >
            {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
