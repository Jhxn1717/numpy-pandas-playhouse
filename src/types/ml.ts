export type ModelType = 'classification' | 'regression' | 'clustering' | 'deep_learning';

export type TrainingStatus = 'idle' | 'uploading' | 'training' | 'completed' | 'failed';

export interface Dataset {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  rows?: number;
  columns?: number;
}

export interface ModelConfig {
  modelType: ModelType;
  algorithm: string;
  hyperparameters: Record<string, any>;
  testSize: number;
  randomState: number;
}

export interface TrainingJob {
  id: string;
  datasetId: string;
  config: ModelConfig;
  status: TrainingStatus;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface TrainingResults {
  jobId: string;
  metrics: Record<string, number>;
  predictions?: number[];
  confusionMatrix?: number[][];
  featureImportance?: Array<{ feature: string; importance: number }>;
}
