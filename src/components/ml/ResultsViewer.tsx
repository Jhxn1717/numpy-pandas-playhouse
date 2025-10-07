import { BarChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrainingResults } from '@/types/ml';

interface ResultsViewerProps {
  results: TrainingResults | null;
}

export const ResultsViewer = ({ results }: ResultsViewerProps) => {
  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Resultados
          </CardTitle>
          <CardDescription>
            Los resultados aparecerán aquí al completar el entrenamiento
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Resultados del Entrenamiento
        </CardTitle>
        <CardDescription>
          Job ID: {results.jobId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas */}
        <div>
          <h3 className="font-semibold mb-3">Métricas</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(results.metrics).map(([key, value]) => (
              <div key={key} className="p-3 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-2xl font-bold">
                  {typeof value === 'number' ? value.toFixed(4) : value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Importance */}
        {results.featureImportance && (
          <div>
            <h3 className="font-semibold mb-3">Importancia de Features</h3>
            <div className="space-y-2">
              {results.featureImportance.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm w-32 truncate">{item.feature}</span>
                  <div className="flex-1 bg-accent rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.importance * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
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
            <h3 className="font-semibold mb-3">Matriz de Confusión</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {results.confusionMatrix.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="border border-border p-2 text-center font-mono"
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
