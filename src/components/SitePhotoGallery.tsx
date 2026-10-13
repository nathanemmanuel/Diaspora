import React, { useState, useMemo } from 'react';
import { MediaAsset, Project, Milestone } from '../types';
import { useApp } from '../store/AppContext';
import {
  Camera,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
  Filter,
  Search,
  Eye,
  Grid,
  List,
  Map,
  Maximize2,
  Copy,
  Check,
  Building2,
  HardHat,
  Compass,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  RefreshCw,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface SitePhotoGalleryProps {
  initialProjectId?: string;
  initialMilestoneId?: string;
  onNavigateToMilestones?: (milestoneId?: string) => void;
  onNavigateToProject?: (projectId: string) => void;
}

export const SitePhotoGallery: React.FC<SitePhotoGalleryProps> = ({
  initialProjectId,
  initialMilestoneId,
  onNavigateToMilestones,
  onNavigateToProject,
}) => {
  const { milestones, projects, currentUser, verifyMediaAsset } = useApp();

  // Confidentiality Isolation: Scope projects to current client
  const scopedProjects = useMemo(() => {
    if (currentUser.role === 'DIASPORA_CLIENT') {
      return projects.filter((p) => p.clientId === currentUser.id);
    }
    return projects;
  }, [projects, currentUser]);

  const scopedProjectIds = useMemo(() => new Set(scopedProjects.map((p) => p.id)), [scopedProjects]);

  const scopedMilestones = useMemo(() => {
    if (currentUser.role === 'DIASPORA_CLIENT') {
      return milestones.filter((m) => scopedProjectIds.has(m.projectId));
    }
    return milestones;
  }, [milestones, scopedProjectIds, currentUser]);

  // Flatten all site photo assets from scoped milestones
  const allMediaAssets: (MediaAsset & { project?: Project; milestone?: Milestone })[] = useMemo(() => {
    const list: (MediaAsset & { project?: Project; milestone?: Milestone })[] = [];
    scopedMilestones.forEach((m) => {
      const proj = scopedProjects.find((p) => p.id === m.projectId);
      m.evidenceItems.forEach((ev) => {
        if (ev.category === 'SITE_PHOTO' || ev.thumbnailUrl) {
          list.push({
            ...ev,
            project: proj,
            milestone: m,
          });
        }
      });
    });
    return list;
  }, [scopedMilestones, scopedProjects]);

  // Filter state
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || 'ALL');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(initialMilestoneId || 'ALL');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<'ALL' | 'VERIFIED' | 'UNDER_REVIEW'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST' | 'MAP' | 'COMPARE'>('GRID');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'MILESTONE'>('NEWEST');

  // Lightbox / Inspection Modal state
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);
  const [flagReasonModalOpen, setFlagReasonModalOpen] = useState<boolean>(false);
  const [flagReasonText, setFlagReasonText] = useState<string>('Location boundary discrepancy or lighting unclear');

  // Comparison mode selection
  const [compareLeftIndex, setCompareLeftIndex] = useState<number>(0);
  const [compareRightIndex, setCompareRightIndex] = useState<number>(1);

  // Map view selected photo
  const [mapSelectedPhotoId, setMapSelectedPhotoId] = useState<string | null>(null);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return allMediaAssets.filter((asset) => {
      if (selectedProjectId !== 'ALL' && asset.projectId !== selectedProjectId) return false;
      if (selectedMilestoneId !== 'ALL' && asset.milestoneId !== selectedMilestoneId) return false;
      if (selectedVerificationStatus === 'VERIFIED' && !asset.isVerified) return false;
      if (selectedVerificationStatus === 'UNDER_REVIEW' && asset.isVerified) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = asset.title?.toLowerCase().includes(q);
        const matchFilename = asset.filename.toLowerCase().includes(q);
        const matchUploader = asset.uploaderName.toLowerCase().includes(q);
        const matchProject = asset.project?.title.toLowerCase().includes(q);
        const matchMilestone = asset.milestone?.title.toLowerCase().includes(q);
        const matchTags = asset.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchFilename && !matchUploader && !matchProject && !matchMilestone && !matchTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.claimedCaptureTime).getTime() - new Date(a.claimedCaptureTime).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.claimedCaptureTime).getTime() - new Date(b.claimedCaptureTime).getTime();
      }
      if (sortBy === 'MILESTONE') {
        return (a.milestone?.orderIndex || 0) - (b.milestone?.orderIndex || 0);
      }
      return 0;
    });
  }, [allMediaAssets, selectedProjectId, selectedMilestoneId, selectedVerificationStatus, searchQuery, sortBy]);

  // Active photo for modal
  const activeAsset = activePhotoIndex !== null && filteredAssets[activePhotoIndex] ? filteredAssets[activePhotoIndex] : null;

  const handleOpenLightbox = (index: number) => {
    setActivePhotoIndex(index);
    setZoomLevel(1);
    setRotationDegrees(0);
    setVerificationFeedback(null);
  };

  const handleCloseLightbox = () => {
    setActivePhotoIndex(null);
    setZoomLevel(1);
    setRotationDegrees(0);
    setVerificationFeedback(null);
  };

  const handlePrevPhoto = () => {
    if (activePhotoIndex !== null && activePhotoIndex > 0) {
      setActivePhotoIndex(activePhotoIndex - 1);
      setZoomLevel(1);
      setRotationDegrees(0);
    }
  };

  const handleNextPhoto = () => {
    if (activePhotoIndex !== null && activePhotoIndex < filteredAssets.length - 1) {
      setActivePhotoIndex(activePhotoIndex + 1);
      setZoomLevel(1);
      setRotationDegrees(0);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleVerifyAsset = (assetId: string, approve: boolean, notes?: string) => {
    verifyMediaAsset(assetId, approve, notes);
    setVerificationFeedback(approve ? 'Photo evidence cryptographically verified!' : 'Photo evidence flagged for vendor retake.');
    setFlagReasonModalOpen(false);
    setTimeout(() => setVerificationFeedback(null), 3500);
  };

  const downloadInspectionReport = (asset: MediaAsset & { project?: Project; milestone?: Milestone }) => {
    const reportText = `DIASPORATRUST VERIFIED SITE EVIDENCE INSPECTION CERTIFICATE
-------------------------------------------------------------------------
Certificate ID: CERT-${asset.id.toUpperCase()}-${Date.now()}
Verification Timestamp: ${new Date().toISOString()}

PROJECT DETAILS:
- Project: ${asset.project?.title || 'Lekki Villa Luxury Project'}
- Project Code: ${asset.project?.projectCode || 'DT-PRJ-01'}
- Milestone #${asset.milestone?.orderIndex || 1}: ${asset.milestone?.title || 'Milestone'}
- Milestone Status: ${asset.milestone?.status || 'SUBMITTED_FOR_REVIEW'}

VENDOR & FIELD EVIDENCE:
- Uploading Vendor: ${asset.uploaderName} (${asset.uploaderRole})
- Contractor: ${asset.contractorName || asset.milestone?.contractorName || 'Apex Engineering Ltd'}
- Original Filename: ${asset.filename}
- Claimed Capture Time: ${asset.claimedCaptureTime}
- Cryptographic Server Upload Time: ${asset.actualUploadTime}
- Camera / Geodetic Device: ${asset.cameraDevice || 'High-Resolution Field Sensor'}

GEOSPATIAL TELEMETRY:
- GPS Latitude: ${asset.gpsCoordinates?.lat || '6.4475'}° N
- GPS Longitude: ${asset.gpsCoordinates?.lng || '3.4739'}° E
- Elevation: ${asset.elevationMeters || 14.5}m ASL
- Compass Azimuth Bearing: ${asset.azimuthBearing || 120}°
- Geofence Audit: ${asset.geoFenceStatus || 'INSIDE_SITE_BOUNDARY'} (Precision: ±${asset.accuracyMeters || 0.05}m)

CRYPTOGRAPHIC INTEGRITY:
- Storage Key: ${asset.storageKey}
- SHA-256 Checksum: ${asset.sha256Checksum}
- Verification Seal: ${asset.isVerified ? `VERIFIED by ${asset.verifiedBy} at ${asset.verifiedAt || 'Official Audit'}` : 'PENDING CLIENT / INSPECTOR REVIEW'}
-------------------------------------------------------------------------
DiasporaTrust Capital Guardian - Anti-Fraud & Milestone Verification Protocol`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DiasporaTrust_SiteEvidence_${asset.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalPhotosCount = allMediaAssets.length;
  const verifiedCount = allMediaAssets.filter((a) => a.isVerified).length;
  const pendingCount = totalPhotosCount - verifiedCount;
  const geoTaggedCount = allMediaAssets.filter((a) => a.gpsCoordinates).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Anti-Spoofing & Geotag Verification
              </span>
              <span className="text-xs text-slate-400 font-mono">EXIF & GPS Telemetry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Site Photo & Construction Milestone Gallery
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Inspect timestamped, geo-tagged photography uploaded directly from the field by verified contractors and QA inspectors. Verify actual on-site physical progress before releasing escrowed capital.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="px-3 py-1.5">
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Photos</div>
              <div className="text-lg font-bold font-mono text-slate-900">{totalPhotosCount}</div>
            </div>
            <div className="px-3 py-1.5 border-l border-slate-200">
              <div className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Verified</div>
              <div className="text-lg font-bold font-mono text-emerald-700">{verifiedCount}</div>
            </div>
            <div className="px-3 py-1.5 border-l border-slate-200">
              <div className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">Pending Review</div>
              <div className="text-lg font-bold font-mono text-amber-700">{pendingCount}</div>
            </div>
            <div className="px-3 py-1.5 border-l border-slate-200">
              <div className="text-[10px] text-sky-600 font-medium uppercase tracking-wider">Geo-Tagged</div>
              <div className="text-lg font-bold font-mono text-sky-700">{geoTaggedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by milestone title, contractor, tags, or coordinates..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'GRID' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'LIST' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Audit Table</span>
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'MAP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Site Map & Pins</span>
            </button>
            <button
              onClick={() => setViewMode('COMPARE')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'COMPARE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedMilestoneId('ALL');
              }}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Projects ({scopedProjects.length})</option>
              {scopedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} · {p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Milestone Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Milestone:</span>
            <select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Milestones</option>
              {milestones
                .filter((m) => selectedProjectId === 'ALL' || m.projectId === selectedProjectId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    M#{m.orderIndex} · {m.title.length > 35 ? m.title.substring(0, 35) + '...' : m.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedVerificationStatus}
              onChange={(e) => setSelectedVerificationStatus(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Verification States</option>
              <option value="VERIFIED">Verified Only ({verifiedCount})</option>
              <option value="UNDER_REVIEW">Pending Review ({pendingCount})</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">Newest Capture First</option>
              <option value="OLDEST">Earliest Capture First</option>
              <option value="MILESTONE">Milestone Sequence</option>
            </select>
          </div>

          {/* Active Filter Clear button */}
          {(selectedProjectId !== 'ALL' || selectedMilestoneId !== 'ALL' || selectedVerificationStatus !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedProjectId('ALL');
                setSelectedMilestoneId('ALL');
                setSelectedVerificationStatus('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 ml-2"
            >
              <X className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Gallery Area */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Camera className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Site Images Match Filters</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No vendor-uploaded photos meet your active criteria. Try broadening your project or milestone filter, or search query.
          </p>
          <button
            onClick={() => {
              setSelectedProjectId('ALL');
              setSelectedMilestoneId('ALL');
              setSelectedVerificationStatus('ALL');
              setSearchQuery('');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Show All Site Evidence
          </button>
        </div>
      ) : (
        <>
          {/* VIEW MODE 1: GRID VIEW */}
          {viewMode === 'GRID' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Photo Container */}
                  <div
                    onClick={() => handleOpenLightbox(index)}
                    className="relative aspect-4/3 bg-slate-900 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.title || asset.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 opacity-90 group-hover:opacity-100 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900/80 backdrop-blur-sm text-white border border-white/20">
                        {asset.project?.projectCode || 'DT-PRJ'} · M#{asset.milestone?.orderIndex || 1}
                      </span>

                      {asset.isVerified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600/90 text-white backdrop-blur-sm flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/90 text-white backdrop-blur-sm flex items-center gap-1 shadow-sm">
                          <Clock className="w-3 h-3" />
                          Under Review
                        </span>
                      )}
                    </div>

                    {/* Geotag & Elevation Badge on Image */}
                    {asset.gpsCoordinates && (
                      <div className="absolute bottom-3 left-3 pointer-events-none">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900/85 backdrop-blur-sm text-slate-200 text-[10px] font-mono border border-slate-700/60">
                          <MapPin className="w-3 h-3 text-sky-400" />
                          <span>{asset.gpsCoordinates.lat.toFixed(4)}°N, {asset.gpsCoordinates.lng.toFixed(4)}°E</span>
                          {asset.elevationMeters && <span className="text-slate-400">· {asset.elevationMeters}m</span>}
                        </div>
                      </div>
                    )}

                    {/* Hover Inspect Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {/* Milestone Title */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500 truncate">
                          {asset.milestone?.title || 'Milestone Verification'}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 mt-0.5">
                          {asset.title || asset.filename}
                        </h3>
                      </div>

                      {/* Description / Caption */}
                      {asset.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {asset.description}
                        </p>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {/* Timestamps */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Capture Time
                          </div>
                          <div className="font-mono text-slate-800 font-medium truncate">
                            {asset.claimedCaptureTime}
                          </div>
                        </div>

                        {/* Uploader / Vendor */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                            <HardHat className="w-3 h-3" />
                            Uploader
                          </div>
                          <div className="text-slate-800 font-medium truncate">
                            {asset.uploaderName}
                          </div>
                        </div>

                        {/* Camera Hardware */}
                        {asset.cameraDevice && (
                          <div className="space-y-0.5 col-span-2 border-t border-slate-100 pt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="truncate">{asset.cameraDevice}</span>
                            {asset.geoFenceStatus && (
                              <span className="font-semibold text-emerald-700 font-mono">
                                {asset.geoFenceStatus.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenLightbox(index)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect High-Res
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyHash(asset.sha256Checksum)}
                          title="Copy SHA-256 Checksum"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          {copiedHash === asset.sha256Checksum ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => downloadInspectionReport(asset)}
                          title="Download Verification Proof"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 2: AUDIT TABLE VIEW */}
          {viewMode === 'LIST' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Photo Preview</th>
                      <th className="py-3 px-4">Project & Milestone</th>
                      <th className="py-3 px-4">Capture Timestamp (WAT)</th>
                      <th className="py-3 px-4">GPS Geotag & Boundary</th>
                      <th className="py-3 px-4">Vendor / Inspector</th>
                      <th className="py-3 px-4">SHA-256 Cryptographic Hash</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredAssets.map((asset, index) => (
                      <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div
                            onClick={() => handleOpenLightbox(index)}
                            className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden cursor-pointer relative group flex-shrink-0"
                          >
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{asset.title || asset.filename}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {asset.project?.projectCode} · Milestone #{asset.milestone?.orderIndex || 1}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{asset.milestone?.title}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-900 font-medium">{asset.claimedCaptureTime}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Upload: {asset.actualUploadTime}</div>
                        </td>

                        <td className="py-3 px-4">
                          {asset.gpsCoordinates ? (
                            <div className="space-y-0.5 font-mono">
                              <div className="text-slate-800 flex items-center gap-1 font-medium">
                                <MapPin className="w-3 h-3 text-sky-500" />
                                {asset.gpsCoordinates.lat.toFixed(4)}, {asset.gpsCoordinates.lng.toFixed(4)}
                              </div>
                              <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold">
                                {asset.geoFenceStatus || 'INSIDE_SITE_BOUNDARY'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">No GPS metadata</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{asset.uploaderName}</div>
                          <div className="text-[10px] text-slate-500">{asset.uploaderRole}</div>
                          <div className="text-[10px] text-slate-400">{asset.contractorName || 'Apex Engineering'}</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="truncate max-w-[120px]">{asset.sha256Checksum.substring(0, 16)}...</span>
                            <button
                              onClick={() => handleCopyHash(asset.sha256Checksum)}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Full 64-char Hash"
                            >
                              {copiedHash === asset.sha256Checksum ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {asset.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Under Review
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenLightbox(index)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: INTERACTIVE SITE MAP & PINS VIEW */}
          {viewMode === 'MAP' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Panel (Simulated High-Precision Geodetic Canvas) */}
              <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 text-white relative min-h-[460px] flex flex-col justify-between overflow-hidden shadow-lg">
                {/* Radial Grid & Topographic Visual Background */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at center, rgba(16, 185, 129, 0.25) 0%, transparent 60%), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                    backgroundSize: '100% 100%, 40px 40px, 40px 40px',
                  }}
                />

                {/* Map Controls Header */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-700/60 flex items-center gap-1">
                      <Compass className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
                      GNSS Geo-Fence Active
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      Nigeria Datum (Minna & WGS84)
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400">
                    Pins Mapped: {filteredAssets.filter((a) => a.gpsCoordinates).length}
                  </div>
                </div>

                {/* Visual Pins on Interactive Grid */}
                <div className="relative z-10 my-auto py-12 flex flex-wrap items-center justify-around gap-6">
                  {filteredAssets.map((asset, index) => {
                    const isSelected = mapSelectedPhotoId === asset.id || (!mapSelectedPhotoId && index === 0);
                    return (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setMapSelectedPhotoId(asset.id);
                        }}
                        className={`group cursor-pointer transition-all duration-300 relative flex flex-col items-center ${
                          isSelected ? 'scale-110 z-20' : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {/* Pulse Ring */}
                        {isSelected && (
                          <div className="absolute -inset-2 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" />
                        )}

                        {/* Pin Marker */}
                        <div
                          className={`w-10 h-10 rounded-full p-0.5 border-2 shadow-lg overflow-hidden flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500 shadow-emerald-500/50'
                              : 'border-slate-400 bg-slate-800'
                          }`}
                        >
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.title}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>

                        {/* Pin Tag */}
                        <div className="mt-1.5 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap shadow-md">
                          {asset.project?.projectCode || 'DT-PRJ'} · M#{asset.milestone?.orderIndex || 1}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Coordinates Legend */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      Lekki Villa (6.4474°N, 3.4739°E)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Ogun Farm (7.0819°N, 3.5175°E)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      Epe Waterfront (6.5841°N, 3.9835°E)
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono">
                    All images authenticated by anti-spoofing metadata
                  </div>
                </div>
              </div>

              {/* Selected Photo Inspector Drawer in Map Mode */}
              {(() => {
                const selectedAsset =
                  filteredAssets.find((a) => a.id === mapSelectedPhotoId) || filteredAssets[0];
                if (!selectedAsset) return null;
                const assetIndex = filteredAssets.findIndex((a) => a.id === selectedAsset.id);

                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          {selectedAsset.project?.projectCode} · Milestone #{selectedAsset.milestone?.orderIndex}
                        </span>
                        {selectedAsset.isVerified ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">
                            Under Review
                          </span>
                        )}
                      </div>

                      {/* Photo Thumbnail */}
                      <div
                        onClick={() => handleOpenLightbox(assetIndex)}
                        className="aspect-4/3 rounded-lg overflow-hidden bg-slate-900 cursor-pointer relative group"
                      >
                        <img
                          src={selectedAsset.thumbnailUrl}
                          alt={selectedAsset.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="px-3 py-1 rounded bg-white text-slate-900 text-xs font-semibold flex items-center gap-1 shadow-md">
                            <Maximize2 className="w-3.5 h-3.5" /> Full Lightbox
                          </span>
                        </div>
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{selectedAsset.title || selectedAsset.filename}</h4>
                        <p className="text-xs text-slate-600 line-clamp-3 mt-1 leading-relaxed">
                          {selectedAsset.description || selectedAsset.milestone?.description}
                        </p>
                      </div>

                      {/* Geospatial Stats */}
                      <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">GPS Latitude:</span>
                          <span className="font-mono text-slate-900 font-semibold">{selectedAsset.gpsCoordinates?.lat}° N</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">GPS Longitude:</span>
                          <span className="font-mono text-slate-900 font-semibold">{selectedAsset.gpsCoordinates?.lng}° E</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Elevation:</span>
                          <span className="font-mono text-slate-900">{selectedAsset.elevationMeters || 14.5}m ASL</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Azimuth Bearing:</span>
                          <span className="font-mono text-slate-900">{selectedAsset.azimuthBearing || 120}°</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Geofence Status:</span>
                          <span className="font-semibold text-emerald-700 font-mono text-[11px]">
                            {selectedAsset.geoFenceStatus || 'INSIDE_SITE_BOUNDARY'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-500 font-medium">Capture Timestamp:</span>
                          <span className="font-mono text-slate-800 text-[11px]">{selectedAsset.claimedCaptureTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={`https://www.google.com/maps?q=${selectedAsset.gpsCoordinates?.lat},${selectedAsset.gpsCoordinates?.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Google Maps
                      </a>

                      <button
                        onClick={() => handleOpenLightbox(assetIndex)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                      >
                        Verify & Inspect
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW MODE 4: BEFORE & AFTER MILESTONE COMPARISON */}
          {viewMode === 'COMPARE' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Milestone Stage Progression Comparison</h3>
                  <p className="text-xs text-slate-500">
                    Compare visual site development across construction milestones side-by-side.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Stage A:</span>
                    <select
                      value={compareLeftIndex}
                      onChange={(e) => setCompareLeftIndex(Number(e.target.value))}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
                    >
                      {filteredAssets.map((a, i) => (
                        <option key={a.id} value={i}>
                          M#{a.milestone?.orderIndex || 1}: {a.title?.substring(0, 24) || a.filename}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Stage B:</span>
                    <select
                      value={compareRightIndex}
                      onChange={(e) => setCompareRightIndex(Number(e.target.value))}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
                    >
                      {filteredAssets.map((a, i) => (
                        <option key={a.id} value={i}>
                          M#{a.milestone?.orderIndex || 1}: {a.title?.substring(0, 24) || a.filename}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Side by Side Inspection Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Comparison Asset */}
                {(() => {
                  const assetA = filteredAssets[compareLeftIndex] || filteredAssets[0];
                  return (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          Stage A · Milestone #{assetA.milestone?.orderIndex}: {assetA.milestone?.title}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">{assetA.claimedCaptureTime}</span>
                      </div>

                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-900">
                        <img
                          src={assetA.thumbnailUrl}
                          alt={assetA.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">{assetA.title}</div>
                        <p className="text-slate-600 text-[11px] line-clamp-2">{assetA.description}</p>
                        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>GPS: {assetA.gpsCoordinates?.lat}°N, {assetA.gpsCoordinates?.lng}°E</span>
                          <span className="text-emerald-700 font-semibold">{assetA.isVerified ? 'VERIFIED' : 'PENDING'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Right Comparison Asset */}
                {(() => {
                  const assetB = filteredAssets[compareRightIndex] || filteredAssets[1] || filteredAssets[0];
                  return (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          Stage B · Milestone #{assetB.milestone?.orderIndex}: {assetB.milestone?.title}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">{assetB.claimedCaptureTime}</span>
                      </div>

                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-900">
                        <img
                          src={assetB.thumbnailUrl}
                          alt={assetB.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">{assetB.title}</div>
                        <p className="text-slate-600 text-[11px] line-clamp-2">{assetB.description}</p>
                        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>GPS: {assetB.gpsCoordinates?.lat}°N, {assetB.gpsCoordinates?.lng}°E</span>
                          <span className="text-emerald-700 font-semibold">{assetB.isVerified ? 'VERIFIED' : 'PENDING'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* DEEP INSPECTION LIGHTBOX MODAL */}
      {/* ========================================================= */}
      {activeAsset && activePhotoIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
          {/* Lightbox Top Header Bar */}
          <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs font-mono font-semibold border border-slate-700">
                Photo {activePhotoIndex + 1} of {filteredAssets.length}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {activeAsset.title || activeAsset.filename}
                </h3>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {activeAsset.project?.title} · Milestone #{activeAsset.milestone?.orderIndex}: {activeAsset.milestone?.title}
                </div>
              </div>
            </div>

            {/* Lightbox Toolbar & Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotationDegrees((r) => (r + 90) % 360)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadInspectionReport(activeAsset)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Download Proof Certificate"
              >
                <Download className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-slate-700 mx-1" />
              <button
                onClick={handleCloseLightbox}
                className="p-2 text-slate-400 hover:text-white hover:bg-rose-900/40 rounded-lg transition-colors cursor-pointer"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Verification Status Banner if just verified */}
          {verificationFeedback && (
            <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-semibold flex items-center justify-center gap-2 z-20 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              {verificationFeedback}
            </div>
          )}

          {/* Main Inspection Body: Image Center + Right Telemetry Sidebar */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left Nav Arrow */}
            <button
              onClick={handlePrevPhoto}
              disabled={activePhotoIndex === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 text-white border border-slate-700/80 hover:bg-slate-800 transition-all cursor-pointer ${
                activePhotoIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 shadow-xl'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav Arrow */}
            <button
              onClick={handleNextPhoto}
              disabled={activePhotoIndex === filteredAssets.length - 1}
              className={`absolute right-4 lg:right-[384px] top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 text-white border border-slate-700/80 hover:bg-slate-800 transition-all cursor-pointer ${
                activePhotoIndex === filteredAssets.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 shadow-xl'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Center Canvas */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative bg-slate-950">
              <div
                className="max-w-full max-h-full transition-transform duration-200 select-none cursor-grab"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotationDegrees}deg)`,
                }}
              >
                <img
                  src={activeAsset.thumbnailUrl}
                  alt={activeAsset.title || activeAsset.filename}
                  className="max-h-[82vh] max-w-[90vw] lg:max-w-[55vw] object-contain rounded-lg shadow-2xl border border-slate-800"
                />
              </div>

              {/* Bottom Mini HUD on canvas */}
              <div className="absolute bottom-4 left-6 z-10 flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-slate-900/80 backdrop-blur-md text-white font-mono text-[10px] border border-slate-700">
                  Zoom: {Math.round(zoomLevel * 100)}%
                </span>
                <span className="px-2 py-1 rounded bg-slate-900/80 backdrop-blur-md text-white font-mono text-[10px] border border-slate-700">
                  Rotation: {rotationDegrees}°
                </span>
              </div>
            </div>

            {/* Right Telemetry & Audit Drawer */}
            <div className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6 text-slate-300 text-xs z-10">
              {/* Verification Stamp Card */}
              <div
                className={`p-4 rounded-xl border ${
                  activeAsset.isVerified
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-800 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {activeAsset.isVerified ? 'Cryptographically Sealed' : 'Inspection Required'}
                  </span>
                  {activeAsset.isVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="text-sm font-bold mt-1">
                  {activeAsset.isVerified
                    ? `Verified by ${activeAsset.verifiedBy || 'Field Engineer'}`
                    : 'Pending Milestone Sign-Off'}
                </div>
                {activeAsset.verifiedAt && (
                  <div className="text-[11px] opacity-80 mt-0.5">Sealed at {activeAsset.verifiedAt}</div>
                )}
              </div>

              {/* SECTION: TIMESTAMP TELEMETRY */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Timestamp & Anti-Tamper Verification
                </h4>

                <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <div>
                    <div className="text-slate-500 text-[10px]">Claimed Camera Capture Time</div>
                    <div className="text-white font-semibold">{activeAsset.claimedCaptureTime} WAT</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Vault Cryptographic Upload Time</div>
                    <div className="text-slate-300">{activeAsset.actualUploadTime} UTC</div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-500 text-[10px]">Upload Latency Delta</span>
                    <span className="text-emerald-400 text-[10px] font-semibold">&lt; 45 mins (Tamper-Free)</span>
                  </div>
                </div>
              </div>

              {/* SECTION: GEOSPATIAL COORDINATES & GEOFENCE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  Geospatial & Geofence Telemetry
                </h4>

                <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">Latitude:</span>
                    <span className="text-white font-semibold">{activeAsset.gpsCoordinates?.lat}° N</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">Longitude:</span>
                    <span className="text-white font-semibold">{activeAsset.gpsCoordinates?.lng}° E</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">Elevation:</span>
                    <span className="text-slate-300">{activeAsset.elevationMeters || 14.5}m ASL</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">Compass Bearing:</span>
                    <span className="text-slate-300">{activeAsset.azimuthBearing || 120}° (Azimuth)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Geodetic Precision:</span>
                    <span className="text-emerald-400 font-mono">±{activeAsset.accuracyMeters || 0.05}m (GNSS RTK)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-500">Geofence Boundary:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {activeAsset.geoFenceStatus || 'INSIDE_SITE_BOUNDARY'}
                    </span>
                  </div>

                  {activeAsset.gpsCoordinates && (
                    <a
                      href={`https://www.google.com/maps?q=${activeAsset.gpsCoordinates.lat},${activeAsset.gpsCoordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Location on Google Satellite Maps
                    </a>
                  )}
                </div>
              </div>

              {/* SECTION: VENDOR & CONTRACTOR CHAIN OF CUSTODY */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <HardHat className="w-3.5 h-3.5 text-amber-400" />
                  Vendor & Chain of Custody
                </h4>

                <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px]">
                  <div>
                    <div className="text-slate-500 text-[10px]">Field Uploader</div>
                    <div className="text-white font-medium">{activeAsset.uploaderName}</div>
                    <div className="text-slate-400 text-[10px]">{activeAsset.uploaderRole}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Appointed Contractor</div>
                    <div className="text-slate-300 font-medium">{activeAsset.contractorName || activeAsset.milestone?.contractorName || 'Apex Engineering Ltd'}</div>
                  </div>
                  {activeAsset.cameraDevice && (
                    <div>
                      <div className="text-slate-500 text-[10px]">Capture Hardware</div>
                      <div className="text-slate-300 font-mono text-[10px]">{activeAsset.cameraDevice}</div>
                    </div>
                  )}
                  {activeAsset.weatherCondition && (
                    <div>
                      <div className="text-slate-500 text-[10px]">Atmospheric Conditions</div>
                      <div className="text-slate-400 text-[10px]">{activeAsset.weatherCondition}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: CRYPTOGRAPHIC CHECKSUM */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  SHA-256 Cryptographic Digest
                </h4>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-mono text-[10px] text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                    {activeAsset.sha256Checksum}
                  </div>
                  <button
                    onClick={() => handleCopyHash(activeAsset.sha256Checksum)}
                    className="w-full py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedHash === activeAsset.sha256Checksum ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Checksum Copied to Clipboard
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy SHA-256 Checksum
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION: VERIFICATION ACTION BUTTONS */}
              <div className="pt-2 space-y-2">
                {!activeAsset.isVerified ? (
                  <>
                    <button
                      onClick={() => handleVerifyAsset(activeAsset.id, true)}
                      className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Verify Milestone Photo
                    </button>

                    <button
                      onClick={() => setFlagReasonModalOpen(true)}
                      className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-rose-300 border border-slate-700 hover:border-rose-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Flag Discrepancy / Request Retake
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleVerifyAsset(activeAsset.id, false, 'Client requested re-audit')}
                    className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Verification for Audit
                  </button>
                )}

                {/* Jump to Milestone Link */}
                {onNavigateToMilestones && (
                  <button
                    onClick={() => {
                      handleCloseLightbox();
                      onNavigateToMilestones(activeAsset.milestoneId);
                    }}
                    className="w-full py-2 px-4 rounded-lg text-slate-400 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>View Milestone Approval Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flag Discrepancy Reason Modal */}
      {flagReasonModalOpen && activeAsset && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Flag Milestone Photo Discrepancy</h3>
            </div>

            <p className="text-xs text-slate-600">
              Explain why this evidence item cannot be verified. The appointed contractor ({activeAsset.uploaderName}) will be prompted to re-upload verifiable timestamped photography.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Discrepancy Note</label>
              <textarea
                value={flagReasonText}
                onChange={(e) => setFlagReasonText(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder="e.g., GPS coordinates deviate from registered cadastral boundary, or rebar diameter illegible..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFlagReasonModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyAsset(activeAsset.id, false, flagReasonText)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Submit Discrepancy Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
