import { useLocation, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { PensionResponse } from '../types/pension';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data: PensionResponse | null = location.state?.data || null;
  const expectedPension: number = location.state?.expectedPension || 0;
  const retirementYear: number = location.state?.retirementYear || 2060;

  if (!data) {
    navigate('/calculator');
    return null;
  }

  const { nominalPension, realPension, accountProgression } = data;

  // Format number to Polish locale
  const formatNumber = (num: number) => {
    return num.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Prepare chart data
  const chartData = {
    labels: accountProgression.map(item => item.year.toString()),
    datasets: [
      {
        label: 'Wysokość rzeczywista',
        data: accountProgression.map(item => item.balanceNominal),
        borderColor: 'rgb(0, 153, 63)',
        backgroundColor: 'rgba(0, 153, 63, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
      {
        label: 'Wysokość z uwzględnieniem inflacji',
        data: accountProgression.map(item => item.balanceReal),
        borderColor: 'rgb(63, 132, 210)',
        backgroundColor: 'rgba(63, 132, 210, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
            weight: '600' as const
          },
          color: 'rgb(0, 65, 110)',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 65, 110, 0.9)',
        titleFont: {
          size: 14,
          weight: '700' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatNumber(context.parsed.y) + ' zł';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(190, 195, 206, 0.3)'
        },
        ticks: {
          font: {
            size: 12
          },
          color: 'rgb(0, 65, 110)',
          callback: function(value: any) {
            return formatNumber(value) + ' zł';
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          },
          color: 'rgb(0, 65, 110)',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-8" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="max-w-7xl mx-auto" style={{ animation: 'slideInFromRight 0.6s ease-out' }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ color: 'rgb(0, 65, 110)' }}>
            Symulacja Emerytalna
          </h1>
          <p className="text-xl" style={{ color: 'rgb(63, 132, 210)' }}>
            Twoja prognozowana emerytura
          </p>
        </div>

        {/* Main Results Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Nominal Pension Card */}
          <div className="p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(0, 153, 63, 0.05)', border: '3px solid rgb(0, 153, 63)' }}>
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'rgb(0, 65, 110)' }}>
              Wysokość rzeczywista
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Z uwzględnieniem chorobowych</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(nominalPension.withSickLeave)} zł
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Bez uwzględnienia chorobowych</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(nominalPension.withoutSickLeave)} zł
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Stopa zastąpienia</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(nominalPension.replacementRate)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Porównanie do średniej emerytury</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(nominalPension.vsAveragePension)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Średnia prognozowana emerytura w {retirementYear}</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(nominalPension.finalAveragePension)} zł
                </span>
              </div>

              <div className="py-3">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Prognozowana pensja w dniu przejścia na emeryturę</span>
                  <span className="text-2xl font-bold text-right whitespace-nowrap" style={{ color: 'rgb(0, 153, 63)' }}>
                    {formatNumber(nominalPension.finalSalary)} zł
                  </span>
                </div>
              </div>

              {nominalPension.salaryNeededForExpected && (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 179, 79, 0.2)', border: '2px solid rgb(255, 179, 79)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Wymagana pensja dla oczekiwanej emerytury</span>
                    <span className="text-xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
                      {formatNumber(nominalPension.salaryNeededForExpected)} zł
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Real Pension Card */}
          <div className="p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(63, 132, 210, 0.05)', border: '3px solid rgb(63, 132, 210)' }}>
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'rgb(0, 65, 110)' }}>
              Wysokość z uwzględnieniem inflacji
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Z uwzględnieniem chorobowych</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(realPension.withSickLeave)} zł
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Bez uwzględnienia chorobowych</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(realPension.withoutSickLeave)} zł
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Stopa zastąpienia</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(realPension.replacementRate)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Porównanie do średniej emerytury</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(realPension.vsAveragePension)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Średnia prognozowana emerytura w {retirementYear}</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(realPension.finalAveragePension)} zł
                </span>
              </div>

              <div className="py-3">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Prognozowana pensja w dniu przejścia na emeryturę</span>
                  <span className="text-2xl font-bold text-right whitespace-nowrap" style={{ color: 'rgb(63, 132, 210)' }}>
                    {formatNumber(realPension.finalSalary)} zł
                  </span>
                </div>
              </div>

              {realPension.salaryNeededForExpected && (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 179, 79, 0.2)', border: '2px solid rgb(255, 179, 79)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Wymagana pensja dla oczekiwanej emerytury</span>
                    <span className="text-xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
                      {formatNumber(realPension.salaryNeededForExpected)} zł
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-12 p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(190, 195, 206, 0.1)', border: '3px solid rgb(190, 195, 206)' }}>
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'rgb(0, 65, 110)' }}>
            Progresja kapitału w czasie
          </h2>
          <div style={{ height: '500px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Delayed Scenarios Section */}
        {(nominalPension.delayedScenarios.length > 0 || realPension.delayedScenarios.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Nominal Delayed Scenarios */}
            {nominalPension.delayedScenarios.length > 0 && (
              <div className="p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(0, 153, 63, 0.05)', border: '3px solid rgb(0, 153, 63)' }}>
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'rgb(0, 65, 110)' }}>
                  Scenariusze opóźnienia (rzeczywista)
                </h3>
                <div className="space-y-4">
                  {nominalPension.delayedScenarios.map((scenario, index) => (
                    <div key={index} className="p-4 rounded-lg" style={{ backgroundColor: 'white', border: '2px solid rgb(190, 195, 206)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>
                          Opóźnienie o {scenario.years} {scenario.years === 1 ? 'rok' : scenario.years < 5 ? 'lata' : 'lat'}
                        </span>
                        <span className="text-sm font-bold px-3 py-1 rounded" style={{ backgroundColor: 'rgba(0, 153, 63, 0.2)', color: 'rgb(0, 153, 63)' }}>
                          +{formatNumber(scenario.increasePct)}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                        {formatNumber(scenario.pension)} zł
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real Delayed Scenarios */}
            {realPension.delayedScenarios.length > 0 && (
              <div className="p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(63, 132, 210, 0.05)', border: '3px solid rgb(63, 132, 210)' }}>
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'rgb(0, 65, 110)' }}>
                  Scenariusze opóźnienia (urealniona)
                </h3>
                <div className="space-y-4">
                  {realPension.delayedScenarios.map((scenario, index) => (
                    <div key={index} className="p-4 rounded-lg" style={{ backgroundColor: 'white', border: '2px solid rgb(190, 195, 206)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>
                          Opóźnienie o {scenario.years} {scenario.years === 1 ? 'rok' : scenario.years < 5 ? 'lata' : 'lat'}
                        </span>
                        <span className="text-sm font-bold px-3 py-1 rounded" style={{ backgroundColor: 'rgba(63, 132, 210, 0.2)', color: 'rgb(63, 132, 210)' }}>
                          +{formatNumber(scenario.increasePct)}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                        {formatNumber(scenario.pension)} zł
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/calculator', { state: { expectedPension: expectedPension } })}
            className="text-xl font-bold px-12 py-4 rounded-lg text-white transition-transform hover:scale-105 shadow-lg"
            style={{ backgroundColor: 'rgb(0, 65, 110)' }}
          >
            Wróć do kalkulatora
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
