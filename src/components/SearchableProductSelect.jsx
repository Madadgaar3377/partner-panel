import React, { useState, useRef, useEffect, useMemo } from 'react';

export const getInstallmentProductId = (p) =>
  String(p?.installmentPlanId || p?._id || '');

export const getInstallmentProductLabel = (p) => {
  if (!p) return '';
  const name = p.productName || 'Unnamed product';
  const brand = p.companyName ? ` · ${p.companyName}` : '';
  const city = p.city ? ` · ${p.city}` : '';
  const price =
    p.price != null && p.price !== ''
      ? ` — PKR ${Number(p.price).toLocaleString()}`
      : '';
  const id = getInstallmentProductId(p);
  return `${name}${brand}${city}${price}${id ? ` (${id})` : ''}`;
};

const SearchableProductSelect = ({
  products = [],
  value = '',
  onChange,
  placeholder = 'Type to search products (e.g. Samsung, Lahore)...',
  createNewLabel = '-- Create new product from scratch --',
  className = '',
  inputClassName = '',
  maxResults = 60,
  getProductId = getInstallmentProductId,
  getProductLabel = getInstallmentProductLabel,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const selected = useMemo(
    () => products.find((p) => getProductId(p) === value),
    [products, value, getProductId]
  );

  useEffect(() => {
    if (selected) {
      setQuery(getProductLabel(selected));
    } else if (!value) {
      setQuery('');
    }
  }, [value, selected, getProductLabel]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const labelSelected = selected && query === getProductLabel(selected);
    if (!q || labelSelected) {
      return products.slice(0, maxResults);
    }
    return products
      .filter((p) => {
        const hay = [
          p.productName,
          p.companyName,
          p.companyNameOther,
          p.city,
          p.category,
          p.description,
          getProductId(p),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, maxResults);
  }, [products, query, selected, maxResults, getProductId, getProductLabel]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (id) => {
    onChange(id);
    if (!id) {
      setQuery('');
    } else {
      const p = products.find((x) => getProductId(x) === id);
      if (p) setQuery(getProductLabel(p));
    }
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    setOpen(true);
    if (value) {
      onChange('');
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={
            inputClassName ||
            'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-20'
          }
        />
        {value ? (
          <button
            type="button"
            onClick={() => pick('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 hover:text-red-600"
          >
            Clear
          </button>
        ) : (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            ⌕
          </span>
        )}
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm">
          <li>
            <button
              type="button"
              onClick={() => pick('')}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 font-medium text-blue-800 border-b border-gray-100"
            >
              {createNewLabel}
            </button>
          </li>
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-gray-500 text-center">No products match your search</li>
          ) : (
            filtered.map((p) => {
              const id = getProductId(p);
              const active = id === value;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => pick(id)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 ${
                      active ? 'bg-blue-100 font-semibold text-blue-900' : 'text-gray-800'
                    }`}
                  >
                    {getProductLabel(p)}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableProductSelect;
