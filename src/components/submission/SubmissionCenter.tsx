import React, { useState, useEffect } from 'react';
import { ProgressStepper } from './ProgressStepper';
import { ProjectForm } from './ProjectForm';
import { FileUploader } from './FileUploader';
import { ModeSelector } from './ModeSelector';
import { ReviewPanel } from './ReviewPanel';
import { 
  type SubmissionDraft, 
  INITIAL_SUBMISSION_DRAFT 
} from '../../types/submission';
import { EvaluationModal } from '../EvaluationModal';

interface SubmissionCenterProps {
  onBackToLanding: () => void;
}

const STORAGE_KEY = 'project_xray_submission_draft_v1';

export const SubmissionCenter: React.FC<SubmissionCenterProps> = ({ onBackToLanding }) => {
  const [draft, setDraft] = useState<SubmissionDraft>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_SUBMISSION_DRAFT;
  });

  const [currentStep, setCurrentStep] = useState<number>(draft.step || 1);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEvaluationRunning, setIsEvaluationRunning] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Autosave to localStorage on state changes
  useEffect(() => {
    try {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const draftToSave = { ...draft, step: currentStep, lastSaved: now };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftToSave));
      setLastSavedTime(now);
    } catch {
      // Ignore storage errors
    }
  }, [draft, currentStep]);

  const updateDraft = (fields: Partial<SubmissionDraft>) => {
    setDraft((prev) => ({ ...prev, ...fields }));
    // Clear errors for fields updated
    const newErrors = { ...errors };
    Object.keys(fields).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!draft.projectName.trim()) {
      errs.projectName = 'Project name is required';
    }
    if (!draft.problemStatement.trim()) {
      errs.problemStatement = 'Problem statement is required';
    }
    if (!draft.projectDescription.trim()) {
      errs.projectDescription = 'Technical architecture description is required';
    }
    if (!draft.teamName.trim()) {
      errs.teamName = 'Team name is required';
    }
    if (!draft.leadName.trim()) {
      errs.leadName = 'Lead architect name is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!draft.githubUrl.trim()) {
      errs.githubUrl = 'GitHub repository URL is required for code/firmware verification';
    } else if (!draft.githubUrl.includes('github.com') && !draft.githubUrl.includes('gitlab.com')) {
      errs.githubUrl = 'Please provide a valid GitHub or GitLab repository URL';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepNum: number) => {
    // Validate if skipping forward
    if (stepNum > currentStep) {
      if (currentStep === 1 && !validateStep1()) return;
      if (currentStep === 2 && !validateStep2()) return;
    }
    setCurrentStep(stepNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEvaluation = () => {
    setIsEvaluationRunning(true);
    setTimeout(() => {
      setIsEvaluationRunning(false);
      setShowEvaluationModal(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-24">
      {/* 4-Step Header & Progress Stepper */}
      <ProgressStepper
        currentStep={currentStep}
        totalSteps={4}
        onStepClick={handleStepClick}
        lastSaved={lastSavedTime}
        onBackToLanding={onBackToLanding}
      />

      {/* Main Form Center Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-3xl bg-[#090D16]/90 border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          {currentStep === 1 && (
            <ProjectForm
              draft={draft}
              onChange={updateDraft}
              onNext={handleNextStep}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <FileUploader
              draft={draft}
              onChange={updateDraft}
              onNext={handleNextStep}
              onBack={handlePrevStep}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <ModeSelector
              draft={draft}
              onChange={updateDraft}
              onNext={handleNextStep}
              onBack={handlePrevStep}
            />
          )}

          {currentStep === 4 && (
            <ReviewPanel
              draft={draft}
              onBack={handlePrevStep}
              onEditStep={handleStepClick}
              onStartEvaluation={handleStartEvaluation}
              isStarting={isEvaluationRunning}
            />
          )}
        </div>
      </div>

      {/* Interactive Jury Simulation Modal */}
      <EvaluationModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
      />
    </div>
  );
};
