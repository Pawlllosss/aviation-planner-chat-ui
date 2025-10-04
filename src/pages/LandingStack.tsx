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

const AVERAGE_PENSION_MEN = 4979;
const AVERAGE_PENSION_WOMEN = 3422;
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

    const isRealistic = debouncedAmount <= AVERAGE_PENSION_MEN;
    const difference = debouncedAmount - AVERAGE_PENSION_MEN;

    const chartData = {
        labels: ['Chcę                                                    ', '              Średnia ZUS'],
        datasets: [{
            label: 'Chcę',
            data: [debouncedAmount],
            backgroundColor: isRealistic ? 'rgb(0, 153, 63)' : 'rgb(240, 94, 94)',
            borderRadius: 8,
            barThickness: 120
        }, {
            label: 'Średnia kobiet',
            data: [null, AVERAGE_PENSION_WOMEN],
            backgroundColor: 'rgb(147, 112, 219)',
            borderRadius: 8,
            barThickness: 60
        }, {
            label: 'Średnia mężczyzn',
            data: [null, AVERAGE_PENSION_MEN],
            backgroundColor: 'rgb(63, 132, 210)',
            borderRadius: 8,
            barThickness: 60
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            margin: {
                left: 0,
                right: 0
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: 'rgb(0, 65, 110)',
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    filter: (legendItem: any) => legendItem.text !== 'Chcę'
                }
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y.toLocaleString('pl-PL');
                        return `${label}: ${value} zł`;
                    }
                }
            },
            annotation: {
                annotations: {
                    womenLine: {
                        type: 'line' as const,
                        yMin: AVERAGE_PENSION_WOMEN,
                        yMax: AVERAGE_PENSION_WOMEN,
                        borderColor: 'rgb(147, 112, 219)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            display: true,
                            content: `Średnia kobiet: ${AVERAGE_PENSION_WOMEN.toLocaleString('pl-PL')} zł`,
                            position: 'center',
                            backgroundColor: 'rgb(147, 112, 219)',
                            color: 'white',
                            font: {
                                size: 11,
                                weight: 'bold'
                            },
                            padding: 4,
                            yAdjust: -10
                        }
                    },
                    menLine: {
                        type: 'line' as const,
                        yMin: AVERAGE_PENSION_MEN,
                        yMax: AVERAGE_PENSION_MEN,
                        borderColor: 'rgb(0, 65, 110)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            display: true,
                            content: `Średnia mężczyzn: ${AVERAGE_PENSION_MEN.toLocaleString('pl-PL')} zł`,
                            position: 'center',
                            backgroundColor: 'rgb(0, 65, 110)',
                            color: 'white',
                            font: {
                                size: 11,
                                weight: 'bold'
                            },
                            padding: 4,
                            yAdjust: -10
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
                                        marks={[
                                            { value: AVERAGE_PENSION_WOMEN, label: 'Średnia kobiet' },
                                            { value: AVERAGE_PENSION_MEN, label: 'Średnia mężczyzn' }
                                        ]}
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
                                                height: 16,
                                                width: 4,
                                                borderRadius: 2,
                                                opacity: 1,
                                                '&[data-index="0"]': {
                                                    backgroundColor: 'rgb(147, 112, 219)',
                                                },
                                                '&[data-index="1"]': {
                                                    backgroundColor: 'rgb(0, 65, 110)',
                                                },
                                            },
                                            '& .MuiSlider-markLabel': {
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                '&[data-index="0"]': {
                                                    top: '-40px',
                                                    marginTop: '0px',
                                                    color: 'rgb(147, 112, 219)',
                                                },
                                                '&[data-index="1"]': {
                                                    marginTop: '8px',
                                                    color: 'rgb(0, 65, 110)',
                                                },
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
                                        {isRealistic ? 'Możliwe do osiągnięcia!' : `Średnia to ${AVERAGE_PENSION_MEN.toLocaleString('pl-PL')} zł`}
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
                                onClick={() => navigate('/calculator', { state: { expectedPension: debouncedAmount } })}
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
