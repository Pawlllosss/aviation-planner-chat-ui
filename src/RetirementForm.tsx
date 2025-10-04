import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect } from 'react';

interface JobEntry {
  salary: string;
  year: string;
}

interface FormData {
  age: string;
  gender: 'male' | 'female';
  retirementYear: string;
  jobEntries: JobEntry[];
}

const RetirementForm = () => {
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      age: '35',
      gender: 'male',
      retirementYear: '2060',
      jobEntries: [{ salary: '5747', year: '2021' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'jobEntries'
  });

  const age = watch('age');
  const gender = watch('gender');

  // Calculate default retirement year based on age and gender
  useEffect(() => {
    if (!age || !gender) return;

    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return;

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - ageNum;

    // Default retirement ages: male 65, female 60
    const retirementAge = gender === 'male' ? 65 : 60;
    const calculatedYear = (birthYear + retirementAge).toString();
    setValue('retirementYear', calculatedYear);
  }, [age, gender, setValue]);

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
            Oblicz swoją przyszłą emeryturę
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">
          {/* Age Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.5rem', marginBottom: '2rem', display: 'block' }}>
              Twój wiek
            </label>
            <input
              type="number"
              {...register('age', { required: 'Wiek jest wymagany' })}
              className="text-4xl font-bold text-center border-b-4 outline-none bg-transparent w-80 py-4 transition-colors"
              style={{ borderColor: age ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)' }}
            />
            {errors.age && <p className="text-red-500 mt-2">{errors.age.message}</p>}
          </div>

          {/* Gender Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.5rem', marginBottom: '2rem', display: 'block' }}>
              Płeć
            </label>
            <div className="flex gap-8 justify-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register('gender', { required: true })}
                  value="male"
                  className="w-6 h-6 mr-3"
                  style={{ accentColor: 'rgb(63, 132, 210)' }}
                />
                <span className="text-xl font-medium">Mężczyzna</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register('gender', { required: true })}
                  value="female"
                  className="w-6 h-6 mr-3"
                  style={{ accentColor: 'rgb(63, 132, 210)' }}
                />
                <span className="text-xl font-medium">Kobieta</span>
              </label>
            </div>
          </div>

          {/* Retirement Year */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: 'rgb(0, 65, 110)', fontWeight: '700', fontSize: '1.5rem', marginBottom: '2rem', display: 'block' }}>
              Planowany rok przejścia na emeryturę
            </label>
            <input
              type="number"
              {...register('retirementYear', { required: 'Rok przejścia na emeryturę jest wymagany' })}
              placeholder="2050"
              className="text-5xl font-bold text-center border-b-4 outline-none bg-transparent w-80 py-4 transition-colors"
              style={{ borderColor: watch('retirementYear') ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)' }}
            />
            {errors.retirementYear && <p className="text-red-500 mt-2">{errors.retirementYear.message}</p>}
          </div>

          {/* Job Entries Section */}
          <div className="pt-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'rgb(0, 65, 110)' }}>
                Historia zatrudnienia
              </h2>
              <p className="text-gray-600 text-lg">Dodaj swoje miejsca pracy, zaczynając od najnowszego</p>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-6 rounded-xl transition-all"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid rgb(190, 195, 206)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-bold" style={{ color: 'rgb(0, 65, 110)' }}>
                      Praca #{index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-base px-4 py-1 rounded-lg transition-colors"
                        style={{
                          color: 'rgb(240, 94, 94)',
                          backgroundColor: 'rgba(240, 94, 94, 0.1)',
                          fontWeight: '600'
                        }}
                      >
                        Usuń
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-base mb-3" style={{ color: 'rgb(0, 65, 110)', fontWeight: '700' }}>
                        Zarobki (zł/mies.)
                      </label>
                      <input
                        type="number"
                        {...register(`jobEntries.${index}.salary`, { required: 'Zarobki są wymagane' })}
                        className="w-full text-2xl font-bold border-b-4 outline-none bg-transparent py-3 transition-colors"
                        style={{ borderColor: watch(`jobEntries.${index}.salary`) ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)' }}
                      />
                      {errors.jobEntries?.[index]?.salary && (
                        <p className="text-red-500 mt-2 text-sm">{errors.jobEntries[index]?.salary?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-base mb-3" style={{ color: 'rgb(0, 65, 110)', fontWeight: '700' }}>
                        Rok rozpoczęcia
                      </label>
                      <input
                        type="number"
                        {...register(`jobEntries.${index}.year`, { required: 'Rok rozpoczęcia jest wymagany' })}
                        className="w-full text-2xl font-bold border-b-4 outline-none bg-transparent py-3 transition-colors"
                        style={{ borderColor: watch(`jobEntries.${index}.year`) ? 'rgb(0, 153, 63)' : 'rgb(190, 195, 206)' }}
                      />
                      {errors.jobEntries?.[index]?.year && (
                        <p className="text-red-500 mt-2 text-sm">{errors.jobEntries[index]?.year?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => append({ salary: '', year: '' })}
                  className="inline-flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white rounded-lg transition-transform hover:scale-105 shadow-md"
                  style={{ backgroundColor: 'rgb(63, 132, 210)' }}
                >
                  <span className="text-2xl">+</span>
                  <span>Dodaj kolejną pracę</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-8">
            <button
              type="submit"
              className="text-2xl font-bold px-16 py-5 rounded-lg text-white transition-transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: 'rgb(0, 153, 63)' }}
            >
              Oblicz emeryturę
            </button>
            <p className="mt-6 text-gray-600 text-lg">To zajmie tylko chwilę</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetirementForm;
