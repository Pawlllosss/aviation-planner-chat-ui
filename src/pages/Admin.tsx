import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../utils/api';
import type { PensionCalculationAuditing } from '../types/pension';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { calculateVoivodeshipStats } from '../utils/zipCodeMapping';
import PolandMapVisualization from '../components/PolandMapVisualization';

interface DashboardStats {
    totalCalculations: number;
    todayCalculations: number;
    avgExpectedPension: number;
    avgCalculatedPension: number;
    maleCount: number;
    femaleCount: number;
    avgAge: number;
}

function Admin() {
    const [loading, setLoading] = useState(false);
    const [auditData, setAuditData] = useState<PensionCalculationAuditing[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalCalculations: 0,
        todayCalculations: 0,
        avgExpectedPension: 0,
        avgCalculatedPension: 0,
        maleCount: 0,
        femaleCount: 0,
        avgAge: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const voivodeshipData = useMemo(() => {
        const zipCodes = auditData.map(item => item.request.zipCode);
        return calculateVoivodeshipStats(zipCodes);
    }, [auditData]);

    const loadStats = async () => {
        try {
            const data = await api.get<PensionCalculationAuditing[]>('/pension/audit');

            setAuditData(data);

            if (data.length === 0) {
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const todayCount = data.filter(item =>
                item.calculatedAt.split('T')[0] === today
            ).length;

            const totalExpected = data.reduce((sum, item) => sum + item.request.expectedPension, 0);
            const totalCalculated = data.reduce((sum, item) => sum + item.response.nominalPension.withoutSickLeave, 0);
            const totalAge = data.reduce((sum, item) => sum + item.request.age, 0);
            const maleCount = data.filter(item => item.request.sex === 'M').length;

            setStats({
                totalCalculations: data.length,
                todayCalculations: todayCount,
                avgExpectedPension: totalExpected / data.length,
                avgCalculatedPension: totalCalculated / data.length,
                maleCount: maleCount,
                femaleCount: data.length - maleCount,
                avgAge: totalAge / data.length
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const downloadExcel = async () => {
        setLoading(true);
        try {
            const data = await api.get<PensionCalculationAuditing[]>('/pension/audit');

            const excelData = data.map(item => ({
                'Data użycia': new Date(item.calculatedAt).toLocaleDateString('pl-PL'),
                'Godzina użycia': new Date(item.calculatedAt).toLocaleTimeString('pl-PL'),
                'Emerytura oczekiwana': item.request.expectedPension,
                'Wiek': item.request.age,
                'Płeć': item.request.sex === 'M' ? 'Mężczyzna' : 'Kobieta',
                'Wysokość wynagrodzenia': item.request.grossSalary,
                'Czy uwzględniał okresy choroby': item.request.includeSickLeave ? 'Tak' : 'Nie',
                'Średnia liczba dni chorobowych na rok': item.request.avgSickDaysPerYear,
                'Wysokość zgromadzonych środków na koncie i Subkoncie': 'N/A (w przygotowaniu)',
                'Emerytura rzeczywista': item.response.nominalPension.withoutSickLeave.toFixed(2),
                'Emerytura urealniona': item.response.realPension.withoutSickLeave.toFixed(2),
                'Kod pocztowy': item.request.zipCode || 'Nie podano',
                'Rok rozpoczęcia pracy': item.request.startYear,
                'Rok przejścia na emeryturę': item.request.retirementYear
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Raporty Emerytur');

            // Auto-size columns
            const maxWidth = 30;
            const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
            worksheet['!cols'] = wscols;

            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `raport_emerytur_${timestamp}.xlsx`);
        } catch (error) {
            console.error('Error downloading Excel:', error);
            alert('Błąd podczas generowania raportu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8" style={{ backgroundColor: 'rgb(255, 255, 255)' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgb(0, 65, 110)' }}>
                        Panel Administracyjny ZUS
                    </h1>
                    <p className="text-lg" style={{ color: 'rgb(190, 195, 206)' }}>
                        Podgląd kalkulacji emerytalnych i generowanie raportów
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Calculations */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: 'rgb(63, 132, 210)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'rgb(190, 195, 206)' }}>
                                    Całkowita liczba kalkulacji
                                </p>
                                <p className="text-3xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
                                    {stats.totalCalculations}
                                </p>
                            </div>
                            <AssessmentIcon sx={{ fontSize: 48, color: 'rgb(63, 132, 210)' }} />
                        </div>
                    </div>

                    {/* Today's Calculations */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: 'rgb(0, 153, 63)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'rgb(190, 195, 206)' }}>
                                    Dzisiejsze kalkulacje
                                </p>
                                <p className="text-3xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
                                    {stats.todayCalculations}
                                </p>
                            </div>
                            <CalendarTodayIcon sx={{ fontSize: 48, color: 'rgb(0, 153, 63)' }} />
                        </div>
                    </div>

                    {/* Average Expected Pension */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: 'rgb(255, 179, 79)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'rgb(190, 195, 206)' }}>
                                    Średnia oczekiwana
                                </p>
                                <p className="text-3xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
                                    {stats.avgExpectedPension.toFixed(0)} zł
                                </p>
                            </div>
                            <TrendingUpIcon sx={{ fontSize: 48, color: 'rgb(255, 179, 79)' }} />
                        </div>
                    </div>

                    {/* Average Calculated Pension */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: 'rgb(240, 94, 94)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'rgb(190, 195, 206)' }}>
                                    Średnia wyliczona
                                </p>
                                <p className="text-3xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
                                    {stats.avgCalculatedPension.toFixed(0)} zł
                                </p>
                            </div>
                            <AssessmentIcon sx={{ fontSize: 48, color: 'rgb(240, 94, 94)' }} />
                        </div>
                    </div>
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>
                                Podział według płci
                            </h3>
                            <PeopleIcon sx={{ fontSize: 32, color: 'rgb(63, 132, 210)' }} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span style={{ color: 'rgb(190, 195, 206)' }}>Mężczyźni:</span>
                                <span className="font-bold" style={{ color: 'rgb(0, 65, 110)' }}>{stats.maleCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'rgb(190, 195, 206)' }}>Kobiety:</span>
                                <span className="font-bold" style={{ color: 'rgb(0, 65, 110)' }}>{stats.femaleCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>
                                Średni wiek użytkowników
                            </h3>
                        </div>
                        <p className="text-4xl font-bold" style={{ color: 'rgb(63, 132, 210)' }}>
                            {stats.avgAge.toFixed(1)} lat
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold" style={{ color: 'rgb(0, 65, 110)' }}>
                                Różnica oczekiwań
                            </h3>
                        </div>
                        <p className="text-4xl font-bold" style={{ color: stats.avgCalculatedPension < stats.avgExpectedPension ? 'rgb(240, 94, 94)' : 'rgb(0, 153, 63)' }}>
                            {((stats.avgCalculatedPension / stats.avgExpectedPension - 1) * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Voivodeship Visualization */}
                {voivodeshipData.length > 0 && (
                    <div className="mb-8">
                        <PolandMapVisualization data={voivodeshipData} />
                    </div>
                )}

                {/* Download Section */}
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: 'rgb(0, 65, 110)' }}>
                        Generowanie Raportu Excel
                    </h2>
                    <p className="mb-6" style={{ color: 'rgb(190, 195, 206)' }}>
                        Pobierz pełny raport wszystkich kalkulacji emerytalnych w formacie Excel
                    </p>
                    <button
                        onClick={downloadExcel}
                        disabled={loading}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: 'rgb(0, 153, 63)' }}
                    >
                        <DownloadIcon sx={{ fontSize: 28 }} />
                        {loading ? 'Generowanie...' : 'Pobierz Raport Excel'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Admin;
