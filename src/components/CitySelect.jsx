import React, { useEffect, useMemo, useRef, useState } from 'react';
import cities from '../constants/cites';

const CitySelect = ({
  label = 'City *',
  value = '',
  onChange,
  disabled = false,
  placeholder = 'Select City',
  className = '',
  allowLegacyValue = false,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const selectedCity = useMemo(
    () => cities.find((city) => city.value === value),
    [value]
  );

  const isLegacyValue =
    allowLegacyValue && value && !cities.some((city) => city.value === value);

  useEffect(() => {
    if (selectedCity) {
      setQuery(selectedCity.title);
    } else if (isLegacyValue) {
      setQuery(value);
    } else if (!value) {
      setQuery('');
    }
  }, [value, selectedCity, isLegacyValue]);

  const filteredCities = useMemo(() => {
    const q = query.trim().toLowerCase();
    const labelSelected = selectedCity && query === selectedCity.title;
    if (!q || labelSelected) return cities;
    return cities.filter((city) => city.title.toLowerCase().includes(q));
  }, [query, selectedCity]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        if (selectedCity) {
          setQuery(selectedCity.title);
        } else if (!value) {
          setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [selectedCity, value]);

  const handleSelect = (cityValue) => {
    onChange(cityValue);
    const city = cities.find((c) => c.value === cityValue);
    setQuery(city ? city.title : '');
    setOpen(false);
  };

  return (
    <div className={`space-y-2 ${className}`} ref={wrapRef}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {disabled ? (
        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed">
          {selectedCity?.title || value || placeholder}
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (!e.target.value.trim()) onChange('');
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
            autoComplete="off"
          />

          {open && (
            <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {isLegacyValue && (
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelect(value)}
                    className="w-full px-4 py-2.5 text-left text-sm text-amber-700 hover:bg-amber-50 font-medium"
                  >
                    {value} (please update)
                  </button>
                </li>
              )}

              {filteredCities.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500">No city found</li>
              ) : (
                filteredCities.map((city) => (
                  <li key={city.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(city.value)}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 ${
                        value === city.value ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-800'
                      }`}
                    >
                      {city.title}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CitySelect;
