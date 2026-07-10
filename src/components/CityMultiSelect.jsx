import React, { useMemo, useState } from 'react';
import { X, MapPin } from 'lucide-react';
import cities, {
  ALL_CITIES_LABEL,
  parseInstallmentCities,
  serializeInstallmentCities,
} from '../constants/cites';

const CityMultiSelect = ({
  cityScope = 'all',
  cities: selectedCities = [],
  onChange,
  disabled = false,
  label = 'City / Cities *',
  className = '',
}) => {
  const [query, setQuery] = useState('');

  const parsed = useMemo(
    () => parseInstallmentCities({ cityScope, cities: selectedCities }),
    [cityScope, selectedCities]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((city) => city.title.toLowerCase().includes(q));
  }, [query]);

  const setScope = (scope) => {
    if (disabled) return;
    if (scope === 'all') {
      onChange(serializeInstallmentCities('all', []));
      return;
    }
    if (!selectedCities || selectedCities.length === 0) {
      onChange({ city: '', cities: [], cityScope: 'selected' });
      return;
    }
    onChange(serializeInstallmentCities('selected', selectedCities));
  };

  const toggleCity = (cityValue) => {
    if (disabled) return;
    const set = new Set(selectedCities || []);
    if (set.has(cityValue)) set.delete(cityValue);
    else set.add(cityValue);
    onChange(serializeInstallmentCities('selected', Array.from(set)));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-800">{label}</label>}

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-500">City scope</label>
        <select
          value={cityScope}
          disabled={disabled}
          onChange={(e) => setScope(e.target.value)}
          className="select-brand"
        >
          <option value="all">{ALL_CITIES_LABEL}</option>
          <option value="selected">Select Cities</option>
        </select>
      </div>

      {disabled ? (
        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600">
          <MapPin className="inline w-4 h-4 mr-1.5 -mt-0.5 text-red-600" />
          {parsed.display}
        </div>
      ) : cityScope === 'all' ? (
        <p className="text-sm text-gray-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          This plan will be shown for customers in <strong className="text-red-700">all cities</strong> across Pakistan.
        </p>
      ) : (
        <div className="border border-red-100 rounded-xl overflow-hidden bg-white">
          <div className="p-3 border-b border-red-50">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cities..."
              className="input-brand"
            />
          </div>

          {selectedCities.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border-b border-red-50 bg-red-50/60">
              {selectedCities.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-red-200 text-red-700 rounded-full text-xs font-medium"
                >
                  {city}
                  <button
                    type="button"
                    onClick={() => toggleCity(city)}
                    className="hover:text-red-900"
                    aria-label={`Remove ${city}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <ul className="max-h-52 overflow-auto divide-y divide-red-50">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">No city found</li>
            ) : (
              filtered.map((city) => {
                const checked = selectedCities.includes(city.value);
                return (
                  <li key={city.value}>
                    <button
                      type="button"
                      onClick={() => toggleCity(city.value)}
                      className={`w-full px-4 py-2.5 text-sm text-left hover:bg-red-50 ${
                        checked ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-800'
                      }`}
                    >
                      {city.title}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {selectedCities.length === 0 && (
            <p className="px-4 py-3 text-xs text-red-700 bg-red-50 border-t border-red-100">
              Select at least one city, or switch to {ALL_CITIES_LABEL}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CityMultiSelect;
