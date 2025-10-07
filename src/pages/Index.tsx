import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { DatasetUpload } from '@/components/ml/DatasetUpload';
import { ModelConfig } from '@/components/ml/ModelConfig';
import { TrainingMonitor } from '@/components/ml/TrainingMonitor';
import { ResultsViewer } from '@/components/ml/ResultsViewer';
import { toast } from 'sonner';
import { mlApi } from '@/services/mlApi';
import type { Dataset, ModelConfig as IModelConfig, TrainingJob, TrainingResults } from '@/types/ml';

const Index = () => {
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [currentJob, setCurrentJob] = useState<TrainingJob | null>(null);
  const [results, setResults] = useState<TrainingResults | null>(null);

  // Polling para actualizar el estado del entrenamiento
  useEffect(() => {
    if (currentJob && (currentJob.status === 'training' || currentJob.status === 'uploading')) {
      const interval = setInterval(async () => {
        try {
          const updatedJob = await mlApi.getTrainingStatus(currentJob.id);
          setCurrentJob(updatedJob);
          
          if (updatedJob.status === 'completed') {
            const jobResults = await mlApi.getResults(updatedJob.id);
            setResults(jobResults);
            toast.success('Entrenamiento completado exitosamente');
          } else if (updatedJob.status === 'failed') {
            toast.error('El entrenamiento ha fallado');
          }
        } catch (error) {
          console.error('Error al actualizar estado:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentJob]);

  const handleUploadSuccess = (dataset: Dataset) => {
    setCurrentDataset(dataset);
  };

  const handleStartTraining = async (config: IModelConfig) => {
    if (!currentDataset) {
      toast.error('Primero debes subir un dataset');
      return;
    }

    try {
      const job = await mlApi.startTraining(currentDataset.id, config);
      setCurrentJob(job);
      setResults(null);
      toast.success('Entrenamiento iniciado');
    } catch (error) {
      toast.error('Error al iniciar el entrenamiento');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Sistema de Entrenamiento ML</h1>
              <p className="text-muted-foreground">
                Entrena modelos con Python + NumPy, Pandas, PyTorch y Scikit-Learn
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <DatasetUpload onUploadSuccess={handleUploadSuccess} />
            
            <ModelConfig
              onStartTraining={handleStartTraining}
              disabled={!currentDataset || currentJob?.status === 'training'}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <TrainingMonitor job={currentJob} />
            
            <ResultsViewer results={results} />
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
          <h3 className="font-semibold mb-2">📡 Conexión con API de Python</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Este frontend se conecta a tu API de Python. Para conectarla:
          </p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Configura la URL de tu API en <code className="bg-muted px-1 rounded">src/services/mlApi.ts</code></li>
            <li>Implementa los endpoints necesarios en tu backend de Python</li>
            <li>Asegúrate de habilitar CORS en tu API</li>
          </ol>
        </div>
      </main>
    </div>
  );
};

export default Index;
