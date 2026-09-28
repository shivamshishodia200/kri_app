export interface StateLocation {
  name: string;
  code: string;
  cities: CityLocation[];
}

export interface CityLocation {
  name: string;
  localities: string[];
}

export const INDIAN_LOCATIONS: StateLocation[] = [
  {
    name: 'Delhi NCR',
    code: 'DL',
    cities: [
      {
        name: 'New Delhi',
        localities: [
          'Connaught Place',
          'South Extension',
          'Hauz Khas',
          'Lajpat Nagar',
          'Saket',
          'Dwarka',
          'Rohini',
          'Vasant Kunj',
          'Karol Bagh',
          'Mayur Vihar',
          'Janakpuri',
          'Pitampura',
          'Greater Kailash',
          'Nehru Place',
          'Uttam Nagar',
        ],
      },
      {
        name: 'Noida',
        localities: [
          'Sector 18',
          'Sector 62',
          'Sector 137',
          'Sector 76',
          'Sector 150',
          'Sector 50',
          'Sector 128',
          'Sector 44',
          'Sector 15',
          'Sector 78',
          'Noida Expressway',
        ],
      },
      {
        name: 'Greater Noida',
        localities: [
          'Knowledge Park',
          'Pari Chowk',
          'Alpha 1',
          'Beta 1',
          'Techzone 4',
          'Greater Noida West (Noida Extension)',
          'Omega 1',
        ],
      },
      {
        name: 'Gurugram',
        localities: [
          'Cyber City',
          'Golf Course Road',
          'Golf Course Ext Road',
          'Sohna Road',
          'DLF Phase 1-5',
          'Sector 56',
          'Sector 57',
          'Sector 48',
          'Sector 23',
          'MG Road',
          'Palam Vihar',
        ],
      },
      {
        name: 'Ghaziabad',
        localities: [
          'Indirapuram',
          'Vaishali',
          'Vasundhara',
          'Raj Nagar Extension',
          'Crossings Republik',
          'Kaushambi',
        ],
      },
      {
        name: 'Faridabad',
        localities: [
          'Sector 15',
          'Sector 16',
          'Sector 21C',
          'Greenfield Colony',
          'Neharpar',
          'Surajkund',
        ],
      },
    ],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    cities: [
      {
        name: 'Lucknow',
        localities: [
          'Gomti Nagar',
          'Hazratganj',
          'Aliganj',
          'Indira Nagar',
          'Mahanagar',
          'Janki Puram',
          'Vikas Nagar',
          'Ashiyana',
          'Sushant Golf City',
        ],
      },
      {
        name: 'Kanpur',
        localities: [
          'Swaroop Nagar',
          'Civil Lines',
          'Kakadeo',
          'Kalyanpur',
          'Kidwai Nagar',
          'Sharda Nagar',
        ],
      },
      {
        name: 'Varanasi',
        localities: [
          'Lanka',
          'Sigra',
          'Mahmoorganj',
          'Orderly Bazar',
          'Cantt',
          'Bhelupur',
        ],
      },
      {
        name: 'Prayagraj',
        localities: [
          'Civil Lines',
          'George Town',
          'Katra',
          'Tagore Town',
          'Allapur',
        ],
      },
      {
        name: 'Agra',
        localities: [
          'Sanjay Place',
          'Fatehabad Road',
          'Kamla Nagar',
          'Dayal Bagh',
          'Civil Lines',
        ],
      },
      {
        name: 'Meerut',
        localities: [
          'Shastri Nagar',
          'Ganga Nagar',
          'Modipuram',
          'Civil Lines',
          'Sadar Bazar',
        ],
      },
    ],
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    cities: [
      {
        name: 'Mumbai',
        localities: [
          'Andheri West',
          'Andheri East',
          'Bandra West',
          'Bandra East',
          'Juhu',
          'Powai',
          'Goregaon',
          'Kandivali',
          'Borivali',
          'Dadar',
          'Lower Parel',
          'Worli',
          'Thane West',
          'Navi Mumbai - Vashi',
        ],
      },
      {
        name: 'Pune',
        localities: [
          'Hinjawadi',
          'Kothrud',
          'Viman Nagar',
          'Baner',
          'Wakad',
          'Kalyani Nagar',
          'Hadapsar (Magarpatta)',
          'Aundh',
          'Kharadi',
          'Pimple Saudagar',
        ],
      },
      {
        name: 'Nagpur',
        localities: [
          'Dharampeth',
          'Ramdaspeth',
          'Civil Lines',
          'Pratap Nagar',
          'Wardha Road',
        ],
      },
    ],
  },
  {
    name: 'Karnataka',
    code: 'KA',
    cities: [
      {
        name: 'Bengaluru',
        localities: [
          'Koramangala',
          'Indiranagar',
          'HSR Layout',
          'Whitefield',
          'Electronic City',
          'Marathahalli',
          'Bellandur',
          'JP Nagar',
          'BTM Layout',
          'Hebbal',
          'Yelahanka',
          'Sarjapur Road',
        ],
      },
      {
        name: 'Mysuru',
        localities: [
          'Gokulam',
          'Jayalakshmipuram',
          'Vijayanagar',
          'Saraswathipuram',
          'Hebbal 1st Stage',
        ],
      },
    ],
  },
  {
    name: 'Haryana',
    code: 'HR',
    cities: [
      {
        name: 'Gurugram',
        localities: [
          'Cyber City',
          'Golf Course Road',
          'Golf Course Ext Road',
          'Sohna Road',
          'DLF Phase 1-5',
          'Sector 56',
          'Sector 57',
        ],
      },
      {
        name: 'Faridabad',
        localities: [
          'Sector 15',
          'Sector 16',
          'Sector 21C',
          'Greenfield Colony',
        ],
      },
      {
        name: 'Panchkula',
        localities: ['Sector 4', 'Sector 7', 'Sector 9', 'Sector 20', 'MDC'],
      },
      {
        name: 'Karnal',
        localities: ['Model Town', 'Sector 13', 'Sector 14', 'Sector 6'],
      },
    ],
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    cities: [
      {
        name: 'Jaipur',
        localities: [
          'Malviya Nagar',
          'Vaishali Nagar',
          'Mansarovar',
          'C-Scheme',
          'Raja Park',
          'Jagatpura',
          'Tonk Road',
        ],
      },
      {
        name: 'Kota',
        localities: [
          'Talwandi',
          'Vigyan Nagar',
          'Indraprastha Industrial Area',
          'Mahaveer Nagar',
          'Dadabari',
        ],
      },
      {
        name: 'Udaipur',
        localities: ['Fatehpura', 'Hiran Magri', 'Saheli Nagar', 'Shobhagpura'],
      },
    ],
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    cities: [
      {
        name: 'Dehradun',
        localities: [
          'Rajpur Road',
          'Dalanwala',
          'Vasant Vihar',
          'Sahastradhara Road',
          'Chakrata Road',
          'Clement Town',
        ],
      },
      {
        name: 'Haridwar',
        localities: ['Ranipur', 'Kankhal', 'Shivalik Nagar', 'Jwalapur'],
      },
      {
        name: 'Rishikesh',
        localities: ['Tapovan', 'Muni Ki Reti', 'Awas Vikas Colony', 'AIIMS Road'],
      },
    ],
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    cities: [
      {
        name: 'Indore',
        localities: [
          'Vijay Nagar',
          'Palasia',
          'AB Road',
          'Bhawarkua',
          'Rajendra Nagar',
          'Super Corridor',
        ],
      },
      {
        name: 'Bhopal',
        localities: [
          'Arera Colony',
          'MP Nagar',
          'Kolar Road',
          'Hoshangabad Road',
          'Shahpura',
        ],
      },
    ],
  },
  {
    name: 'Punjab',
    code: 'PB',
    cities: [
      {
        name: 'Chandigarh / Mohali',
        localities: [
          'Sector 35',
          'Sector 17',
          'Sector 22',
          'Phase 7 Mohali',
          'Phase 3B2 Mohali',
          'Sector 70 Mohali',
          'Zirakpur VIP Road',
        ],
      },
      {
        name: 'Ludhiana',
        localities: ['Model Town', 'Sarabha Nagar', 'BRS Nagar', 'Civil Lines'],
      },
    ],
  },
];

export function getIndianStates(): string[] {
  return INDIAN_LOCATIONS.map((s) => s.name);
}

export function getCitiesForState(stateName: string): string[] {
  if (!stateName) return [];
  const found = INDIAN_LOCATIONS.find(
    (s) => s.name.toLowerCase() === stateName.trim().toLowerCase(),
  );
  if (!found) return [];
  return found.cities.map((c) => c.name);
}

export function getLocalitiesForCity(
  cityName: string,
  stateName?: string,
): string[] {
  if (!cityName) return [];
  const normalizedCity = cityName.trim().toLowerCase();

  if (stateName) {
    const stateFound = INDIAN_LOCATIONS.find(
      (s) => s.name.toLowerCase() === stateName.trim().toLowerCase(),
    );
    if (stateFound) {
      const cityFound = stateFound.cities.find(
        (c) => c.name.toLowerCase() === normalizedCity,
      );
      if (cityFound) return cityFound.localities;
    }
  }

  // Fallback: search across all states if state not provided or not matched
  for (const s of INDIAN_LOCATIONS) {
    const cityFound = s.cities.find(
      (c) => c.name.toLowerCase() === normalizedCity,
    );
    if (cityFound) {
      return cityFound.localities;
    }
  }

  return [];
}
