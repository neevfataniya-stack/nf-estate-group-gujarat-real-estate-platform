export const GUJARAT_STATE = 'Gujarat';

export interface GujaratCityData {
  name: string;
  localities: string[];
}

export const GUJARAT_CITIES: GujaratCityData[] = [
  {
    name: 'Ahmedabad',
    localities: [
      'Satellite',
      'Bopal',
      'South Bopal',
      'Gota',
      'Thaltej',
      'SG Highway',
      'Bodakdev',
      'Prahlad Nagar',
      'Vastrapur',
      'Chandkheda',
      'Shela',
      'Sindhu Bhavan Road',
      'Navrangpura',
      'Maninagar',
      'Science City Road',
      'Vaishno Devi Circle',
    ],
  },
  {
    name: 'Surat',
    localities: [
      'Vesu',
      'Adajan',
      'Pal',
      'Piplod',
      'Varachha',
      'Althan',
      'VIP Road',
      'City Light',
      'Dumas Road',
      'Katargam',
      'Jahangirpura',
      'Dindoli',
    ],
  },
  {
    name: 'Vadodara',
    localities: [
      'Alkapuri',
      'Gotri',
      'Vasna Road',
      'Manjalpur',
      'Akota',
      'Karelibaug',
      'Sama',
      'Subhanpura',
      'Waghodia Road',
      'Sevasi',
      'Bhayli',
      'Fatehgunj',
    ],
  },
  {
    name: 'Rajkot',
    localities: [
      'Kalawad Road',
      'University Road',
      '150 Feet Ring Road',
      'Nana Mava',
      'Yagnik Road',
      'Madhapar',
      'Raiya Road',
      'Kothariya',
      'Mota Mava',
    ],
  },
  {
    name: 'Gandhinagar',
    localities: [
      'GIFT City',
      'Kudasan',
      'Raysan',
      'Sargasan',
      'Infocity',
      'Randesan',
      'Sector 1-10',
      'Sector 11-20',
      'Sector 21-30',
      'Koba',
      'Vavol',
    ],
  },
  {
    name: 'Bhavnagar',
    localities: [
      'Kaliyabid',
      'Waghawadi Road',
      'Ghogha Circle',
      'Subhashnagar',
      'Hill Drive',
      'Chitra GIDC',
    ],
  },
  {
    name: 'Jamnagar',
    localities: [
      'Patel Colony',
      'Digvijay Plot',
      'Indira Marg',
      'Park Colony',
      'Khambhalia Road',
      'GIDC Phase 2',
    ],
  },
  {
    name: 'Junagadh',
    localities: [
      'Zanzarda Road',
      'Motibaug',
      'Joshipura',
      'Bilkha Road',
      'Timbavadi',
    ],
  },
  {
    name: 'Anand',
    localities: [
      'Vallabh Vidyanagar',
      'Nana Bazar',
      'Anand-Vidyanagar Road',
      'Bakrol',
      'Borsad Road',
      'GIDC Estate',
    ],
  },
  {
    name: 'Nadiad',
    localities: [
      'College Road',
      'Santram Road',
      'Uttarsanda Road',
      'Piplag',
      'Mission Area',
    ],
  },
  {
    name: 'Bharuch',
    localities: [
      'Zadeshwar Road',
      'GNFC Township',
      'Link Road',
      'Shravan Chokdi',
      'Dahej Bypass Road',
      'Bholav',
    ],
  },
  {
    name: 'Ankleshwar',
    localities: [
      'GIDC Industrial Estate',
      'Station Road',
      'Valia Road',
      'Hansot Road',
      'Old Town',
    ],
  },
  {
    name: 'Vapi',
    localities: [
      'Chala',
      'Gunjan',
      'Koparli Road',
      'GIDC Industrial Belt',
      'Chanod Colony',
      'Daman Road',
    ],
  },
  {
    name: 'Navsari',
    localities: [
      'Lunsikui',
      'Fuwara',
      'Grid Road',
      'Eru Char Rasta',
      'Gandevi Road',
    ],
  },
  {
    name: 'Mehsana',
    localities: [
      'Modhera Road',
      'Radhanpur Road',
      'Nagalpur',
      'Visnagar Road',
      'GIDC Phase 1',
    ],
  },
  {
    name: 'Morbi',
    localities: [
      'Ravapar Road',
      'Sanala Road',
      'Ceramic Industrial Zone',
      'Trajpar',
      'Kandla Highway',
    ],
  },
  {
    name: 'Porbandar',
    localities: [
      'MG Road',
      'Birla Colony',
      'Chhaya',
      'Khapat',
      'Airport Road',
    ],
  },
  {
    name: 'Surendranagar',
    localities: [
      'Wadhwan',
      'Dudhrej',
      'Ratanpar',
      '80 Feet Road',
      'Bus Stand Road',
    ],
  },
  {
    name: 'Gandhidham',
    localities: [
      'Sector 1-5',
      'Oslo',
      'DC-5',
      'Shinay',
      'Kandla Port Road',
    ],
  },
  {
    name: 'Bhuj',
    localities: [
      'Mirzapar Road',
      'College Road',
      'Madhapar',
      'Station Road',
      'Mundra Road',
    ],
  },
];

export function getLocalitiesForCity(cityName: string): string[] {
  const city = GUJARAT_CITIES.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );
  return city ? city.localities : [];
}

export function isValidGujaratCity(cityName: string): boolean {
  return GUJARAT_CITIES.some(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );
}

export function isValidGujaratLocation(cityName: string, localityName: string): boolean {
  if (!isValidGujaratCity(cityName)) return false;
  if (!localityName || localityName === 'All Areas') return true;
  const localities = getLocalitiesForCity(cityName);
  return localities.some(
    (l) => l.toLowerCase() === localityName.toLowerCase()
  );
}

// Format Rupee Budget helper
export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const BUDGET_OPTIONS = [
  { label: 'Any Budget', value: null },
  { label: '₹10 Lakh', value: 1000000 },
  { label: '₹25 Lakh', value: 2500000 },
  { label: '₹50 Lakh', value: 5000000 },
  { label: '₹75 Lakh', value: 7500000 },
  { label: '₹1 Crore', value: 10000000 },
  { label: '₹2 Crore', value: 20000000 },
  { label: '₹5 Crore', value: 50000000 },
  { label: '₹10 Crore', value: 100000000 },
  { label: '₹25 Crore+', value: 250000000 },
];
