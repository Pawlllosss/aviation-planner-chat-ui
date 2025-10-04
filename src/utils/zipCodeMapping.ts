export interface VoivodeshipData {
  name: string;
  code: string;
  count: number;
  percentage: number;
}

// Mapping of zip code prefixes (first 2 digits) to voivodeships
const zipCodeToVoivodeship: { [key: string]: string } = {
  // Dolnośląskie
  '50': 'dolnoslaskie', '51': 'dolnoslaskie', '52': 'dolnoslaskie',
  '53': 'dolnoslaskie', '54': 'dolnoslaskie', '55': 'dolnoslaskie',
  '56': 'dolnoslaskie', '57': 'dolnoslaskie', '58': 'dolnoslaskie',
  '59': 'dolnoslaskie',

  // Kujawsko-Pomorskie
  '85': 'kujawsko-pomorskie', '86': 'kujawsko-pomorskie',
  '87': 'kujawsko-pomorskie', '88': 'kujawsko-pomorskie',

  // Lubelskie
  '20': 'lubelskie', '21': 'lubelskie', '22': 'lubelskie', '23': 'lubelskie',

  // Lubuskie
  '65': 'lubuskie', '66': 'lubuskie', '67': 'lubuskie', '68': 'lubuskie',
  '69': 'lubuskie',

  // Łódzkie
  '90': 'lodzkie', '91': 'lodzkie', '92': 'lodzkie', '93': 'lodzkie',
  '94': 'lodzkie', '95': 'lodzkie', '96': 'lodzkie', '97': 'lodzkie',
  '98': 'lodzkie', '99': 'lodzkie',

  // Małopolskie
  '30': 'malopolskie', '31': 'malopolskie', '32': 'malopolskie',
  '33': 'malopolskie', '34': 'malopolskie',

  // Mazowieckie
  '00': 'mazowieckie', '01': 'mazowieckie', '02': 'mazowieckie',
  '03': 'mazowieckie', '04': 'mazowieckie', '05': 'mazowieckie',
  '06': 'mazowieckie', '07': 'mazowieckie', '08': 'mazowieckie',
  '09': 'mazowieckie', '10': 'mazowieckie', '11': 'mazowieckie',
  '12': 'mazowieckie', '13': 'mazowieckie', '14': 'mazowieckie',
  '15': 'mazowieckie', '16': 'mazowieckie', '17': 'mazowieckie',
  '18': 'mazowieckie', '19': 'mazowieckie', '26': 'mazowieckie',
  '27': 'mazowieckie',

  // Opolskie
  '45': 'opolskie', '46': 'opolskie', '47': 'opolskie', '48': 'opolskie',
  '49': 'opolskie',

  // Podkarpackie
  '35': 'podkarpackie', '36': 'podkarpackie', '37': 'podkarpackie',
  '38': 'podkarpackie', '39': 'podkarpackie',

  // Podlaskie
  '15': 'podlaskie', '16': 'podlaskie', '17': 'podlaskie', '18': 'podlaskie',
  '19': 'podlaskie',

  // Pomorskie
  '80': 'pomorskie', '81': 'pomorskie', '82': 'pomorskie', '83': 'pomorskie',
  '84': 'pomorskie',

  // Śląskie
  '40': 'slaskie', '41': 'slaskie', '42': 'slaskie', '43': 'slaskie',
  '44': 'slaskie',

  // Świętokrzyskie
  '25': 'swietokrzyskie', '26': 'swietokrzyskie', '27': 'swietokrzyskie',
  '28': 'swietokrzyskie', '29': 'swietokrzyskie',

  // Warmińsko-Mazurskie
  '10': 'warminsko-mazurskie', '11': 'warminsko-mazurskie',
  '12': 'warminsko-mazurskie', '13': 'warminsko-mazurskie',
  '14': 'warminsko-mazurskie', '19': 'warminsko-mazurskie',

  // Wielkopolskie
  '60': 'wielkopolskie', '61': 'wielkopolskie', '62': 'wielkopolskie',
  '63': 'wielkopolskie', '64': 'wielkopolskie',

  // Zachodniopomorskie
  '70': 'zachodniopomorskie', '71': 'zachodniopomorskie',
  '72': 'zachodniopomorskie', '73': 'zachodniopomorskie',
  '74': 'zachodniopomorskie', '75': 'zachodniopomorskie',
  '76': 'zachodniopomorskie', '77': 'zachodniopomorskie',
  '78': 'zachodniopomorskie',
};

const voivodeshipNames: { [key: string]: string } = {
  'dolnoslaskie': 'Dolnośląskie',
  'kujawsko-pomorskie': 'Kujawsko-Pomorskie',
  'lubelskie': 'Lubelskie',
  'lubuskie': 'Lubuskie',
  'lodzkie': 'Łódzkie',
  'malopolskie': 'Małopolskie',
  'mazowieckie': 'Mazowieckie',
  'opolskie': 'Opolskie',
  'podkarpackie': 'Podkarpackie',
  'podlaskie': 'Podlaskie',
  'pomorskie': 'Pomorskie',
  'slaskie': 'Śląskie',
  'swietokrzyskie': 'Świętokrzyskie',
  'warminsko-mazurskie': 'Warmińsko-Mazurskie',
  'wielkopolskie': 'Wielkopolskie',
  'zachodniopomorskie': 'Zachodniopomorskie',
};

export function getVoivodeshipFromZipCode(zipCode: string): string | null {
  if (!zipCode || zipCode.length < 2) return null;
  const prefix = zipCode.substring(0, 2);
  return zipCodeToVoivodeship[prefix] || null;
}

export function getVoivodeshipDisplayName(code: string): string {
  return voivodeshipNames[code] || code;
}

export function calculateVoivodeshipStats(zipCodes: (string | undefined)[]): VoivodeshipData[] {
  const voivodeshipCounts: { [key: string]: number } = {};
  let totalWithZipCode = 0;

  // Count occurrences per voivodeship
  zipCodes.forEach(zipCode => {
    if (!zipCode) return;
    const voivodeship = getVoivodeshipFromZipCode(zipCode);
    if (voivodeship) {
      voivodeshipCounts[voivodeship] = (voivodeshipCounts[voivodeship] || 0) + 1;
      totalWithZipCode++;
    }
  });

  // Convert to array with percentages
  const stats: VoivodeshipData[] = Object.entries(voivodeshipCounts).map(([code, count]) => ({
    name: getVoivodeshipDisplayName(code),
    code,
    count,
    percentage: totalWithZipCode > 0 ? (count / totalWithZipCode) * 100 : 0,
  }));

  // Sort by count descending
  stats.sort((a, b) => b.count - a.count);

  return stats;
}

export const allVoivodeships = Object.keys(voivodeshipNames);
