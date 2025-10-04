import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { VoivodeshipData } from '../utils/zipCodeMapping';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PolandMapVisualizationProps {
  data: VoivodeshipData[];
}

export default function PolandMapVisualization({ data }: PolandMapVisualizationProps) {
  const chartData = useMemo(() => {
    // Sort by percentage descending
    const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

    return {
      labels: sortedData.map(d => d.name),
      datasets: [
        {
          label: 'Procent użytkowników',
          data: sortedData.map(d => d.percentage),
          backgroundColor: sortedData.map((d) => {
            // Color based on percentage
            const maxPercentage = Math.max(...data.map(item => item.percentage), 1);
            const intensity = d.percentage / maxPercentage;

            if (intensity < 0.2) return 'rgba(209, 250, 229, 0.8)';
            if (intensity < 0.4) return 'rgba(167, 243, 208, 0.8)';
            if (intensity < 0.6) return 'rgba(110, 231, 183, 0.8)';
            if (intensity < 0.8) return 'rgba(52, 211, 153, 0.8)';
            return 'rgba(16, 185, 129, 0.8)';
          }),
          borderColor: 'rgb(0, 65, 110)',
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const voiv = data.find(d => d.name === context.label);
            return `${context.parsed.x.toFixed(1)}% (${voiv?.count || 0} użytkowników)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Procent (%)',
          color: 'rgb(0, 65, 110)',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          color: 'rgb(0, 65, 110)'
        }
      },
      y: {
        ticks: {
          color: 'rgb(0, 65, 110)',
          font: {
            size: 12
          }
        }
      }
    }
  };

  const maxPercentage = useMemo(() => {
    return Math.max(...data.map(d => d.percentage), 1);
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'rgb(0, 65, 110)' }}>
        Rozkład geograficzny użytkowników według województw
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div>
          <div style={{ height: '500px' }}>
            <Bar data={chartData} options={options} />
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
            <div className="text-sm font-semibold mb-1" style={{ color: 'rgb(0, 65, 110)' }}>
              Liczba województw
            </div>
            <div className="text-4xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
              {data.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'rgb(100, 116, 139)' }}>
              z podanymi kodami pocztowymi
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
            <div className="text-sm font-semibold mb-1" style={{ color: 'rgb(0, 65, 110)' }}>
              Najczęstsze województwo
            </div>
            <div className="text-2xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
              {data[0]?.name || 'N/A'}
            </div>
            <div className="text-xl mt-1 font-semibold" style={{ color: 'rgb(0, 153, 63)' }}>
              {data[0]?.percentage.toFixed(1)}% ({data[0]?.count} użytkowników)
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 p-4" style={{ borderColor: 'rgb(0, 153, 63)' }}>
            <h4 className="font-bold text-lg mb-3" style={{ color: 'rgb(0, 65, 110)' }}>
              Top 5 Województw
            </h4>
            <div className="space-y-2">
              {data.slice(0, 5).map((voi, index) => (
                <div
                  key={voi.code}
                  className="flex items-center justify-between py-2 px-3 rounded"
                  style={{
                    backgroundColor: index === 0 ? 'rgba(0, 153, 63, 0.1)' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: index === 0 ? 'rgb(255, 179, 79)' : 'rgb(190, 195, 206)',
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{voi.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                      {voi.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs" style={{ color: 'rgb(100, 116, 139)' }}>
                      ({voi.count})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
