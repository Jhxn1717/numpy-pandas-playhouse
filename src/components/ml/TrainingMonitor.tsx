import { Activity, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { TrainingJob } from '@/types/ml';

interface TrainingMonitorProps {
  job: TrainingJob | null;
}

const statusConfig = {
  idle: { label: 'Inactivo', icon: Activity, variant: 'secondary' as const },
  uploading: { label: 'Subiendo', icon: Loader2, variant: 'default' as const },
  training: { label: 'Entrenando', icon: Loader2, variant: 'default' as const },
  completed: { label: 'Completado', icon: CheckCircle, variant: 'default' as const },
  failed: { label: 'Error', icon: XCircle, variant: 'destructive' as const },
};

export const TrainingMonitor = ({ job }: TrainingMonitorProps) => {
  if (!job) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Entrenamiento
          </CardTitle>
          <CardDescription>
            No hay entrenamientos en curso
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const config = statusConfig[job.status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Entrenamiento
          </span>
          <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className={`h-4 w-4 ${job.status === 'training' || job.status === 'uploading' ? 'animate-spin' : ''}`} />
            {config.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          Job ID: {job.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{job.progress}%</span>
          </div>
          <Progress value={job.progress} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Tipo de Modelo</p>
            <p className="font-medium capitalize">{job.config.modelType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Algoritmo</p>
            <p className="font-medium">{job.config.algorithm}</p>
          </div>
          {job.startedAt && (
            <div>
              <p className="text-muted-foreground">Iniciado</p>
              <p className="font-medium">{new Date(job.startedAt).toLocaleTimeString()}</p>
            </div>
          )}
          {job.completedAt && (
            <div>
              <p className="text-muted-foreground">Completado</p>
              <p className="font-medium">{new Date(job.completedAt).toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        {job.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{job.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
