import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import OsceSidebar from "@/components/osce/sidebar";
import PatientChat from "@/components/osce/patient-chat";
import PhysicalExam from "@/components/osce/physical-exam";
import TestOrdering from "@/components/osce/test-ordering";
import DiagnosisModal from "@/components/osce/diagnosis-modal";
import TreatmentPlan from "@/components/osce/treatment-plan";
import { Button } from "@/components/ui/button";
import { OSCE_STAGES, type OsceStage } from "@/lib/osce-types";

export default function OsceSimulator() {
  const [, params] = useRoute("/simulator/:sessionId");
  const sessionId = params?.sessionId;
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const { data: session, isLoading } = useQuery({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const { data: osceCase } = useQuery({
    queryKey: ["/api/cases", session?.caseId],
    enabled: !!session?.caseId,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading OSCE session...</p>
        </div>
      </div>
    );
  }

  if (!session || !osceCase) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Session not found</p>
        </div>
      </div>
    );
  }

  const currentStageIndex = OSCE_STAGES.findIndex(stage => stage.id === session.currentStage);
  const currentStage = OSCE_STAGES[currentStageIndex];

  const renderMainContent = () => {
    switch (session.currentStage as OsceStage) {
      case "history":
      case "physical":
        return <PhysicalExam session={session} osceCase={osceCase} onOpenTests={() => setShowTestModal(true)} />;
      case "tests":
      case "imaging":
        return <TestOrdering session={session} osceCase={osceCase} />;
      case "diagnosis":
        return (
          <div className="flex-1 flex items-center justify-center">
            <Button 
              onClick={() => setShowDiagnosisModal(true)}
              className="px-8 py-4 text-lg"
              data-testid="button-open-diagnosis"
            >
              Open Diagnosis Interface
            </Button>
          </div>
        );
      case "treatment":
        return <TreatmentPlan session={session} osceCase={osceCase} />;
      default:
        return <PhysicalExam session={session} osceCase={osceCase} onOpenTests={() => setShowTestModal(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <OsceSidebar 
        session={session} 
        osceCase={osceCase}
        onOpenTests={() => setShowTestModal(true)}
        onOpenDiagnosis={() => setShowDiagnosisModal(true)}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground" data-testid="text-current-stage">
              {currentStage?.name}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Current Stage
              </span>
              <span className="text-sm text-muted-foreground" data-testid="text-stage-progress">
                {currentStageIndex + 1} of {OSCE_STAGES.length}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" data-testid="button-hints">
              <i className="fas fa-lightbulb mr-1"></i>Hints
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-notes">
              <i className="fas fa-sticky-note mr-1"></i>Notes
            </Button>
            <Button 
              className="bg-success hover:bg-success/90 text-white"
              data-testid="button-complete-stage"
            >
              Complete Stage
            </Button>
          </div>
        </div>

        {renderMainContent()}
      </div>

      <PatientChat session={session} osceCase={osceCase} />

      {showTestModal && (
        <TestOrdering 
          session={session} 
          osceCase={osceCase} 
          onClose={() => setShowTestModal(false)}
        />
      )}

      {showDiagnosisModal && (
        <DiagnosisModal 
          session={session} 
          osceCase={osceCase} 
          onClose={() => setShowDiagnosisModal(false)}
        />
      )}
    </div>
  );
}
