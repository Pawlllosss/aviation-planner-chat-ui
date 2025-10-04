import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import ChatModal from '../components/ChatModal';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Slider } from '@mui/material';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);

const AVERAGE_PENSION = 3500;

function LandingStack() {
    const navigate = useNavigate();
    const location = useLocation();
    const expectedPension = location.state?.expectedPension || 0;

    const [amount, setAmount] = useState(expectedPension > 0 ? expectedPension.toString() : '');
    const [displayAmount, setDisplayAmount] = useState(expectedPension > 0 ? expectedPension.toLocaleString('pl-PL') : '');
    const [debouncedAmount, setDebouncedAmount] = useState(expectedPension || 0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
    const formatNumber = (value: string) => {
        const num = value.replace(/\s/g, '');
        if (!num) return '';
        return parseInt(num).toLocaleString('pl-PL');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s/g, '');
        if (value === '' || /^\d+$/.test(value)) {
            setAmount(value);
            setDisplayAmount(formatNumber(value));
        }
    };

    useEffect(() => {
        const value = parseFloat(amount);
        if (value >= 100) {
            setDebouncedAmount(value);
            setShowFeedback(true);
        } else {
            setShowFeedback(false);
        }

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
            },
            annotation: {
                annotations: {
                    averageLine: {
                        type: 'line' as const,
                        yMin: AVERAGE_PENSION,
                        yMax: AVERAGE_PENSION,
                        borderColor: 'rgb(63, 132, 210)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            display: true,
                            content: `Średnia: ${AVERAGE_PENSION.toLocaleString('pl-PL')} zł`,
                            position: 'end',
                            backgroundColor: 'rgb(63, 132, 210)',
                            color: 'white',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            padding: 6
                        }
                    }
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
        <div className="h-screen flex items-center justify-center bg-white p-4" style={{ overflow: 'hidden' }}>
            <div className="max-w-4xl w-full">
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold mb-6" style={{ color: 'rgb(0, 65, 110)' }}>
                        Czy stać Cię na spokojną przyszłość?
                    </h1>

                    <p className="text-lg mb-8" style={{ color: 'rgb(0, 65, 110)' }}>
                        Ile chcesz otrzymywać miesięcznie na emeryturze?
                    </p>

                    <div className="max-w-5xl mx-auto mb-8 px-12">
                        {/* Display value */}
                        <div className="text-center mb-8">
                            <input
                                type="text"
                                value={displayAmount}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="text-4xl font-bold text-center outline-none bg-transparent border-0"
                                style={{
                                    color: showFeedback
                                        ? isRealistic
                                            ? 'rgb(0, 153, 63)'
                                            : 'rgb(240, 94, 94)'
                                        : 'rgb(0, 65, 110)',
                                    width: 'auto',
                                    minWidth: '200px',
                                    letterSpacing: '-0.01em'
                                }}
                            />
                        </div>

                        {/* Slider section */}
                        <div className="relative">
                            <div className="flex items-center gap-8">
                                {/* Min label - left */}
                                <div className="text-lg font-semibold whitespace-nowrap" style={{ color: 'rgba(0, 65, 110, 0.6)' }}>
                                    1 000 zł
                                </div>

                                {/* Slider - center */}
                                <div className="flex-1">
                                    <Slider
                                        value={parseFloat(amount || '0')}
                                        onChange={(_, value) => {
                                            const newValue = value.toString();
                                            setAmount(newValue);
                                            setDisplayAmount(formatNumber(newValue));
                                        }}
                                        marks={[{ value: AVERAGE_PENSION, label: 'Średnia krajowa' }]}
                                        valueLabelDisplay="auto"
                                        min={1000}
                                        max={25000}
                                        step={100}
                                        sx={{
                                            color: showFeedback
                                                ? isRealistic
                                                    ? 'rgb(0, 153, 63)'
                                                    : 'rgb(240, 94, 94)'
                                                : 'rgb(63, 132, 210)',
                                            height: 8,
                                            '& .MuiSlider-track': {
                                                border: 'none',
                                                height: 8,
                                            },
                                            '& .MuiSlider-rail': {
                                                backgroundColor: '#E8EAED',
                                                opacity: 1,
                                                height: 8,
                                            },
                                            '& .MuiSlider-thumb': {
                                                height: 36,
                                                width: 36,
                                                backgroundColor: '#fff',
                                                border: '4px solid currentColor',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                '&:hover, &:focus, &:active': {
                                                    boxShadow: '0 3px 16px rgba(0, 0, 0, 0.25)',
                                                },
                                            },
                                            '& .MuiSlider-mark': {
                                                backgroundColor: 'rgb(63, 132, 210)',
                                                height: 16,
                                                width: 4,
                                                borderRadius: 2,
                                                opacity: 1,
                                            },
                                            '& .MuiSlider-markLabel': {
                                                color: 'rgb(63, 132, 210)',
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                marginTop: '8px',
                                            },
                                        }}
                                    />
                                </div>

                                {/* Max label - right */}
                                <div className="text-lg font-semibold whitespace-nowrap" style={{ color: 'rgba(0, 65, 110, 0.6)' }}>
                                    25 000 zł
                                </div>
                            </div>
                        </div>
                    </div>

                    {showFeedback && (
                        <div className="mt-8">
                            <div className="text-center">
                                <div
                                    className="inline-flex items-center gap-2 text-lg font-medium"
                                    style={{
                                        color: isRealistic ? 'rgb(0, 153, 63)' : 'rgb(240, 94, 94)'
                                    }}
                                >
                                    <span className="text-2xl">
                                        {isRealistic ? '💚' : '🔥'}
                                    </span>
                                    <span>
                                        {isRealistic ? 'Możliwe do osiągnięcia!' : 'Średnia to 3 500 zł'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {showFeedback && (
                    <div className="mt-8" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        <h2 className="text-xl font-bold text-center mb-4" style={{ color: 'rgb(0, 65, 110)' }}>
                            Porównanie z rzeczywistością
                        </h2>

                        <div className="px-8" style={{ height: '300px' }}>
                            <Bar
                                data={chartData}
                                options={chartOptions}
                                aria-label="Wykres porównawczy Twojej oczekiwanej emerytury ze średnią emeryturą ZUS"
                                role="img"
                            />
                        </div>

                        <div className="text-center mt-8 text-xl" style={{ color: 'rgb(0, 65, 110)' }}>
                            Różnica: <span className="font-bold">{difference > 0 ? '+' : ''}{difference.toLocaleString('pl-PL')} zł</span>
                        </div>

                        <div className="flex justify-center gap-4 mt-12">
                            <button
                                onClick={() => navigate('/calculator', { state: { desiredAmount: debouncedAmount } })}
                                className="px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/50"
                                style={{
                                    backgroundColor: 'rgb(0, 153, 63)',
                                    color: 'white'
                                }}
                            >
                                Zaplanuj swoją emeryturę
                            </button>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                style={{
                                    backgroundColor: 'rgb(63, 132, 210)',
                                    color: 'white'
                                }}
                                title="Otwórz czat z asystentem"
                            >
                                💬 Czat z asystentem
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Chat Modal */}
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                openAIKey={openAIKey}
                desiredAmount={debouncedAmount}
            />
        </div>
    );
}

export default LandingStack;
