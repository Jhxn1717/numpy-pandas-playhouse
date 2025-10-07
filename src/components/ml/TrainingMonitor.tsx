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
      <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-muted">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            Monitor de Entrenamiento
          </CardTitle>
          <CardDescription className="text-sm">
            Esperando inicio de entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No hay entrenamientos activos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = statusConfig[job.status];
  const Icon = config.icon;

  return (
    <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl">
          <span className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            Monitor de Entrenamiento
          </span>
          <Badge variant={config.variant} className="flex items-center gap-1.5 px-3 py-1.5">
            <Icon className={`h-4 w-4 ${job.status === 'training' || job.status === 'uploading' ? 'animate-spin' : ''}`} />
            {config.label}
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">
          Job ID: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{job.id}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Progreso del entrenamiento</span>
            <span className="font-bold text-primary">{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-accent/30 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Tipo de Modelo</p>
            <p className="font-semibold capitalize">{job.config.modelType}</p>
          </div>
          <div className="p-4 rounded-lg bg-accent/30 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Algoritmo</p>
            <p className="font-semibold">{job.config.algorithm}</p>
          </div>
          {job.startedAt && (
            <div className="p-4 rounded-lg bg-accent/30 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Iniciado</p>
              <p className="font-semibold text-sm">{new Date(job.startedAt).toLocaleTimeString()}</p>
            </div>
          )}
          {job.completedAt && (
            <div className="p-4 rounded-lg bg-accent/30 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Completado</p>
              <p className="font-semibold text-sm">{new Date(job.completedAt).toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        {job.error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive font-medium">{job.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
