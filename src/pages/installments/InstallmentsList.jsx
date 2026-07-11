import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { PageLoader } from '../../components/Loader';
import baseApi from '../../constants/apiUrl';
import cities, { formatInstallmentCityDisplay } from '../../constants/cites';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import InstallmentStatusBadges from '../../components/installment/InstallmentStatusBadges';
import {
  LIST_STATUS_FILTER_OPTIONS,
} from '../../utils/installmentStatus';
import BulkDataModal from '../../components/mada-data/BulkDataModal';
import ExportRecordsModal from '../../components/mada-data/ExportRecordsModal';

const PAGE_SIZE = 50;

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
    item.createdBy?.[0]?.name ||
    item.companyName ||
    item.companyNameOther ||
    item.postedBy ||
    'Unknown partner'
  );
};

const InstallmentsList = () => {
  const navigate = useNavigate();
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterListingType, setFilterListingType] = useState('All');
  const [filterCreator, setFilterCreator] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [filterOptions, setFilterOptions] = useState({ categories: [], creators: [] });
  const [totalCatalog, setTotalCatalog] = useState(0);
  const [stats, setStats] = useState({
    counts: { total: 0, in_stock: 0, out_of_stock: 0, approved: 0, pending: 0, drafted: 0, owner: 0, shared: 0 },
    totalValue: 0,
    matching: 0,
    totalCatalog: 0,
  });

  const isFirstLoad = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterCategory, filterCity, filterStatus, filterListingType, filterCreator, sortBy]);

  const buildStatsQueryString = useCallback(() => {
    const params = new URLSearchParams({ sortBy });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filterCategory !== 'All') params.set('category', filterCategory);
    if (filterCity !== 'All') params.set('city', filterCity);
    if (filterListingType !== 'All') params.set('listingType', filterListingType);
    if (filterCreator !== 'All') params.set('creator', filterCreator);
    return params.toString();
  }, [debouncedSearch, filterCategory, filterCity, filterListingType, filterCreator, sortBy]);

  const buildQueryString = useCallback(
    (pageNum) => {
      const params = new URLSearchParams({
        paginated: 'true',
        page: String(pageNum),
        limit: String(PAGE_SIZE),
        sortBy,
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filterCategory !== 'All') params.set('category', filterCategory);
      if (filterCity !== 'All') params.set('city', filterCity);
      if (filterStatus !== 'All') params.set('status', filterStatus);
      if (filterListingType !== 'All') params.set('listingType', filterListingType);
      if (filterCreator !== 'All') params.set('creator', filterCreator);
      return params.toString();
    },
    [debouncedSearch, filterCategory, filterCity, filterStatus, filterListingType, filterCreator, sortBy]
  );

  const fetchInstallments = useCallback(async (pageNum = 1, initial = false) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/');
        return;
      }

      if (!initial) setListLoading(true);

      const qs = buildQueryString(pageNum);
      const listRes = await fetch(`${baseApi}/getAllCreateInstallnment?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await listRes.json();

      if (data.success) {
        setInstallments((data.data || []).filter((item) => item.status !== 'deleted'));
        setPagination(data.pagination || { page: pageNum, limit: PAGE_SIZE, total: 0, totalPages: 1 });
        if (data.filterOptions) setFilterOptions(data.filterOptions);
        if (typeof data.totalCatalog === 'number') setTotalCatalog(data.totalCatalog);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch installments');
      }

      fetch(`${baseApi}/partner/installments/stats?${buildStatsQueryString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((statsData) => {
          if (statsData.success) setStats(statsData.data);
        })
        .catch(() => {});
    } catch (err) {
      console.error('Fetch installments error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setListLoading(false);
      isFirstLoad.current = false;
    }
  }, [navigate, buildQueryString, buildStatsQueryString]);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      navigate('/');
      return;
    }
    fetchInstallments(page, isFirstLoad.current);
  }, [
    navigate,
    page,
    debouncedSearch,
    filterCategory,
    filterCity,
    filterStatus,
    filterListingType,
    filterCreator,
    sortBy,
    fetchInstallments,
  ]);

  const catalogTotal = totalCatalog || stats.totalCatalog || pagination.total || 0;
  const hasPlansInCatalog = catalogTotal > 0 || installments.length > 0;

  const statusCounts = stats.counts || {};

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
    setPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleStatusChip = (value) => {
    setFilterStatus(value);
    setPage(1);
  };

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
        fetchInstallments(page);
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
    <div className="partner-page">
      <Navbar />

      <main className="partner-container">
        <div className="flex flex-col gap-4 mb-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Installment Plans</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {catalogTotal > 0
                ? `Showing ${installments.length} of ${pagination.total || catalogTotal} plan${(pagination.total || catalogTotal) !== 1 ? 's' : ''}${pagination.totalPages > 1 ? ` (page ${pagination.page} of ${pagination.totalPages})` : ''} · ${catalogTotal} total in your catalog`
                : hasActiveFilters
                  ? 'No plans match your filters'
                  : 'Manage all your installment plans'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="btn-brand-outline w-full sm:w-auto"
            >
              <FileText className="w-5 h-5" />
              Download records
            </button>
            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="btn-brand-outline w-full sm:w-auto"
            >
              <Database className="w-5 h-5" />
              Bulk Data
            </button>
            <button
              type="button"
              onClick={() => navigate('/installments/create')}
              className="btn-brand w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              Create Plan
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!hasPlansInCatalog && !hasActiveFilters && !listLoading ? (
          <div className="glass-red rounded-xl shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Installment Plans Yet</h3>
            <p className="text-gray-600 mb-6">Create your first installment plan to get started</p>
            <button
              type="button"
              onClick={() => navigate('/installments/create')}
              className="btn-brand"
            >
              Create First Plan
            </button>
          </div>
        ) : (
          <>
            {/* Search & filters */}
            <div className="bg-white rounded-2xl p-3 sm:p-5 lg:p-6 shadow-lg border border-red-100 mb-4 sm:mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-red-600" />
                  Search &amp; filter plans
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
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
                    className="text-xs font-medium text-red-600 hover:text-red-800"
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
                  className="input-brand pl-12"
                />
              </div>

              <div className="chip-scroll mb-4">
                {[
                  { value: 'All', label: 'All', count: stats.matching || pagination.total },
                  { value: 'in_stock', label: 'In Stock', count: statusCounts.in_stock || 0 },
                  { value: 'out_of_stock', label: 'Out of Stock', count: statusCounts.out_of_stock || 0 },
                  { value: 'approved', label: 'Approved', count: statusCounts.approved || 0 },
                  { value: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
                  { value: 'drafted', label: 'Drafted', count: statusCounts.drafted || 0 },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => handleStatusChip(chip.value)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                      filterStatus === chip.value
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-700'
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
                      onChange={handleFilterChange(setFilterCategory)}
                      className="select-brand"
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
                      onChange={handleFilterChange(setFilterCity)}
                      className="select-brand"
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
                      onChange={handleFilterChange(setFilterStatus)}
                      className="select-brand"
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
                      onChange={handleFilterChange(setFilterListingType)}
                      className="select-brand"
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
                      onChange={handleFilterChange(setFilterCreator)}
                      className="select-brand"
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
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="select-brand"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4">
              <div className="glass-red rounded-xl p-4 sm:p-6 shadow-lg border border-red-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Matching plans</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.matching ?? pagination.total}</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-red-100 rounded-lg shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="glass-red rounded-xl p-4 sm:p-6 shadow-lg border border-red-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Your listings</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{statusCounts.owner || 0}</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-red-100 rounded-lg shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="glass-red rounded-xl p-4 sm:p-6 shadow-lg border border-red-100 sm:col-span-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Filtered value</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                      ₨ {(stats.totalValue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-red-100 rounded-lg shrink-0">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
              {[
                { key: 'in_stock', label: 'In Stock', count: statusCounts.in_stock },
                { key: 'out_of_stock', label: 'Out of Stock', count: statusCounts.out_of_stock },
                { key: 'approved', label: 'Approved', count: statusCounts.approved },
                { key: 'pending', label: 'Pending', count: statusCounts.pending },
                { key: 'drafted', label: 'Drafted', count: statusCounts.drafted },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleStatusChip(item.key)}
                  className={`rounded-xl border bg-gradient-to-br from-red-50 to-white border-red-100 text-red-800 p-3 sm:p-4 text-left transition-all hover:shadow-md ${
                    filterStatus === item.key ? 'ring-2 ring-red-600 shadow-md bg-red-50' : ''
                  }`}
                >
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide opacity-80 leading-tight">{item.label}</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{item.count}</p>
                </button>
              ))}
            </div>

            {listLoading && (
              <div className="text-center py-4 text-sm text-red-600 font-medium">Updating list…</div>
            )}

            {installments.length === 0 ? (
              <div className="glass-red rounded-xl shadow-lg p-8 text-center">
                <Search className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No plans match your filters</h3>
                <p className="text-gray-600 mb-6">Try a different search term or clear the filters</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-brand"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {installments.map((installment) => {
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
                      className="glass-red rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-red-100"
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
                                isOwner ? 'bg-red-600/90 text-white' : 'bg-white/90 text-red-700 border border-red-200'
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
                              isOwner ? 'bg-red-100 text-red-700' : 'bg-white text-red-600 border border-red-200'
                            }`}
                          >
                            {isOwner ? 'Your listing' : 'Shared'}
                          </span>
                        </div>
                      )}

                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 mb-1">
                              {installment.productName || 'Installment Plan'}
                            </h3>
                            {categoryLabel && (
                              <span className="inline-block px-2 py-1 bg-red-50 text-red-700 border border-red-100 text-xs font-medium rounded">
                                {categoryLabel}
                              </span>
                            )}
                          </div>
                          <div className="shrink-0">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                                isOwner ? 'bg-red-100 text-red-700' : 'bg-white text-red-600 border border-red-200'
                              }`}
                            >
                              {isOwner ? 'Your listing' : 'Shared · your plans'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded px-2 py-1.5 mb-3 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="min-w-0">
                            {isOwner ? (
                              <>
                                Created by: <strong className="text-gray-800">{creatorLabel}</strong>
                                <span className="text-gray-500"> (you)</span>
                              </>
                            ) : (
                              <>
                                Product owner: <strong className="text-gray-800">{creatorLabel}</strong>
                                <span className="text-gray-500"> · your payment plans attached</span>
                              </>
                            )}
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
                            <span className="font-semibold text-red-700">{myCount}</span>
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
                              <span className="text-xs text-red-600 font-medium">
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
                            className="flex items-center justify-center gap-1 px-2 sm:px-3 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-medium"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/installments/edit/${encodeURIComponent(listId)}`)}
                            className="flex items-center justify-center gap-1 px-2 sm:px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
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

            {pagination.totalPages > 1 && installments.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-red-100">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || listLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium border border-red-200 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages || listLoading}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium border border-red-200 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showBulkModal && (
        <BulkDataModal
          onClose={() => setShowBulkModal(false)}
          onImportComplete={() => {
            setShowBulkModal(false);
            setPage(1);
            fetchInstallments(1);
          }}
        />
      )}

      {showExportModal && (
        <ExportRecordsModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default InstallmentsList;
