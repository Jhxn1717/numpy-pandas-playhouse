# Guía de Integración - API de Python para Sistema ML

Este documento explica cómo crear la API de Python que se conectará con el frontend de Lovable.

## Estructura de la API

La API debe implementar los siguientes endpoints:

### 1. Subir Dataset
```
POST /api/datasets/upload
Content-Type: multipart/form-data

Body: { file: File }

Response: {
  "id": "string",
  "name": "string",
  "size": number,
  "uploadedAt": "ISO date",
  "rows": number (opcional),
  "columns": number (opcional)
}
```

### 2. Listar Datasets
```
GET /api/datasets

Response: Array<Dataset>
```

### 3. Iniciar Entrenamiento
```
POST /api/training/start
Content-Type: application/json

Body: {
  "datasetId": "string",
  "config": {
    "modelType": "classification" | "regression" | "clustering" | "deep_learning",
    "algorithm": "string",
    "hyperparameters": {},
    "testSize": number,
    "randomState": number
  }
}

Response: {
  "id": "string",
  "datasetId": "string",
  "config": ModelConfig,
  "status": "training",
  "progress": 0,
  "startedAt": "ISO date"
}
```

### 4. Estado del Entrenamiento
```
GET /api/training/{jobId}

Response: {
  "id": "string",
  "datasetId": "string",
  "config": ModelConfig,
  "status": "idle" | "uploading" | "training" | "completed" | "failed",
  "progress": number (0-100),
  "startedAt": "ISO date",
  "completedAt": "ISO date" (opcional),
  "error": "string" (opcional)
}
```

### 5. Obtener Resultados
```
GET /api/training/{jobId}/results

Response: {
  "jobId": "string",
  "metrics": {
    "accuracy": number,
    "precision": number,
    "recall": number,
    "f1_score": number,
    // Otras métricas relevantes
  },
  "predictions": number[] (opcional),
  "confusionMatrix": number[][] (opcional),
  "featureImportance": Array<{
    "feature": "string",
    "importance": number
  }> (opcional)
}
```

### 6. Listar Jobs
```
GET /api/training/jobs

Response: Array<TrainingJob>
```

## Ejemplo de Implementación con FastAPI

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import uuid
from datetime import datetime
import asyncio

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica el dominio de Lovable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de datos
class ModelConfig(BaseModel):
    modelType: str
    algorithm: str
    hyperparameters: Dict[str, Any]
    testSize: float
    randomState: int

class TrainingRequest(BaseModel):
    datasetId: str
    config: ModelConfig

# Almacenamiento en memoria (usa base de datos en producción)
datasets = {}
training_jobs = {}
results = {}

@app.post("/api/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Subir y procesar dataset"""
    try:
        # Leer archivo
        contents = await file.read()
        
        # Determinar formato y cargar con pandas
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(400, "Formato no soportado")
        
        # Crear registro del dataset
        dataset_id = str(uuid.uuid4())
        dataset = {
            "id": dataset_id,
            "name": file.filename,
            "size": len(contents),
            "uploadedAt": datetime.now().isoformat(),
            "rows": len(df),
            "columns": len(df.columns),
            "data": df  # Guardar el DataFrame
        }
        
        datasets[dataset_id] = dataset
        
        # Retornar sin el DataFrame
        return {k: v for k, v in dataset.items() if k != 'data'}
    
    except Exception as e:
        raise HTTPException(500, f"Error al procesar archivo: {str(e)}")

@app.get("/api/datasets")
async def get_datasets():
    """Listar todos los datasets"""
    return [
        {k: v for k, v in ds.items() if k != 'data'}
        for ds in datasets.values()
    ]

@app.post("/api/training/start")
async def start_training(request: TrainingRequest):
    """Iniciar entrenamiento de modelo"""
    if request.datasetId not in datasets:
        raise HTTPException(404, "Dataset no encontrado")
    
    job_id = str(uuid.uuid4())
    job = {
        "id": job_id,
        "datasetId": request.datasetId,
        "config": request.config.dict(),
        "status": "training",
        "progress": 0,
        "startedAt": datetime.now().isoformat()
    }
    
    training_jobs[job_id] = job
    
    # Iniciar entrenamiento en background
    asyncio.create_task(train_model(job_id))
    
    return job

async def train_model(job_id: str):
    """Función de entrenamiento (ejecuta en background)"""
    try:
        job = training_jobs[job_id]
        dataset = datasets[job["datasetId"]]
        df = dataset["data"]
        config = job["config"]
        
        # Simular progreso
        for progress in range(0, 100, 10):
            await asyncio.sleep(0.5)
            job["progress"] = progress
        
        # Preparar datos (ejemplo simple)
        X = df.iloc[:, :-1].values
        y = df.iloc[:, -1].values
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=config["testSize"],
            random_state=config["randomState"]
        )
        
        # Entrenar modelo (ejemplo con Random Forest)
        model = RandomForestClassifier(random_state=config["randomState"])
        model.fit(X_train, y_train)
        
        # Predecir y calcular métricas
        y_pred = model.predict(X_test)
        
        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, average='weighted')),
            "recall": float(recall_score(y_test, y_pred, average='weighted')),
            "f1_score": float(f1_score(y_test, y_pred, average='weighted'))
        }
        
        # Feature importance
        feature_importance = [
            {
                "feature": f"Feature_{i}",
                "importance": float(imp)
            }
            for i, imp in enumerate(model.feature_importances_)
        ]
        feature_importance.sort(key=lambda x: x["importance"], reverse=True)
        
        # Guardar resultados
        results[job_id] = {
            "jobId": job_id,
            "metrics": metrics,
            "featureImportance": feature_importance
        }
        
        # Actualizar job
        job["status"] = "completed"
        job["progress"] = 100
        job["completedAt"] = datetime.now().isoformat()
        
    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)

@app.get("/api/training/{job_id}")
async def get_training_status(job_id: str):
    """Obtener estado del entrenamiento"""
    if job_id not in training_jobs:
        raise HTTPException(404, "Job no encontrado")
    
    return training_jobs[job_id]

@app.get("/api/training/{job_id}/results")
async def get_results(job_id: str):
    """Obtener resultados del entrenamiento"""
    if job_id not in results:
        raise HTTPException(404, "Resultados no disponibles")
    
    return results[job_id]

@app.get("/api/training/jobs")
async def get_training_jobs():
    """Listar todos los jobs de entrenamiento"""
    return list(training_jobs.values())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Dependencias Python

```bash
pip install fastapi uvicorn pandas numpy scikit-learn torch python-multipart openpyxl
```

## Ejecutar la API

```bash
python main.py
```

La API estará disponible en `http://localhost:8000`

## Configurar URL en el Frontend

Edita el archivo `src/services/mlApi.ts` y cambia:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

Por la URL de tu servidor de producción cuando despliegues.

## Próximos Pasos

1. Implementar persistencia con base de datos (PostgreSQL, MongoDB)
2. Añadir autenticación y autorización
3. Implementar más algoritmos (PyTorch, deep learning)
4. Añadir validación de datos más robusta
5. Implementar caching de resultados
6. Añadir logging y monitoreo

## Librerías Recomendadas

- **NumPy**: Operaciones numéricas
- **Pandas**: Manipulación de datos
- **Scikit-Learn**: Algoritmos de ML tradicionales
- **PyTorch**: Deep learning
- **FastAPI**: Framework web rápido
- **SQLAlchemy**: ORM para base de datos
- **Celery**: Procesamiento asíncrono de tareas largas
