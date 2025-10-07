import { BarChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrainingResults } from '@/types/ml';

interface ResultsViewerProps {
  results: TrainingResults | null;
}

export const ResultsViewer = ({ results }: ResultsViewerProps) => {
  if (!results) {
    return (
      <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-muted">
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </div>
            Resultados
          </CardTitle>
          <CardDescription className="text-sm">
            Los resultados aparecerán aquí al completar el entrenamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Esperando resultados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          Resultados del Entrenamiento
        </CardTitle>
        <CardDescription className="text-sm">
          Job ID: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{results.jobId}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary" />
            Métricas de Rendimiento
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(results.metrics).map(([key, value]) => (
              <div key={key} className="p-4 bg-gradient-to-br from-accent/40 to-accent/20 rounded-xl border border-border/40">
                <p className="text-xs text-muted-foreground capitalize mb-1 font-medium">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {typeof value === 'number' ? value.toFixed(4) : value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Importance */}
        {results.featureImportance && (
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Importancia de Features (Top 5)
            </h3>
            <div className="space-y-3">
              {results.featureImportance.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs w-32 truncate font-medium">{item.feature}</span>
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${item.importance * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-14 text-right text-primary">
                    {(item.importance * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matriz de Confusión */}
        {results.confusionMatrix && (
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Matriz de Confusión
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {results.confusionMatrix.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="border border-border/40 p-3 text-center font-mono font-semibold bg-accent/20"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
