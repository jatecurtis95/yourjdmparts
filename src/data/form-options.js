/** Option lists shared by the order and request forms. */

export const AU_STATES = [
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NSW', label: 'New South Wales' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'WA', label: 'Western Australia' },
];

export const MAKES = [
  'Toyota',
  'Nissan',
  'Honda',
  'Mazda',
  'Mitsubishi',
  'Subaru',
  'Suzuki',
  'Daihatsu',
  'Lexus',
  'Isuzu',
].map((m) => ({ value: m, label: m }));

MAKES.push({ value: 'Other', label: 'Other — tell us below' });

export const TRANSMISSIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'sequential', label: 'Sequential or dual clutch' },
  { value: 'unknown', label: 'Not sure' },
];

export const DRIVETRAINS = [
  { value: 'rwd', label: 'Rear-wheel drive' },
  { value: 'fwd', label: 'Front-wheel drive' },
  { value: 'awd', label: 'All-wheel drive' },
  { value: 'unknown', label: 'Not sure' },
];

export const BODY_STYLES = [
  { value: 'coupe', label: 'Coupe' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatch', label: 'Hatchback' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'ute', label: 'Ute or van' },
];

export const ACCEPTABLE_CONDITIONS = [
  { value: 'any', label: 'Any condition — price matters most' },
  { value: 'good', label: 'Good or better' },
  { value: 'excellent', label: 'Excellent only' },
  { value: 'repairable', label: 'Will take repairable or spares' },
];

export const URGENCY = [
  { value: 'no-rush', label: 'No rush — take the time to find a good one' },
  { value: 'month', label: 'Within a month' },
  { value: 'off-road', label: 'The car is off the road' },
];

export const HEARD_FROM = [
  { value: 'search', label: 'Search engine' },
  { value: 'workshop', label: 'My workshop or mechanic' },
  { value: 'friend', label: 'Word of mouth' },
  { value: 'jdm-connect', label: 'JDM Connect' },
  { value: 'social', label: 'Social media' },
  { value: 'other', label: 'Somewhere else' },
];
