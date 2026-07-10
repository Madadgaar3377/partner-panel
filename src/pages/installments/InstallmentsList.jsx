import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  MapPin,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { PageLoader } from '../../components/Loader';
import baseApi from '../../constants/apiUrl';
import cities, { installmentMatchesCityFilter, formatInstallmentCityDisplay } from '../../constants/cites';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import InstallmentStatusBadges from '../../components/installment/InstallmentStatusBadges';
import {
  LIST_STATUS_FILTER_OPTIONS,
  countByStatusFilter,
  matchesInstallmentStatusFilter,
} from '../../utils/installmentStatus';

const CATEGORY_LABELS = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c.value, c.label])
);

const formatCategory = (value) => {
  if (!value) return '';
  return CATEGORY_LABELS[value] || value.replace(/_/g, ' ');
};

const isOwnerListing = (item) =>
  item.isProductOwner !== false && item.partnerRole !== 'contributor';

const getCreatorLabel = (item) => {
  if (isOwnerListing(item)) {
    return (
      item.companyName ||
      item.companyNameOther ||
      item.createdBy?.[0]?.name ||
      item.postedBy ||
      'You'
    );
  }
  return (
    item.ownerCompanyName ||
    item.companyName ||
    item.createdBy?.[0]?.name ||
    'Unknown'
  );
};

const getSearchBlob = (item) => {
  const parts = [
    item.productName,
    item.installmentPlanId,
    item._id,
    item.category,
    item.customCategory,
    item.city,
    ...(Array.isArray(item.cities) ? item.cities : []),
    item.companyName,
    item.companyNameOther,
    item.ownerCompanyName,
    item.description,
    item.postedBy,
    item.createdBy?.[0]?.name,
    item.createdBy?.[0]?.userId,
    item.createdBy?.[0]?.email,
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
};

const InstallmentsList = () => {
  const navigate = useNavigate();
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterListingType, setFilterListingType] = useState('All');
  const [filterCreator, setFilterCreator] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);

  const fetchInstallments = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');

      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${baseApi}/getAllCreateInstallnment`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const rows = (data.data || []).filter((item) => item.status !== 'deleted');
        setInstallments(rows);
      } else {
        setError(data.message || 'Failed to fetch installments');
      }
    } catch (err) {
      console.error('Fetch installments error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      navigate('/');
      return;
    }

    fetchInstallments();
  }, [navigate, fetchInstallments]);

  const filterOptions = useMemo(() => {
    const categories = new Set();
    const creators = new Set();

    installments.forEach((item) => {
      const cat = item.category || item.customCategory;
      if (cat) categories.add(cat);
      creators.add(getCreatorLabel(item));
    });

    return {
      categories: Array.from(categories).sort(),
      creators: Array.from(creators).sort(),
    };
  }, [installments]);

  const statusCounts = useMemo(
    () => ({
      in_stock: countByStatusFilter(installments, 'in_stock'),
      out_of_stock: countByStatusFilter(installments, 'out_of_stock'),
      approved: countByStatusFilter(installments, 'approved'),
      pending: countByStatusFilter(installments, 'pending'),
      drafted: countByStatusFilter(installments, 'drafted'),
    }),
    [installments]
  );

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    filterCategory !== 'All' ||
    filterCity !== 'All' ||
    filterStatus !== 'All' ||
    filterListingType !== 'All' ||
    filterCreator !== 'All' ||
    sortBy !== 'newest';

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('All');
    setFilterCity('All');
    setFilterStatus('All');
    setFilterListingType('All');
    setFilterCreator('All');
    setSortBy('newest');
  };

  const filteredInstallments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    let rows = installments.filter((item) => {
      if (q && !getSearchBlob(item).includes(q)) return false;

      const cat = item.category || item.customCategory || '';
      if (filterCategory !== 'All' && cat !== filterCategory) return false;

      if (!installmentMatchesCityFilter(item, filterCity)) return false;

      if (!matchesInstallmentStatusFilter(item, filterStatus)) return false;

      if (filterListingType === 'owner' && !isOwnerListing(item)) return false;
      if (filterListingType === 'shared' && isOwnerListing(item)) return false;

      if (filterCreator !== 'All' && getCreatorLabel(item) !== filterCreator) return false;

      return true;
    });

    rows = [...rows].sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'name') {
        return (a.productName || '').localeCompare(b.productName || '');
      }
      if (sortBy === 'price_high') {
        return Number(b.price || 0) - Number(a.price || 0);
      }
      if (sortBy === 'price_low') {
        return Number(a.price || 0) - Number(b.price || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return rows;
  }, [
    installments,
    searchTerm,
    filterCategory,
    filterCity,
    filterStatus,
    filterListingType,
    filterCreator,
    sortBy,
  ]);

  const handleDelete = async (installment) => {
    if (!isOwnerListing(installment)) {
      setError('You cannot delete the whole product. Open Edit to remove only your payment plans.');
      return;
    }
    const id = installment._id || installment.installmentPlanId;
    if (
      !window.confirm(
        'Permanently delete this product listing?\n\nIt will be removed immediately from your panel and the public website. This cannot be undone.'
      )
    ) {
      return;
    }

    setDeleteLoading(id);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/deleteInstallment/${encodeURIComponent(id)}?permanent=true`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setInstallments((prev) =>
          prev.filter((item) => {
            const itemId = item.installmentPlanId || item._id;
            return itemId !== id && item._id !== id && item.status !== 'deleted';
          })
        );
        setError('');
      } else {
        setError(data.message || 'Failed to delete installment plan');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete installment plan');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return <PageLoader text="Loading installment plans..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Installment Plans</h1>
            <p className="text-gray-600 mt-1">
              {installments.length > 0
                ? `Showing ${filteredInstallments.length} of ${installments.length} plan${installments.length !== 1 ? 's' : ''}`
                : 'Manage all your installment plans'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/installments/create')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {installments.length === 0 ? (
          <div className="glass-red rounded-xl shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Installment Plans Yet</h3>
            <p className="text-gray-600 mb-6">Create your first installment plan to get started</p>
            <button
              type="button"
              onClick={() => navigate('/installments/create')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              Create First Plan
            </button>
          </div>
        ) : (
          <>
            {/* Search & filters */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  Search &amp; filter plans
                </h2>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear filters
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    {showFilters ? 'Hide filters' : 'Show filters'}
                  </button>
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="search"
                  placeholder="Search by product name, ID, company, creator, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { value: 'All', label: 'All', count: installments.length },
                  { value: 'in_stock', label: 'In Stock', count: statusCounts.in_stock },
                  { value: 'out_of_stock', label: 'Out of Stock', count: statusCounts.out_of_stock },
                  { value: 'approved', label: 'Approved', count: statusCounts.approved },
                  { value: 'pending', label: 'Pending', count: statusCounts.pending },
                  { value: 'drafted', label: 'Drafted', count: statusCounts.drafted },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setFilterStatus(chip.value)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      filterStatus === chip.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        filterStatus === chip.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {chip.count}
                    </span>
                  </button>
                ))}
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All categories</option>
                      {filterOptions.categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {formatCategory(cat)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Cities</option>
                      {cities.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LIST_STATUS_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Listing type</label>
                    <select
                      value={filterListingType}
                      onChange={(e) => setFilterListingType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All listings</option>
                      <option value="owner">Your listings</option>
                      <option value="shared">Shared (your plans only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Created by</label>
                    <select
                      value={filterCreator}
                      onChange={(e) => setFilterCreator(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All partners</option>
                      {filterOptions.creators.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="name">Name A–Z</option>
                      <option value="price_high">Price: high to low</option>
                      <option value="price_low">Price: low to high</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Matching plans</p>
                    <p className="text-3xl font-bold text-gray-800">{filteredInstallments.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your listings</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {filteredInstallments.filter(isOwnerListing).length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Filtered value</p>
                    <p className="text-3xl font-bold text-gray-800">
                      ₨ {filteredInstallments.reduce((sum, i) => sum + (Number(i.price) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {[
                { key: 'in_stock', label: 'In Stock', count: statusCounts.in_stock, className: 'from-sky-50 to-white border-sky-100 text-sky-700' },
                { key: 'out_of_stock', label: 'Out of Stock', count: statusCounts.out_of_stock, className: 'from-rose-50 to-white border-rose-100 text-rose-700' },
                { key: 'approved', label: 'Approved', count: statusCounts.approved, className: 'from-emerald-50 to-white border-emerald-100 text-emerald-700' },
                { key: 'pending', label: 'Pending', count: statusCounts.pending, className: 'from-amber-50 to-white border-amber-100 text-amber-700' },
                { key: 'drafted', label: 'Drafted', count: statusCounts.drafted, className: 'from-slate-50 to-white border-slate-200 text-slate-700' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilterStatus(item.key)}
                  className={`rounded-xl border bg-gradient-to-br p-4 text-left transition-all hover:shadow-md ${
                    item.className
                  } ${filterStatus === item.key ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{item.label}</p>
                  <p className="text-2xl font-bold mt-1">{item.count}</p>
                </button>
              ))}
            </div>

            {filteredInstallments.length === 0 ? (
              <div className="glass-red rounded-xl shadow-lg p-8 text-center">
                <Search className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No plans match your filters</h3>
                <p className="text-gray-600 mb-6">Try a different search term or clear the filters</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInstallments.map((installment) => {
                  const isOwner = isOwnerListing(installment);
                  const myCount = installment.myPlanCount ?? 0;
                  const preview = installment.myPlansPreview?.[0];
                  const mainImage = installment.productImages?.[0] || '';
                  const listId = installment.installmentPlanId || installment._id;
                  const creatorLabel = getCreatorLabel(installment);
                  const categoryLabel = formatCategory(installment.category || installment.customCategory);

                  return (
                    <div
                      key={listId}
                      className="glass-red rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                      {mainImage && (
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          <img
                            src={mainImage}
                            alt={installment.productName || 'Product'}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-x-0 top-0 p-3 flex flex-wrap items-start justify-between gap-2 bg-gradient-to-b from-black/45 to-transparent">
                            <InstallmentStatusBadges item={installment} size="sm" />
                            <span
                              className={`px-2 py-1 text-[10px] font-semibold rounded-full whitespace-nowrap backdrop-blur-sm ${
                                isOwner ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'
                              }`}
                            >
                              {isOwner ? 'Your listing' : 'Shared'}
                            </span>
                          </div>
                        </div>
                      )}

                      {!mainImage && (
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                          <InstallmentStatusBadges item={installment} size="sm" />
                          <span
                            className={`px-2 py-1 text-[10px] font-semibold rounded-full whitespace-nowrap ${
                              isOwner ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isOwner ? 'Your listing' : 'Shared'}
                          </span>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-1">
                              {installment.productName || 'Installment Plan'}
                            </h3>
                            {categoryLabel && (
                              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                                {categoryLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                                isOwner ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isOwner ? 'Your listing' : 'Shared · your plans'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded px-2 py-1.5 mb-3 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>
                            {isOwner ? 'Created by you' : 'Listed by'}:{' '}
                            <strong className="text-gray-800">{creatorLabel}</strong>
                          </span>
                        </p>

                        {installment.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{installment.description}</p>
                        )}

                        <div className="space-y-3">
                          {installment.price > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Product price:</span>
                              <span className="font-semibold text-gray-800">
                                ₨ {Number(installment.price).toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Your plans:</span>
                            <span className="font-semibold text-blue-700">{myCount}</span>
                          </div>

                          {preview?.monthlyInstallment > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{preview.planName || 'Your plan'}:</span>
                              <span className="font-semibold text-gray-800">
                                ₨ {Number(preview.monthlyInstallment).toLocaleString()}/mo
                              </span>
                            </div>
                          )}

                          {formatInstallmentCityDisplay(installment) && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">City:</span>
                              <span className="font-semibold text-gray-800">
                                {formatInstallmentCityDisplay(installment)}
                              </span>
                            </div>
                          )}

                          {listId && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-mono truncate">ID: {listId}</span>
                            </div>
                          )}

                          {myCount > 1 && (
                            <div className="pt-2">
                              <span className="text-xs text-blue-600 font-medium">
                                +{myCount - 1} more of your plan{myCount > 2 ? 's' : ''}
                              </span>
                            </div>
                          )}

                          {installment.createdAt && (
                            <div className="pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                Created: {new Date(installment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className={`mt-4 grid gap-2 ${isOwner ? 'grid-cols-3' : 'grid-cols-2'}`}>
                          <button
                            type="button"
                            onClick={() => navigate(`/installments/view/${encodeURIComponent(listId)}`)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/installments/edit/${encodeURIComponent(listId)}`)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            title={isOwner ? 'Edit listing' : 'Manage your plans'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => handleDelete(installment)}
                              disabled={deleteLoading === listId}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete entire listing"
                            >
                              {deleteLoading === listId ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default InstallmentsList;
