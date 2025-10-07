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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <Brain className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  ML Training Platform
                </h1>
                <p className="text-sm text-muted-foreground">
                  Python • NumPy • Pandas • PyTorch • Scikit-Learn
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
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
        <div className="mt-12 p-8 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                Conexión con Backend Python
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Este frontend está listo para conectarse a tu API de Python. Para comenzar:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                  <div className="font-medium text-sm mb-1">1. Configura la URL</div>
                  <p className="text-xs text-muted-foreground">
                    En <code className="bg-background/80 px-1.5 py-0.5 rounded text-primary">mlApi.ts</code>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                  <div className="font-medium text-sm mb-1">2. Implementa Endpoints</div>
                  <p className="text-xs text-muted-foreground">
                    Consulta <code className="bg-background/80 px-1.5 py-0.5 rounded text-primary">ML_API_GUIDE.md</code>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                  <div className="font-medium text-sm mb-1">3. Habilita CORS</div>
                  <p className="text-xs text-muted-foreground">
                    En tu servidor FastAPI/Flask
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
