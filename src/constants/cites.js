const cities = [
  { value: 'Karachi', title: 'Karachi' },
  { value: 'Lahore', title: 'Lahore' },
  { value: 'Faisalabad', title: 'Faisalabad' },
  { value: 'Rawalpindi', title: 'Rawalpindi' },
  { value: 'Gujranwala', title: 'Gujranwala' },
  { value: 'Peshawar', title: 'Peshawar' },
  { value: 'Multan', title: 'Multan' },
  { value: 'Sialkot', title: 'Sialkot' },
  { value: 'Islamabad', title: 'Islamabad' },
  { value: 'Quetta', title: 'Quetta' },
  { value: 'Bahawalpur', title: 'Bahawalpur' },
  { value: 'Sargodha', title: 'Sargodha' },
  { value: 'Sukkur', title: 'Sukkur' },
  { value: 'Jhang', title: 'Jhang' },
  { value: 'Sheikhupura', title: 'Sheikhupura' },
  { value: 'Larkana', title: 'Larkana' },
  { value: 'Chiniot', title: 'Chiniot' },
  { value: 'Mardan', title: 'Mardan' },
  { value: 'Rahim Yar Khan', title: 'Rahim Yar Khan' },
  { value: 'Kasur', title: 'Kasur' },
  { value: 'Sahiwal', title: 'Sahiwal' },
  { value: 'Okara', title: 'Okara' },
  { value: 'Wah Cantonment', title: 'Wah Cantonment' },
  { value: 'Dera Ghazi Khan', title: 'Dera Ghazi Khan' },
  { value: 'Mingora', title: 'Mingora' },
  { value: 'Mirpur Khas', title: 'Mirpur Khas' },
  { value: 'Nawabshah', title: 'Nawabshah' },
  { value: 'Burewala', title: 'Burewala' },
  { value: 'Jhelum', title: 'Jhelum' },
  { value: 'Sadiqabad', title: 'Sadiqabad' },
  { value: 'Khanewal', title: 'Khanewal' },
  { value: 'Hafizabad', title: 'Hafizabad' },
  { value: 'Kohat', title: 'Kohat' },
  { value: 'Jacobabad', title: 'Jacobabad' },
  { value: 'Muzaffargarh', title: 'Muzaffargarh' },
  { value: 'Abbotabad', title: 'Abbotabad' },
  { value: 'Muridke', title: 'Muridke' },
  { value: 'Mansehra', title: 'Mansehra' },
  { value: 'Shikarpur', title: 'Shikarpur' },
  { value: 'Kot Addu', title: 'Kot Addu' },
  { value: 'Kambar', title: 'Kambar' },
  { value: 'Dera Ismail Khan', title: 'Dera Ismail Khan' },
  { value: 'Chishtian', title: 'Chishtian' },
  { value: 'Charsadda', title: 'Charsadda' },
  { value: 'Mandi Bahauddin', title: 'Mandi Bahauddin' },
  { value: 'Ahmadpur East', title: 'Ahmadpur East' },
  { value: 'Kamalia', title: 'Kamalia' },
  { value: 'Tando Adam', title: 'Tando Adam' },
  { value: 'Khairpur', title: 'Khairpur' },
  { value: 'Daska', title: 'Daska' },
  { value: 'Pakpattan', title: 'Pakpattan' },
  { value: 'Attock', title: 'Attock' },
  { value: 'Umerkot', title: 'Umerkot' },
  { value: 'Gwadar', title: 'Gwadar' },
  { value: 'Ali Pur', title: 'Ali Pur' },
  { value: 'Kamoke', title: 'Kamoke' },
  { value: 'Turbat', title: 'Turbat' },
  { value: 'Kotri', title: 'Kotri' },
  { value: 'Khushab', title: 'Khushab' },
  { value: 'Vihari', title: 'Vihari' },
  { value: 'Gojra', title: 'Gojra' },
  { value: 'Jaranwala', title: 'Jaranwala' },
  { value: 'Muzaffarabad', title: 'Muzaffarabad' },
  { value: 'Chitral', title: 'Chitral' },
  { value: 'Parachinar', title: 'Parachinar' },
  { value: 'Moro', title: 'Moro' },
  { value: 'Sanghar', title: 'Sanghar' },
  { value: 'Hangu', title: 'Hangu' },
  { value: 'Timargara', title: 'Timargara' },
  { value: 'Sibi', title: 'Sibi' },
  { value: 'Sangla Hill', title: 'Sangla Hill' },
  { value: 'Dadu', title: 'Dadu' },
  { value: 'Tando Allahyar', title: 'Tando Allahyar' },
  { value: 'Tando Muhammad Khan', title: 'Tando Muhammad Khan' },
  { value: 'Tank', title: 'Tank' },
  { value: 'Chaman', title: 'Chaman' },
  { value: 'Zhob', title: 'Zhob' },
  { value: 'Matiari', title: 'Matiari' },
  { value: 'Dipalpur', title: 'Dipalpur' },
  { value: 'Ghakhar Mandi', title: 'Ghakhar Mandi' },
  { value: 'Hub', title: 'Hub' },
  { value: 'Dera Allah Yar', title: 'Dera Allah Yar' },
  { value: 'Layyah', title: 'Layyah' },
  { value: 'Jatoi', title: 'Jatoi' },
  { value: 'Mailsi', title: 'Mailsi' },
  { value: 'Harnai', title: 'Harnai' },
  { value: 'Barkhan', title: 'Barkhan' },
  { value: 'Panjgur', title: 'Panjgur' },
  { value: 'Toba Tek Singh', title: 'Toba Tek Singh' },
  { value: 'Narowal', title: 'Narowal' },
  { value: 'Bhakkar', title: 'Bhakkar' },
  { value: 'Kotli', title: 'Kotli' },
  { value: 'Sialkot Cantonment', title: 'Sialkot Cantonment' },
];

const INVALID_CITY_VALUES = new Set([
  'pakistan',
  'paksitan',
  'all cities',
  'all city',
  'all pakistan',
]);

const cityLookup = new Map(
  cities.map((city) => [city.value.toLowerCase(), city.value])
);

/** Map messy stored values to a canonical city name, or empty if not a real city. */
export const resolveCityValue = (raw) => {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  const key = trimmed.toLowerCase();
  if (INVALID_CITY_VALUES.has(key)) return '';
  return cityLookup.get(key) || trimmed;
};

export const cityMatchesFilter = (itemCity, filterCity) => {
  if (!filterCity || filterCity === 'All') return true;
  const resolved = resolveCityValue(itemCity);
  return resolved.toLowerCase() === filterCity.toLowerCase();
};

export default cities;
