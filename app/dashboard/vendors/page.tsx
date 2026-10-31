'use client';

import React, { useState, useEffect } from 'react';
import { useEvent } from '@/components/EventContext';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Mail,
  IndianRupee,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
  FileQuestion,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Vendor, VendorStatus } from '@/types';
import { formatINR, CATEGORY_LABELS } from '@/lib/utils';

export default function VendorsPage() {
  const { activeEvent, activeEventId, apiKey } = useEvent();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Vendor Modal State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: 'catering',
    contactPerson: '',
    phone: '',
    email: '',
    quotedPrice: 0,
    negotiatedPrice: 0,
    status: 'contacted' as VendorStatus,
    paymentStatus: 'unpaid' as 'unpaid' | 'advance_paid' | 'fully_paid',
    advancePaid: 0,
    notes: '',
  });

  // AI Vetting Guide Modal State
  const [isVettingModalOpen, setIsVettingModalOpen] = useState(false);
  const [vettingCategory, setVettingCategory] = useState<string>('catering');
  const [vettingGuide, setVettingGuide] = useState<any | null>(null);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);

  const fetchVendors = async () => {
    if (!activeEventId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/vendors?eventId=${activeEventId}`);
      const data = await res.json();
      if (data.success) {
        setVendors(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [activeEventId]);

  if (!activeEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-plum-700">Please select or create an event first.</p>
      </div>
    );
  }

  const handleOpenAddVendor = () => {
    setEditingVendor(null);
    setVendorForm({
      name: '',
      category: 'catering',
      contactPerson: '',
      phone: '',
      email: '',
      quotedPrice: 0,
      negotiatedPrice: 0,
      status: 'contacted',
      paymentStatus: 'unpaid',
      advancePaid: 0,
      notes: '',
    });
    setIsVendorModalOpen(true);
  };

  const handleOpenEditVendor = (v: Vendor) => {
    setEditingVendor(v);
    setVendorForm({
      name: v.name,
      category: v.category,
      contactPerson: v.contactPerson,
      phone: v.phone,
      email: v.email,
      quotedPrice: v.quotedPrice,
      negotiatedPrice: v.negotiatedPrice || 0,
      status: v.status,
      paymentStatus: v.paymentStatus,
      advancePaid: v.advancePaid || 0,
      notes: v.notes || '',
    });
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = async () => {
    if (!vendorForm.name.trim()) return;
    try {
      if (editingVendor) {
        await fetch('/api/vendors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingVendor.id, ...vendorForm }),
        });
      } else {
        await fetch('/api/vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: activeEvent.id, ...vendorForm }),
        });
      }
      setIsVendorModalOpen(false);
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor record?')) return;
    try {
      await fetch(`/api/vendors?id=${id}`, { method: 'DELETE' });
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateVettingGuide = async (category: string) => {
    try {
      setVettingCategory(category);
      setIsGeneratingGuide(true);
      setIsVettingModalOpen(true);
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vetting_guide',
          eventId: activeEvent.id,
          vendorCategory: category,
          customApiKey: apiKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVettingGuide(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  const bookedTotal = vendors
    .filter((v) => v.status === 'booked')
    .reduce((acc, v) => acc + (v.negotiatedPrice || v.quotedPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fade-in">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-burgundy-800 uppercase tracking-wider">
            Supplier Organizer & Vetting
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 mt-1">
            Vendor Management
          </h1>
          <p className="text-xs text-plum-600 mt-0.5">
            Record supplier quotes, track advance payments, and generate AI interview questions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleGenerateVettingGuide('catering')}
            className="px-4 py-2.5 rounded-2xl bg-ivory-100 border border-plum-200 text-plum-950 text-xs font-semibold shadow-subtle hover:bg-plum-50 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>AI Vetting Questions</span>
          </button>

          <button
            onClick={handleOpenAddVendor}
            className="px-4 py-2.5 rounded-2xl bg-plum-800 text-white text-xs font-semibold shadow-card hover:bg-plum-900 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card">
          <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
            Total Vendors Tracked
          </p>
          <p className="text-xl font-bold font-serif text-plum-950 mt-1">{vendors.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card">
          <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
            Booked Contracts
          </p>
          <p className="text-xl font-bold font-serif text-emerald-700 mt-1">
            {vendors.filter((v) => v.status === 'booked').length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card">
          <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
            Booked Contract Total
          </p>
          <p className="text-xl font-bold font-serif text-burgundy-900 mt-1">
            {formatINR(bookedTotal)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card">
          <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
            Advances Disbursed
          </p>
          <p className="text-xl font-bold font-serif text-plum-900 mt-1">
            {formatINR(vendors.reduce((acc, v) => acc + (v.advancePaid || 0), 0))}
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {[
          { id: 'all', label: 'All Vendors' },
          { id: 'booked', label: 'Booked' },
          { id: 'shortlisted', label: 'Shortlisted' },
          { id: 'quote_received', label: 'Quote Received' },
          { id: 'contacted', label: 'Contacted' },
          { id: 'not_contacted', label: 'Not Contacted' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              statusFilter === tab.id
                ? 'bg-plum-800 text-white shadow-subtle'
                : 'bg-white border border-plum-150 text-plum-700 hover:bg-ivory-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => {
          const hasDiscount =
            vendor.negotiatedPrice &&
            vendor.negotiatedPrice > 0 &&
            vendor.negotiatedPrice < vendor.quotedPrice;

          return (
            <div
              key={vendor.id}
              className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card hover:border-plum-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-plum-100 text-plum-800">
                    {(CATEGORY_LABELS as Record<string, string>)[vendor.category] || vendor.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      vendor.status === 'booked'
                        ? 'bg-emerald-100 text-emerald-800'
                        : vendor.status === 'shortlisted'
                        ? 'bg-amber-100 text-amber-800'
                        : vendor.status === 'quote_received'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-ivory-200 text-plum-700'
                    }`}
                  >
                    {vendor.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-plum-950">{vendor.name}</h3>
                  {vendor.contactPerson && (
                    <p className="text-xs text-plum-600">Contact: {vendor.contactPerson}</p>
                  )}
                </div>

                {/* Contact details */}
                <div className="space-y-1 text-xs text-plum-700">
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-plum-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-plum-400" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                {/* Pricing Details */}
                <div className="p-3.5 rounded-2xl bg-ivory-100/70 border border-plum-150 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-plum-600">Initial Quote:</span>
                    <span
                      className={`font-semibold ${
                        hasDiscount ? 'line-through text-plum-400' : 'text-plum-950 font-bold'
                      }`}
                    >
                      {formatINR(vendor.quotedPrice)}
                    </span>
                  </div>

                  {vendor.negotiatedPrice && vendor.negotiatedPrice > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-plum-600">Final Agreed:</span>
                      <span className="font-bold text-emerald-700">
                        {formatINR(vendor.negotiatedPrice)}
                      </span>
                    </div>
                  )}

                  <div className="pt-1 border-t border-plum-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-plum-500">Advance Paid:</span>
                    <span className="font-semibold text-plum-900">
                      {vendor.advancePaid ? formatINR(vendor.advancePaid) : '₹0'} (
                      {vendor.paymentStatus.replace('_', ' ')})
                    </span>
                  </div>
                </div>

                {vendor.notes && (
                  <p className="text-[11px] text-plum-600 bg-plum-50/50 p-2.5 rounded-xl border border-plum-100 line-clamp-2">
                    {vendor.notes}
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-plum-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleGenerateVettingGuide(vendor.category)}
                  className="text-plum-700 hover:text-plum-950 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                  <span>Vetting Tips</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditVendor(vendor)}
                    className="p-1.5 rounded-lg text-plum-600 hover:text-plum-900 hover:bg-plum-100"
                    title="Edit Vendor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Delete Vendor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Vendor Modal */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-plum-200 rounded-3xl shadow-elevated w-full max-w-lg overflow-hidden">
            <div className="bg-plum-800 text-white p-5 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingVendor ? 'Edit Vendor Details' : 'Add New Supplier Record'}
              </h3>
              <button
                onClick={() => setIsVendorModalOpen(false)}
                className="text-plum-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                  Vendor / Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Siri Traditional Karnataka Caterers"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 bg-ivory-50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                      <option key={cat} value={cat}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Booking Status
                  </label>
                  <select
                    value={vendorForm.status}
                    onChange={(e) =>
                      setVendorForm({ ...vendorForm, status: e.target.value as VendorStatus })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  >
                    <option value="not_contacted">Not Contacted</option>
                    <option value="contacted">Contacted</option>
                    <option value="quote_received">Quote Received</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Raghavendra Rao"
                    value={vendorForm.contactPerson}
                    onChange={(e) =>
                      setVendorForm({ ...vendorForm, contactPerson: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98450 12345"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Quoted (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={vendorForm.quotedPrice}
                    onChange={(e) =>
                      setVendorForm({ ...vendorForm, quotedPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Negotiated (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={vendorForm.negotiatedPrice}
                    onChange={(e) =>
                      setVendorForm({
                        ...vendorForm,
                        negotiatedPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={vendorForm.advancePaid}
                    onChange={(e) =>
                      setVendorForm({
                        ...vendorForm,
                        advancePaid: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                  Notes & Contract Commitments
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Free welcome mocktail counter included if booked by Friday"
                  value={vendorForm.notes}
                  onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-plum-700 hover:bg-plum-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveVendor}
                  className="px-5 py-2 text-xs font-semibold bg-plum-800 text-white rounded-xl shadow-card"
                >
                  Save Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Vetting Guide Modal */}
      {isVettingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-plum-200 rounded-3xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-plum-800 to-burgundy-800 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-400" />
                <h3 className="font-semibold text-lg">AI Vendor Vetting Guide</h3>
              </div>
              <button
                onClick={() => setIsVettingModalOpen(false)}
                className="text-plum-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {isGeneratingGuide ? (
                <div className="py-12 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-gold-500 animate-spin mx-auto" />
                  <p className="font-semibold text-plum-900">
                    Generating supplier evaluation questions with Gemini...
                  </p>
                </div>
              ) : vettingGuide ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-plum-50 border border-plum-150">
                    <p className="text-[11px] font-bold text-plum-600 uppercase tracking-wider">
                      Price Benchmark in {activeEvent.location}
                    </p>
                    <p className="text-xs font-bold text-plum-950 mt-0.5">
                      {vettingGuide.estimatedPriceRange}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-plum-950 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Key Selection Criteria:</span>
                    </h4>
                    <ul className="space-y-1 text-plum-700">
                      {vettingGuide.keySelectionCriteria?.map((c: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block mt-1.5 flex-shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-plum-950 mb-1.5 flex items-center gap-1.5">
                      <FileQuestion className="w-4 h-4 text-plum-800" />
                      <span>Must-Ask Questions (Uncover Hidden Costs):</span>
                    </h4>
                    <div className="space-y-1.5">
                      {vettingGuide.mustAskQuestions?.map((q: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-ivory-100 border border-plum-150 text-plum-900 font-medium"
                        >
                          "{q}"
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-rose-800 mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Red Flags to Watch Out For:</span>
                    </h4>
                    <ul className="space-y-1 text-rose-700">
                      {vettingGuide.redFlagsToWatch?.map((rf: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block mt-1.5 flex-shrink-0" />
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
