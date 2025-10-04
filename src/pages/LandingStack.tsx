import { useState, useEffect } from 'react';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AVERAGE_PENSION = 3500;

function LandingStack() {
    const [amount, setAmount] = useState('');
    const [debouncedAmount, setDebouncedAmount] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const value = parseFloat(amount);
            if (value >= 100) {
                setDebouncedAmount(value);
                setShowFeedback(true);
            } else {
                setShowFeedback(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [amount]);

    const isRealistic = debouncedAmount <= 4000;
    const difference = debouncedAmount - AVERAGE_PENSION;

    const chartData = {
        labels: ['Chcę', 'Średnia ZUS'],
        datasets: [{
            data: [debouncedAmount, AVERAGE_PENSION],
            backgroundColor: [
                isRealistic ? 'rgb(0, 153, 63)' : 'rgb(240, 94, 94)',
                'rgb(63, 132, 210)'
            ],
            borderRadius: 8,
            barThickness: 120
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.parsed.y.toLocaleString('pl-PL')} zł`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: any) => `${value.toLocaleString('pl-PL')} zł`,
                    font: {
                        size: 14
                    }
                },
                grid: {
                    color: 'rgba(190, 195, 206, 0.2)'
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: 'rgb(0, 65, 110)'
                },
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-8">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-6" style={{ color: 'rgb(0, 65, 110)' }}>
                        Ile chcesz dostawać na emeryturze?
                    </h1>
                    <div className="relative inline-block">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="text-6xl font-bold text-center border-b-4 outline-none bg-transparent w-80 px-4 py-2 transition-colors"
                            style={{
                                borderColor: showFeedback
                                    ? isRealistic
                                        ? 'rgb(0, 153, 63)'
                                        : 'rgb(240, 94, 94)'
                                    : 'rgb(190, 195, 206)'
                            }}
                        />
                        <span className="text-4xl ml-4" style={{ color: 'rgb(0, 65, 110)' }}>
                            zł/mies.
                        </span>
                    </div>

                    {showFeedback && (
                        <div
                            className="mt-6 text-2xl font-semibold transition-opacity duration-500 opacity-100"
                            style={{
                                color: isRealistic ? 'rgb(0, 153, 63)' : 'rgb(240, 94, 94)'
                            }}
                        >
                            {isRealistic ? '💚 Możliwe do osiągnięcia!' : `🔥 Średnia to ${AVERAGE_PENSION} zł`}
                        </div>
                    )}
                </div>

                {showFeedback && (
                    <div className="mt-16 transition-opacity duration-500 opacity-100">
                        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'rgb(0, 65, 110)' }}>
                            Porównanie z rzeczywistością
                        </h2>

                        <div className="px-8" style={{ height: '400px' }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>

                        {difference !== 0 && (
                            <div className="text-center mt-8 text-xl" style={{ color: 'rgb(0, 65, 110)' }}>
                                Różnica: <span className="font-bold">{difference > 0 ? '+' : ''}{difference.toLocaleString('pl-PL')} zł</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center mt-16">
                    <button
                        className="text-2xl font-bold px-12 py-4 rounded-lg text-white transition-transform hover:scale-105"
                        style={{ backgroundColor: 'rgb(0, 153, 63)' }}
                    >
                        Policz swoją prawdziwą emeryturę
                    </button>
                    <p className="mt-4 text-gray-600">Zajmie 2 minuty</p>
                </div>
            </div>
        </div>
    );
}

export default LandingStack;
