import { useLocation, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
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
import DownloadIcon from '@mui/icons-material/Download';
import type { PensionResponse } from '../types/pension';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

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
  const contentRef = useRef<HTMLDivElement>(null);
  const data: PensionResponse | null = location.state?.data || null;
  const expectedPension: number = location.state?.expectedPension || 0;
  const retirementYear: number = location.state?.retirementYear || 2060;

  // Get form input data from location state
  const formInputData = {
    age: location.state?.age,
    sex: location.state?.sex,
    grossSalary: location.state?.grossSalary,
    startYear: location.state?.startYear,
    includeSickLeave: location.state?.includeSickLeave,
    avgSickDaysPerYear: location.state?.avgSickDaysPerYear,
    zipCode: location.state?.zipCode
  };

  if (!data) {
    navigate('/calculator');
    return null;
  }

  const { nominalPension, realPension, accountProgression } = data;

  // Format number to Polish locale
  const formatNumber = (num: number) => {
    return num.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const downloadPDF = async () => {
    try {
      // Dynamic import of pdfMake to avoid SSR issues
      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      const pdfFonts = await import('pdfmake/build/vfs_fonts');
      (pdfMake as any).vfs = pdfFonts;

      // Prepare input data
      const inputData: string[][] = [
        ['Wiek', `${formInputData.age || 'N/A'}`],
        ['Płeć', formInputData.sex === 'M' ? 'Mężczyzna' : 'Kobieta'],
        ['Zarobki miesięczne brutto', `${formatNumber(formInputData.grossSalary || 0)} zł`],
        ['Rok rozpoczęcia pracy', `${formInputData.startYear || 'N/A'}`],
        ['Rok przejścia na emeryturę', `${retirementYear}`],
      ];

      if (formInputData.includeSickLeave) {
        inputData.push(['Średnia dni chorobowych rocznie', `${formInputData.avgSickDaysPerYear || 0}`]);
      }
      if (formInputData.zipCode) {
        inputData.push(['Kod pocztowy', formInputData.zipCode]);
      }
      if (expectedPension > 0) {
        inputData.push(['Oczekiwana emerytura', `${formatNumber(expectedPension)} zł`]);
      }

      // Get chart image
      const chartCanvas = document.querySelector('canvas');
      const chartImage = chartCanvas ? chartCanvas.toDataURL('image/png', 0.8) : null;

      // Build PDF content
      const content: TDocumentDefinitions['content'] = [
        { text: 'Raport Symulacji Emerytalnej', style: 'header', alignment: 'center' },
        { text: '\n' },
        { text: 'Wprowadzone dane', style: 'subheader' },
        {
          table: {
            widths: ['*', '*'],
            body: inputData.map(row => [
              { text: row[0], bold: true },
              { text: row[1] }
            ])
          },
          layout: 'lightHorizontalLines'
        },
        { text: '\n' },
        { text: 'Wysokość rzeczywista', style: 'subheader' },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Z uwzględnieniem chorobowych', bold: true }, `${formatNumber(nominalPension.withSickLeave)} zł`],
              [{ text: 'Bez uwzględnienia chorobowych', bold: true }, `${formatNumber(nominalPension.withoutSickLeave)} zł`],
              [{ text: 'Stopa zastąpienia', bold: true }, `${formatNumber(nominalPension.replacementRate)}%`],
              [{ text: 'Porównanie do średniej', bold: true }, `${formatNumber(nominalPension.vsAveragePension)}%`],
              [{ text: `Średnia emerytura w ${retirementYear}`, bold: true }, `${formatNumber(nominalPension.finalAveragePension)} zł`],
              [{ text: 'Prognozowana pensja', bold: true }, `${formatNumber(nominalPension.finalSalary)} zł`],
            ]
          },
          layout: 'lightHorizontalLines'
        },
        { text: '\n' },
        { text: 'Wysokość z uwzględnieniem inflacji', style: 'subheader' },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Z uwzględnieniem chorobowych', bold: true }, `${formatNumber(realPension.withSickLeave)} zł`],
              [{ text: 'Bez uwzględnienia chorobowych', bold: true }, `${formatNumber(realPension.withoutSickLeave)} zł`],
              [{ text: 'Stopa zastąpienia', bold: true }, `${formatNumber(realPension.replacementRate)}%`],
              [{ text: 'Porównanie do średniej', bold: true }, `${formatNumber(realPension.vsAveragePension)}%`],
              [{ text: `Średnia emerytura w ${retirementYear}`, bold: true }, `${formatNumber(realPension.finalAveragePension)} zł`],
              [{ text: 'Prognozowana pensja', bold: true }, `${formatNumber(realPension.finalSalary)} zł`],
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ];

      // Add delayed scenarios if they exist
      if (nominalPension.delayedScenarios.length > 0) {
        content.push(
          { text: '\n', pageBreak: 'before' },
          { text: 'Scenariusze opóźnienia (rzeczywista)', style: 'subheader' },
          {
            table: {
              widths: ['*', '*', 'auto'],
              headerRows: 1,
              body: [
                [{ text: 'Scenariusz', bold: true, fillColor: '#00993F', color: 'white' },
                 { text: 'Emerytura', bold: true, fillColor: '#00993F', color: 'white' },
                 { text: 'Wzrost', bold: true, fillColor: '#00993F', color: 'white' }],
                ...nominalPension.delayedScenarios.map(s => [
                  `Opóźnienie o ${s.years} ${s.years === 1 ? 'rok' : s.years < 5 ? 'lata' : 'lat'}`,
                  `${formatNumber(s.pension)} zł`,
                  `+${formatNumber(s.increasePct)}%`
                ])
              ]
            },
            layout: 'lightHorizontalLines'
          }
        );

        if (realPension.delayedScenarios.length > 0) {
          content.push(
            { text: '\n' },
            { text: 'Scenariusze opóźnienia (urealniona)', style: 'subheader' },
            {
              table: {
                widths: ['*', '*', 'auto'],
                headerRows: 1,
                body: [
                  [{ text: 'Scenariusz', bold: true, fillColor: '#3F84D2', color: 'white' },
                   { text: 'Emerytura', bold: true, fillColor: '#3F84D2', color: 'white' },
                   { text: 'Wzrost', bold: true, fillColor: '#3F84D2', color: 'white' }],
                  ...realPension.delayedScenarios.map(s => [
                    `Opóźnienie o ${s.years} ${s.years === 1 ? 'rok' : s.years < 5 ? 'lata' : 'lat'}`,
                    `${formatNumber(s.pension)} zł`,
                    `+${formatNumber(s.increasePct)}%`
                  ])
                ]
              },
              layout: 'lightHorizontalLines'
            }
          );
        }
      }

      // Add chart if available
      if (chartImage) {
        content.push(
          { text: '\n', pageBreak: 'before' },
          { text: 'Progresja kapitału w czasie', style: 'subheader', alignment: 'center' },
          { text: '\n' },
          { image: chartImage, width: 500, alignment: 'center' }
        );
      }

      const docDefinition = {
        content,
        styles: {
          header: {
            fontSize: 22,
            bold: true,
            margin: [0, 0, 0, 10] as [number, number, number, number]
          },
          subheader: {
            fontSize: 16,
            bold: true,
            margin: [0, 10, 0, 5] as [number, number, number, number]
          }
        },
        defaultStyle: {
          font: 'Roboto'
        }
      };

      pdfMake.createPdf(docDefinition).download(`Raport_Emerytalny_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Wystąpił błąd podczas generowania PDF');
    }
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
            weight: 'bold' as const
          },
          color: 'rgb(0, 65, 110)',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 65, 110, 0.9)',
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          label: function(context: { dataset: { label?: string }; parsed: { y: number | null } }) {
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
          callback: function(value: string | number) {
            return formatNumber(Number(value)) + ' zł';
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
      <div ref={contentRef} className="max-w-7xl mx-auto" style={{ animation: 'slideInFromRight 0.6s ease-out' }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6" style={{ color: 'rgb(0, 65, 110)' }}>
            Symulacja Emerytalna
          </h1>
          {expectedPension > 0 && (
            <div className="mb-6">
              <p className="text-xl mb-2" style={{ color: 'rgb(0, 65, 110)' }}>
                Twoja oczekiwana emerytura
              </p>
              <p className="text-4xl font-bold mb-4" style={{ color: 'rgb(0, 153, 63)' }}>
                {formatNumber(expectedPension)} zł
              </p>
            </div>
          )}
          <p className="text-xl" style={{ color: 'rgb(63, 132, 210)' }}>
            Twoja prognozowana emerytura
          </p>
        </div>

        {/* Main Results Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Nominal Pension Card */}
          <div className="rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(0, 153, 63, 0.05)', border: '3px solid rgb(0, 153, 63)', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <h2 className="text-2xl font-bold mb-6 text-center p-8 pb-0" style={{ color: 'rgb(0, 65, 110)' }}>
              Wysokość rzeczywista
            </h2>

            <div className="space-y-3 overflow-y-auto px-8 pb-8" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(190, 195, 206) transparent' }}>
              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Z uwzględnieniem chorobowych</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(nominalPension.withSickLeave)} zł
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Bez uwzględnienia chorobowych</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(nominalPension.withoutSickLeave)} zł
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Stopa zastąpienia</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(nominalPension.replacementRate)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Porównanie do średniej emerytury</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(nominalPension.vsAveragePension)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Średnia prognozowana emerytura w {retirementYear}</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(nominalPension.finalAveragePension)} zł
                </span>
              </div>

              <div className="py-2">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Prognozowana pensja w dniu przejścia na emeryturę</span>
                  <span className="text-xl font-bold text-right whitespace-nowrap" style={{ color: 'rgb(0, 153, 63)' }}>
                    {formatNumber(nominalPension.finalSalary)} zł
                  </span>
                </div>
              </div>

              {nominalPension.extraYearsNeededForExpected && (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 179, 79, 0.2)', border: '2px solid rgb(255, 179, 79)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Dodatkowe lata pracy dla oczekiwanej emerytury</span>
                    <span className="text-xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
                      {nominalPension.extraYearsNeededForExpected} {nominalPension.extraYearsNeededForExpected === 1 ? 'rok' : nominalPension.extraYearsNeededForExpected < 5 ? 'lata' : 'lat'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Real Pension Card */}
          <div className="rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(63, 132, 210, 0.05)', border: '3px solid rgb(63, 132, 210)', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <h2 className="text-2xl font-bold mb-6 text-center p-8 pb-0" style={{ color: 'rgb(0, 65, 110)' }}>
              Wysokość z uwzględnieniem inflacji
            </h2>

            <div className="space-y-3 overflow-y-auto px-8 pb-8" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(190, 195, 206) transparent' }}>
              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Z uwzględnieniem chorobowych</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(realPension.withSickLeave)} zł
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Bez uwzględnienia chorobowych</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(realPension.withoutSickLeave)} zł
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Stopa zastąpienia</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(realPension.replacementRate)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Porównanie do średniej emerytury</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(0, 153, 63)' }}>
                  {formatNumber(realPension.vsAveragePension)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b-2" style={{ borderColor: 'rgb(190, 195, 206)' }}>
                <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Średnia prognozowana emerytura w {retirementYear}</span>
                <span className="text-xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                  {formatNumber(realPension.finalAveragePension)} zł
                </span>
              </div>

              <div className="py-2">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Prognozowana pensja w dniu przejścia na emeryturę</span>
                  <span className="text-xl font-bold text-right whitespace-nowrap" style={{ color: 'rgb(63, 132, 210)' }}>
                    {formatNumber(realPension.finalSalary)} zł
                  </span>
                </div>
              </div>

              {realPension.extraYearsNeededForExpected && (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 179, 79, 0.2)', border: '2px solid rgb(255, 179, 79)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>Dodatkowe lata pracy dla oczekiwanej emerytury</span>
                    <span className="text-xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
                      {realPension.extraYearsNeededForExpected} {realPension.extraYearsNeededForExpected === 1 ? 'rok' : realPension.extraYearsNeededForExpected < 5 ? 'lata' : 'lat'}
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
                <h3 className="text-xl font-bold mb-6 text-center" style={{ color: 'rgb(0, 65, 110)' }}>
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
                <h3 className="text-xl font-bold mb-6 text-center" style={{ color: 'rgb(0, 65, 110)' }}>
                  Scenariusze opóźnienia (z uwzględnieniem inflacji)
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

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/calculator', {
              state: {
                ...formInputData,
                expectedPension: expectedPension,
                retirementYear: retirementYear
              }
            })}
            className="text-xl font-bold px-12 py-4 rounded-lg text-white transition-transform hover:scale-105 shadow-lg"
            style={{ backgroundColor: 'rgb(0, 65, 110)' }}
          >
            Wróć do kalkulatora
          </button>
            <button
                onClick={downloadPDF}
                className="text-xl font-bold px-12 py-4 rounded-lg text-white transition-transform hover:scale-105 shadow-lg flex items-center gap-2"
                style={{ backgroundColor: 'rgb(0, 153, 63)' }}
            >
                <DownloadIcon />
                Pobierz PDF
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
