import type { Dataset, ModelConfig, TrainingJob, TrainingResults } from '@/types/ml';

// TODO: Reemplaza con la URL de tu API de Python
const API_BASE_URL = 'http://localhost:8000/api';

export const mlApi = {
  // Subir dataset
  async uploadDataset(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir el dataset');
    }

    return response.json();
  },

  // Obtener datasets
  async getDatasets(): Promise<Dataset[]> {
    const response = await fetch(`${API_BASE_URL}/datasets`);
    
    if (!response.ok) {
      throw new Error('Error al obtener datasets');
    }

    return response.json();
  },

  // Iniciar entrenamiento
  async startTraining(datasetId: string, config: ModelConfig): Promise<TrainingJob> {
    const response = await fetch(`${API_BASE_URL}/training/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ datasetId, config }),
    });

    if (!response.ok) {
      throw new Error('Error al iniciar entrenamiento');
    }

    return response.json();
  },

  // Obtener estado del entrenamiento
  async getTrainingStatus(jobId: string): Promise<TrainingJob> {
    const response = await fetch(`${API_BASE_URL}/training/${jobId}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener estado del entrenamiento');
    }

    return response.json();
  },

  // Obtener resultados
  async getResults(jobId: string): Promise<TrainingResults> {
    const response = await fetch(`${API_BASE_URL}/training/${jobId}/results`);
    
    if (!response.ok) {
      throw new Error('Error al obtener resultados');
    }

    return response.json();
  },

  // Obtener trabajos de entrenamiento
  async getTrainingJobs(): Promise<TrainingJob[]> {
    const response = await fetch(`${API_BASE_URL}/training/jobs`);
    
    if (!response.ok) {
      throw new Error('Error al obtener trabajos');
    }

    return response.json();
  },
};
