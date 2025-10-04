import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from './utils/api';
import type { PensionResponse } from './types/pension';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface FormData {
  age: number;
  sex: 'M' | 'F';
  startYear: number;
  grossSalary: number;
  retirementYear: number;
  expectedPension: number;
  zipCode?: string;
}

const RetirementForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const desiredAmount = location.state?.desiredAmount || 0;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      age: 35,
      sex: 'M',
      grossSalary: 5050,
      startYear: 2025,
      retirementYear: 2060,
      expectedPension: desiredAmount
    }
  });

  const age = watch('age');
  const sex = watch('sex');

  // Calculate default retirement year based on age and sex
  useEffect(() => {
    if (!age || !sex) return;

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;

    // Default retirement ages: male 65, female 60
    const retirementAge = sex === 'M' ? 65 : 60;
    const calculatedYear = birthYear + retirementAge;
    setValue('retirementYear', calculatedYear);
  }, [age, sex, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
        console.log(data)
      const response = await api.post<PensionResponse>("/pension/calculate", data);
      console.log('Response:', response);

      // Navigate to dashboard with response data and expected pension
      navigate('/dashboard', { state: { data: response, expectedPension: data.expectedPension } });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className=" flex items-center justify-center bg-white" style={{ animation: 'fadeIn 0.5s ease-out', overflow: 'hidden' }}>
      {/* Back Button - Top Left */}
      <button
        type="button"
        onClick={() => navigate('/', { state: { expectedPension: watch('expectedPension') } })}
        className="transition-all hover:scale-110"
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          color: 'rgb(63, 132, 210)',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        aria-label="Wróć do planowania"
      >
        <ArrowBackIcon sx={{ fontSize: 32 }} />
      </button>

      <div className="max-w-4xl w-full h-full overflow-y-auto px-8 py-6" style={{ animation: 'slideInFromRight 0.6s ease-out' }}>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
            Oblicz swoją przyszłą emeryturę
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Desired Pension - Display Only */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', display: 'block' }}>
              Oczekiwana emerytura miesięczna
            </label>
            <div className="text-3xl font-bold text-center py-2" style={{ color: 'rgb(0, 153, 63)' }}>
              {desiredAmount > 0 ? desiredAmount.toLocaleString('pl-PL') : '0'}
            </div>
          </div>

          {/* Age and Retirement Year in one row */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Age Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1', minWidth: '200px', maxWidth: '300px' }}>
              <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50px', textAlign: 'center' }}>
                Twój wiek
              </label>
              <input
                type="number"
                {...register('age', { required: 'Wiek jest wymagany', valueAsNumber: true })}
                className="text-2xl font-bold text-center border-b-4 outline-none bg-transparent w-full py-2 transition-colors"
                style={{ borderColor: age ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)' }}
              />
              {errors.age && <p className="text-red-500 mt-1 text-sm">{errors.age.message}</p>}
            </div>

            {/* Retirement Year */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1', minWidth: '200px', maxWidth: '300px' }}>
              <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50px', textAlign: 'center' }}>
                Planowany rok przejścia na emeryturę
              </label>
              <input
                type="number"
                {...register('retirementYear', { required: 'Rok przejścia na emeryturę jest wymagany', valueAsNumber: true })}
                placeholder="2050"
                className="text-2xl font-bold text-center border-b-4 outline-none bg-transparent w-full py-2 transition-colors"
                style={{ borderColor: watch('retirementYear') ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)' }}
              />
              {errors.retirementYear && <p className="text-red-500 mt-1 text-sm">{errors.retirementYear.message}</p>}
            </div>
          </div>

          {/* Gender Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', display: 'block' }}>
              Płeć
            </label>
            <div className="flex gap-8 justify-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register('sex', { required: true })}
                  value="M"
                  className="w-6 h-6 mr-3"
                  style={{ accentColor: 'rgb(63, 132, 210)' }}
                />
                <span className="text-xl font-medium">Mężczyzna</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register('sex', { required: true })}
                  value="F"
                  className="w-6 h-6 mr-3"
                  style={{ accentColor: 'rgb(63, 132, 210)' }}
                />
                <span className="text-xl font-medium">Kobieta</span>
              </label>
            </div>
          </div>

          {/* Current Salary */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', display: 'block' }}>
              Obecne zarobki miesięczne
            </label>
            <input
                type="number"
                {...register('grossSalary', { required: 'Obecne zarobki są wymagane', valueAsNumber: true })}
                className="text-3xl font-bold text-center border-b-4 outline-none bg-transparent w-80 py-3 transition-colors"
                style={{ borderColor: watch('grossSalary') ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)' }}
            />
            {errors.grossSalary && <p className="text-red-500 mt-1">{errors.grossSalary.message}</p>}
          </div>

          {/* Start Work Year Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', display: 'block' }}>
              Rok rozpoczęcia pracy
            </label>
            <input
              type="number"
              {...register('startYear', { required: 'Rok rozpoczecia pracy jest wymagany', valueAsNumber: true })}
              className="text-3xl font-bold text-center border-b-4 outline-none bg-transparent w-80 py-3 transition-colors"
              style={{ borderColor: watch('startYear') ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)' }}
            />
            {errors.startYear && <p className="text-red-500 mt-1">{errors.startYear.message}</p>}
          </div>

          {/* Zip Code Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', display: 'block' }}>
              Kod pocztowy (opcjonalnie)
            </label>
            <input
              type="text"
              {...register('zipCode', {
                pattern: {
                  value: /^\d{2}-\d{3}$/,
                  message: 'Kod pocztowy musi być w formacie XX-XXX'
                }
              })}
              placeholder="00-000"
              maxLength={6}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d-]/g, '');
                const digits = value.replace(/-/g, '');
                let formatted = digits;
                if (digits.length > 2) {
                  formatted = digits.slice(0, 2) + '-' + digits.slice(2, 5);
                }
                e.target.value = formatted;
                setValue('zipCode', formatted);
              }}
              className="text-3xl font-bold text-center border-b-4 outline-none bg-transparent w-80 py-3 transition-colors"
              style={{ borderColor: watch('zipCode') ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)' }}
            />
            {errors.zipCode && <p className="text-red-500 mt-1">{errors.zipCode.message}</p>}
          </div>

          {/*/!* Job Entries Section *!/*/}
          {/*<div className="pt-8">*/}
          {/*  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>*/}
          {/*    <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.5rem', marginBottom: '2rem', display: 'block' }}>*/}
          {/*      Historia zatrudnienia*/}
          {/*    </label>*/}

          {/*    <div className="space-y-6 w-full max-w-2xl">*/}
          {/*      {fields.map((field, index) => (*/}
          {/*        <div*/}
          {/*          key={field.id}*/}
          {/*          className="p-6 rounded-lg transition-all"*/}
          {/*          style={{*/}
          {/*            backgroundColor: 'rgba(190, 195, 206, 0.08)',*/}
          {/*            border: '2px solid rgb(190, 195, 206)'*/}
          {/*          }}*/}
          {/*        >*/}
          {/*          /!* Salary Row *!/*/}
          {/*          <div className="flex items-center gap-4 mb-6">*/}
          {/*            <label className="text-lg font-semibold flex items-center gap-2 flex-shrink-0" style={{ color: 'rgb(0, 65, 110)' }}>*/}
          {/*              <AttachMoneyIcon /> Zarobki miesięcznie:*/}
          {/*            </label>*/}
          {/*            <div className="flex-1"></div>*/}
          {/*            <input*/}
          {/*              type="number"*/}
          {/*              {...register(`jobEntries.${index}.salary`, { required: 'Zarobki są wymagane' })}*/}
          {/*              placeholder="5000"*/}
          {/*              className="text-2xl font-bold px-4 py-3 border-b-4 outline-none transition-colors bg-transparent"*/}
          {/*              style={{*/}
          {/*                borderColor: watch(`jobEntries.${index}.salary`) ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)',*/}
          {/*                color: 'rgb(0, 65, 110)',*/}
          {/*                width: '250px'*/}
          {/*              }}*/}
          {/*            />*/}
          {/*          </div>*/}
          {/*          {errors.jobEntries?.[index]?.salary && (*/}
          {/*            <p className="text-red-500 mt-1 text-xs text-right mb-4">{errors.jobEntries[index]?.salary?.message}</p>*/}
          {/*          )}*/}

          {/*          /!* Year Row *!/*/}
          {/*          <div className="flex items-center gap-4 mb-4">*/}
          {/*            <label className="text-lg font-semibold flex items-center gap-2 flex-shrink-0" style={{ color: 'rgb(0, 65, 110)' }}>*/}
          {/*              <CalendarTodayIcon /> Rok rozpoczęcia:*/}
          {/*            </label>*/}
          {/*            <div className="flex-1"></div>*/}
          {/*            <input*/}
          {/*              type="number"*/}
          {/*              {...register(`jobEntries.${index}.year`, { required: 'Rok jest wymagany' })}*/}
          {/*              placeholder="2020"*/}
          {/*              className="text-2xl font-bold px-4 py-3 border-b-4 outline-none transition-colors bg-transparent"*/}
          {/*              style={{*/}
          {/*                borderColor: watch(`jobEntries.${index}.year`) ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)',*/}
          {/*                color: 'rgb(0, 65, 110)',*/}
          {/*                width: '250px'*/}
          {/*              }}*/}
          {/*            />*/}
          {/*          </div>*/}
          {/*          {errors.jobEntries?.[index]?.year && (*/}
          {/*            <p className="text-red-500 mt-1 text-xs text-right mb-4">{errors.jobEntries[index]?.year?.message}</p>*/}
          {/*          )}*/}

          {/*          /!* Remove Button *!/*/}
          {/*          {fields.length > 1 && (*/}
          {/*            <div className="flex justify-center mt-4">*/}
          {/*              <button*/}
          {/*                type="button"*/}
          {/*                onClick={() => remove(index)}*/}
          {/*                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"*/}
          {/*                style={{*/}
          {/*                  color: 'white',*/}
          {/*                  backgroundColor: 'rgb(240, 94, 94)'*/}
          {/*                }}*/}
          {/*                title="Usuń źródło dochodu"*/}
          {/*              >*/}
          {/*                <RemoveIcon />*/}
          {/*                <span>Usuń źródło dochodu</span>*/}
          {/*              </button>*/}
          {/*            </div>*/}
          {/*          )}*/}
          {/*        </div>*/}
          {/*      ))}*/}

          {/*      <button*/}
          {/*        type="button"*/}
          {/*        onClick={() => append({ salary: '', year: '' })}*/}
          {/*        className="w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white rounded-lg transition-all hover:opacity-90"*/}
          {/*        style={{ backgroundColor: 'rgb(63, 132, 210)' }}*/}
          {/*      >*/}
          {/*        <AddIcon />*/}
          {/*        <span>Dodaj źródło dochodu</span>*/}
          {/*      </button>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/* Submit Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              className="text-xl font-bold px-12 py-4 rounded-lg text-white transition-transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: 'rgb(0, 153, 63)' }}
            >
              Oblicz emeryturę
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetirementForm;
