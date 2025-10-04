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
import annotationPlugin from 'chartjs-plugin-annotation';
import { TextField, InputAdornment } from '@mui/material';

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
    const [amount, setAmount] = useState('');
    const [displayAmount, setDisplayAmount] = useState('');
    const [debouncedAmount, setDebouncedAmount] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-white p-8">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-12" style={{ color: 'rgb(0, 65, 110)' }}>
                        Czy stać Cię na spokojną przyszłość?
                    </h1>

                    <p className="text-xl mb-8" style={{ color: 'rgb(0, 65, 110)' }}>
                        Ile chcesz otrzymywać miesięcznie na emeryturze?
                    </p>

                    <div className="flex justify-center items-center gap-3 mb-6">
                        <TextField
                            type="text"
                            value={displayAmount}
                            onChange={handleInputChange}
                            placeholder="5 000"
                            variant="outlined"
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end" sx={{ fontSize: '1.5rem', color: 'rgb(0, 65, 110)' }}>zł</InputAdornment>,
                                    sx: {
                                        fontSize: '2.5rem',
                                        fontWeight: 500,
                                        color: 'rgb(0, 65, 110)',
                                        textAlign: 'center',
                                        '& input': {
                                            textAlign: 'center',
                                            padding: '16px 20px'
                                        }
                                    }
                                }
                            }}
                            sx={{
                                width: '320px',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: 'white',
                                    '& fieldset': {
                                        borderColor: showFeedback
                                            ? isRealistic
                                                ? 'rgb(0, 153, 63)'
                                                : 'rgb(240, 94, 94)'
                                            : 'rgba(190, 195, 206, 0.4)',
                                        borderWidth: '1px'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: showFeedback
                                            ? isRealistic
                                                ? 'rgb(0, 153, 63)'
                                                : 'rgb(240, 94, 94)'
                                            : 'rgba(190, 195, 206, 0.6)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: showFeedback
                                            ? isRealistic
                                                ? 'rgb(0, 153, 63)'
                                                : 'rgb(240, 94, 94)'
                                            : 'rgb(63, 132, 210)',
                                        borderWidth: '2px'
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="max-w-lg mx-auto mb-8">
                        <input
                            type="range"
                            min="1000"
                            max="15000"
                            step="100"
                            value={amount || '5000'}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setDisplayAmount(formatNumber(e.target.value));
                            }}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, ${
                                    showFeedback
                                        ? isRealistic
                                            ? 'rgb(0, 153, 63)'
                                            : 'rgb(240, 94, 94)'
                                        : 'rgb(63, 132, 210)'
                                } 0%, ${
                                    showFeedback
                                        ? isRealistic
                                            ? 'rgb(0, 153, 63)'
                                            : 'rgb(240, 94, 94)'
                                        : 'rgb(63, 132, 210)'
                                } ${((parseFloat(amount || '5000') - 1000) / (15000 - 1000)) * 100}%, rgba(190, 195, 206, 0.2) ${((parseFloat(amount || '5000') - 1000) / (15000 - 1000)) * 100}%, rgba(190, 195, 206, 0.2) 100%)`
                            }}
                        />
                        <div className="flex justify-between text-sm mt-2" style={{ color: 'rgba(0, 65, 110, 0.6)' }}>
                            <span>1 000 zł</span>
                            <span>15 000 zł</span>
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
                    <div className="mt-16 transition-opacity duration-500 opacity-100">
                        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'rgb(0, 65, 110)' }}>
                            Porównanie z rzeczywistością
                        </h2>

                        <div className="px-8" style={{ height: '400px' }}>
                            <Bar
                                data={chartData}
                                options={chartOptions}
                                aria-label="Wykres porównawczy Twojej oczekiwanej emerytury ze średnią emeryturą ZUS"
                                role="img"
                            />
                        </div>

                        {difference !== 0 && (
                            <div className="text-center mt-8 text-xl" style={{ color: 'rgb(0, 65, 110)' }}>
                                Różnica: <span className="font-bold">{difference > 0 ? '+' : ''}{difference.toLocaleString('pl-PL')} zł</span>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default LandingStack;
