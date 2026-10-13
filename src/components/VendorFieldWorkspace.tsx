import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import {
  Camera,
  MapPin,
  Upload,
  CheckCircle2,
  Clock,
  HardHat,
  FileText,
  AlertCircle,
  X
} from 'lucide-react';

export const VendorFieldWorkspace: React.FC = () => {
  const { currentUser, milestones, projects, submitFieldEvidence } = useApp();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(milestones[3]?.id || 'mls-04');
  const [evidenceCategory, setEvidenceCategory] = useState<'SITE_PHOTO' | 'INSPECTION_REPORT' | 'SURVEY_PLAN'>('SITE_PHOTO');
  const [filename, setFilename] = useState('field_inspection_concrete_fascia.jpg');
  const [notes, setNotes] = useState('Parapet concrete fascia curing completed. Rebar tie wire inspected.');
  const [lat, setLat] = useState('6.4474');
  const [lng, setLng] = useState('3.4739');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFieldEvidence(selectedMilestoneId, {
      category: evidenceCategory,
      filename,
      fileSizeMb: 5.4,
      sha256Checksum: '8e4f1092a71b2d019488aef00192bba40192840192849019281a029384910291',
      gpsCoordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
    });
    setUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Field Operations Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>Field Operations & Contractor Portal</span>
                <span>/</span>
                <span className="text-slate-900 font-semibold">{currentUser.fullName}</span>
                <span>·</span>
                <span className="text-slate-600">On-Site QA & Evidence Submission</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Site Inspections & Progress Logging
              </h1>
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Camera className="w-4 h-4" />
              Upload Site Evidence
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Active Site Work Packages */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Assigned Active Work Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.slice(0, 4).map((m) => (
              <div key={m.id} className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500 font-semibold">{m.projectCode} · Milestone #{m.orderIndex}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    m.status === 'CLIENT_APPROVED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : m.status === 'INTERNAL_VERIFIED'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {m.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{m.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Target Due: {m.plannedDueDate}</span>
                  <button
                    onClick={() => {
                      setSelectedMilestoneId(m.id);
                      setUploadModalOpen(true);
                    }}
                    className="text-emerald-700 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    + Submit Site Media
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site Checklist Protocol */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Mandatory Field Evidence Protocols</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="p-4 bg-slate-50 rounded-lg space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Geotagged Coordinates</span>
              </div>
              <p className="leading-relaxed">All photographs must contain verifiable GPS metadata matching the cadastral survey boundaries.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Raw Timestamp Hash</span>
              </div>
              <p className="leading-relaxed">Photos must be submitted within 24 hours of capture with SHA-256 cryptographic checksums generated upon upload.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lab Test Documentation</span>
              </div>
              <p className="leading-relaxed">Concrete, steel reinforcement, and soil tests require certified laboratory crush certificates from accredited testing centers.</p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: SUBMIT FIELD EVIDENCE */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 space-y-4">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Upload Site Evidence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit dated inspection photos or technical reports for project manager and client verification.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Milestone</label>
                <select
                  value={selectedMilestoneId}
                  onChange={(e) => setSelectedMilestoneId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.projectCode} · #{m.orderIndex} - {m.title.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Evidence Category</label>
                <select
                  value={evidenceCategory}
                  onChange={(e) => setEvidenceCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="SITE_PHOTO">High-Resolution Site Photography</option>
                  <option value="INSPECTION_REPORT">COREN Engineering / Agronomist Report (PDF)</option>
                  <option value="SURVEY_PLAN">Registered Cadastral Survey Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Filename / Asset Label</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">GPS Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">GPS Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Log Evidence Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
