import { useState } from 'react';
import { Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { ModelConfig as IModelConfig, ModelType } from '@/types/ml';

interface ModelConfigProps {
  onStartTraining: (config: IModelConfig) => void;
  disabled?: boolean;
}

const algorithms: Record<ModelType, string[]> = {
  classification: ['Logistic Regression', 'Random Forest', 'SVM', 'XGBoost'],
  regression: ['Linear Regression', 'Ridge', 'Lasso', 'Random Forest'],
  clustering: ['K-Means', 'DBSCAN', 'Hierarchical'],
  deep_learning: ['Neural Network', 'CNN', 'LSTM'],
};

export const ModelConfig = ({ onStartTraining, disabled }: ModelConfigProps) => {
  const [modelType, setModelType] = useState<ModelType>('classification');
  const [algorithm, setAlgorithm] = useState(algorithms.classification[0]);
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);

  const handleModelTypeChange = (value: ModelType) => {
    setModelType(value);
    setAlgorithm(algorithms[value][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config: IModelConfig = {
      modelType,
      algorithm,
      hyperparameters: {},
      testSize,
      randomState,
    };

    onStartTraining(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración del Modelo
        </CardTitle>
        <CardDescription>
          Configura los parámetros de entrenamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model-type">Tipo de Modelo</Label>
            <Select value={modelType} onValueChange={handleModelTypeChange}>
              <SelectTrigger id="model-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classification">Clasificación</SelectItem>
                <SelectItem value="regression">Regresión</SelectItem>
                <SelectItem value="clustering">Clustering</SelectItem>
                <SelectItem value="deep_learning">Deep Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="algorithm">Algoritmo</Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger id="algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {algorithms[modelType].map((alg) => (
                  <SelectItem key={alg} value={alg}>
                    {alg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-size">Test Size</Label>
              <Input
                id="test-size"
                type="number"
                min="0.1"
                max="0.5"
                step="0.05"
                value={testSize}
                onChange={(e) => setTestSize(parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="random-state">Random State</Label>
              <Input
                id="random-state"
                type="number"
                value={randomState}
                onChange={(e) => setRandomState(parseInt(e.target.value))}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={disabled}>
            <Play className="mr-2 h-4 w-4" />
            Iniciar Entrenamiento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
