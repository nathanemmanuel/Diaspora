import React, { useState } from 'react';
import { Project, Milestone } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Camera,
  MapPin,
  Calendar,
  Building2,
  Sprout,
  FileText,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  Filter
} from 'lucide-react';

interface ProjectMilestoneTrackerProps {
  projects: Project[];
  milestones: Milestone[];
  onInspectMilestone: (milestone: Milestone) => void;
  initialProjectId?: string;
}

export const ProjectMilestoneTracker: React.FC<ProjectMilestoneTrackerProps> = ({
  projects,
  milestones,
  onInspectMilestone,
  initialProjectId,
}) => {
  const { format, currency } = useCurrency();

  // Filter only active or planning investments
  const activeProjects = projects.filter(
    (p) => p.status === 'ACTIVE_EXECUTION' || p.status === 'PLANNING' || p.status === 'PENDING_INSPECTION'
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || activeProjects[0]?.id || projects[0]?.id || ''
  );
  const [filterState, setFilterState] = useState<'ALL' | 'ACTION_REQUIRED' | 'COMPLETED' | 'IN_PROGRESS'>('ALL');

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || activeProjects[0] || projects[0];
  const projectMilestones = milestones.filter((m) => m.projectId === selectedProject?.id);

  // Milestone breakdown
  const completedCount = projectMilestones.filter((m) => m.status === 'CLIENT_APPROVED').length;
  const actionRequiredMilestones = projectMilestones.filter((m) => m.status === 'INTERNAL_VERIFIED');
  const inProgressMilestones = projectMilestones.filter((m) => m.status === 'IN_PROGRESS' || m.status === 'SUBMITTED_FOR_REVIEW');

  // Filtered milestones list
  const displayMilestones = projectMilestones.filter((m) => {
    if (filterState === 'ACTION_REQUIRED') return m.status === 'INTERNAL_VERIFIED';
    if (filterState === 'COMPLETED') return m.status === 'CLIENT_APPROVED';
    if (filterState === 'IN_PROGRESS') return m.status === 'IN_PROGRESS' || m.status === 'SUBMITTED_FOR_REVIEW';
    return true;
  });

  // Next upcoming milestone
  const nextMilestone = projectMilestones.find(
    (m) => m.status === 'INTERNAL_VERIFIED' || m.status === 'IN_PROGRESS' || m.status === 'PENDING'
  );

  if (!selectedProject) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header & Project Selector */}
      <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active Investment Milestone Tracking</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              {selectedProject.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5">
              <span className="font-mono text-slate-400">{selectedProject.projectCode}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {selectedProject.locationCity}, {selectedProject.locationState}
              </span>
              <span>·</span>
              <span>Lead: <strong className="text-white font-medium">{selectedProject.leadEngineer}</strong></span>
            </div>
          </div>

          {/* Investment Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700 overflow-x-auto">
            {activeProjects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  selectedProjectId === proj.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {proj.projectType === 'CONSTRUCTION' && '🏗️ '}
                {proj.projectType === 'AGRICULTURE' && '🌱 '}
                {proj.projectType === 'LAND_ACQUISITION' && '📜 '}
                {proj.projectCode} ({proj.progressPercent}%)
              </button>
            ))}
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              Overall Investment Completion
              {selectedProject.progressPercent >= 60 ? (
                <span className="text-[10px] text-emerald-400 font-mono">On Schedule</span>
              ) : (
                <span className="text-[10px] text-amber-400 font-mono">Active Phase</span>
              )}
            </span>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="text-sm font-bold text-emerald-400">{selectedProject.progressPercent}%</span>
              <span className="text-slate-400">({completedCount} of {projectMilestones.length} Milestones)</span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${selectedProject.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI & Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/70 border-b border-slate-200 text-xs">
        <div className="p-4 space-y-1">
          <div className="text-slate-500 font-medium">Approved Budget ({currency})</div>
          <div className="font-mono text-base font-bold text-slate-900 tabular-nums">
            {format(selectedProject.approvedBudget, selectedProject.currency)}
          </div>
          <div className="text-[11px] text-slate-500">Supervised Capital Allocation</div>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-slate-500 font-medium">Recorded Payouts ({currency})</div>
          <div className="font-mono text-base font-bold text-emerald-700 tabular-nums">
            {format(selectedProject.actualExpenditure, selectedProject.currency)}
          </div>
          <div className="text-[11px] text-slate-500">Certified Milestone Releases</div>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-slate-500 font-medium">Action Required</div>
          <div className="font-mono text-base font-bold text-amber-700 tabular-nums flex items-center gap-1.5">
            {actionRequiredMilestones.length}
            {actionRequiredMilestones.length > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-sans px-1.5 py-0.5 rounded font-semibold">
                Needs Approval
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            {actionRequiredMilestones.length > 0 ? 'Ready for client review' : 'All reviews current'}
          </div>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-slate-500 font-medium">Next Milestone Target</div>
          <div className="font-medium text-slate-800 truncate" title={nextMilestone?.title}>
            {nextMilestone?.title || 'Project Handover Complete'}
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {nextMilestone?.plannedDueDate || 'Completed'}
          </div>
        </div>
      </div>

      {/* Filter Tabs for Milestones */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: `All Milestones (${projectMilestones.length})` },
            { id: 'ACTION_REQUIRED', label: `Action Required (${actionRequiredMilestones.length})` },
            { id: 'COMPLETED', label: `Completed (${completedCount})` },
            { id: 'IN_PROGRESS', label: `In Progress (${inProgressMilestones.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterState(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filterState === tab.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Showing {displayMilestones.length} of {projectMilestones.length} milestones
        </div>
      </div>

      {/* Timeline Steps & Status Updates */}
      <div className="p-6 divide-y divide-slate-100">
        {displayMilestones.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No milestones found matching the selected filter.
          </div>
        ) : (
          displayMilestones.map((milestone) => {
            const isApproved = milestone.status === 'CLIENT_APPROVED';
            const isReadyForClient = milestone.status === 'INTERNAL_VERIFIED';
            const isInProgress = milestone.status === 'IN_PROGRESS' || milestone.status === 'SUBMITTED_FOR_REVIEW';

            return (
              <div key={milestone.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Step Indicator & Header */}
                  <div className="flex items-start gap-3 flex-1">
                    {/* Circle badge */}
                    <div className="mt-0.5 shrink-0">
                      {isApproved ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isReadyForClient ? (
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300 animate-pulse">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      ) : isInProgress ? (
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                          0{milestone.orderIndex}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs font-mono">
                          0{milestone.orderIndex}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 font-semibold">
                          Phase 0{milestone.orderIndex}
                        </span>
                        <span>·</span>
                        <h3 className="text-sm font-bold text-slate-900">{milestone.title}</h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isReadyForClient
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                              : isInProgress
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {milestone.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Financial & Progress Info */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 pl-11 md:pl-0 shrink-0">
                    <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {format(milestone.allocatedBudgetNgn, 'NGN')}
                    </div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">
                      Progress: <strong className="text-slate-800">{milestone.percentProgress}%</strong>
                    </div>
                  </div>
                </div>

                {/* Progress bar per milestone */}
                <div className="pl-11 pr-2">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isApproved
                          ? 'bg-emerald-500'
                          : isReadyForClient
                          ? 'bg-amber-500'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${milestone.percentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Status Update & QA Verification Notes Box */}
                <div className="pl-11 space-y-2">
                  {milestone.internalVerification ? (
                    <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-950 font-semibold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          COREN Engineering Inspection Certified
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {milestone.internalVerification.verifiedAt}
                        </span>
                      </div>
                      <p className="text-emerald-900 text-xs leading-relaxed italic">
                        "{milestone.internalVerification.notes}"
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-emerald-800 pt-1 border-t border-emerald-200/60">
                        <span>Verifier: <strong>{milestone.internalVerification.verifiedBy}</strong></span>
                        <span>·</span>
                        <span>Physical Site Visit: <strong>Confirmed</strong></span>
                        <span>·</span>
                        <span>Cadastral GPS Coordinates: <strong>Verified</strong></span>
                      </div>
                    </div>
                  ) : milestone.clientDecision ? (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-[11px] text-slate-800">
                        <span className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Client Decision: Approved
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {milestone.clientDecision.decidedAt}
                        </span>
                      </div>
                      {milestone.clientDecision.comments && (
                        <p className="text-slate-600 text-xs italic">
                          "{milestone.clientDecision.comments}"
                        </p>
                      )}
                    </div>
                  ) : isInProgress ? (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Work actively in progress on site by {milestone.contractorName}.</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">Due: {milestone.plannedDueDate}</span>
                    </div>
                  ) : null}

                  {/* Actions & Evidence Thumbnails */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-slate-400" />
                        {milestone.evidenceItems.length} Evidence Assets
                      </span>
                      <span>·</span>
                      <span>Contractor: <strong className="text-slate-700">{milestone.contractorName}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isReadyForClient ? (
                        <button
                          onClick={() => onInspectMilestone(milestone)}
                          className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-amber-300 hover:bg-amber-400 rounded-md transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-900" />
                          Review Evidence & Decide
                        </button>
                      ) : (
                        <button
                          onClick={() => onInspectMilestone(milestone)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                        >
                          View Inspection Evidence
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
