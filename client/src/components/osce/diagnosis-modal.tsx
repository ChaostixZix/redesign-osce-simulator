import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface DiagnosisModalProps {
  session: any;
  osceCase: any;
  onClose: () => void;
}

export default function DiagnosisModal({ session, osceCase, onClose }: DiagnosisModalProps) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [reasoning, setReasoning] = useState("");
  const queryClient = useQueryClient();

  const submitDiagnosisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/sessions/${session.id}`, {
        selectedDiagnosis,
        diagnosisReasoning: reasoning,
        currentStage: "treatment"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id] });
      onClose();
    }
  });

  const getClinicalSummary = () => {
    const findings = Object.values(session.physicalFindings || {});
    const abnormalFindings = findings.filter((f: any) => !f.normal);
    
    return {
      chiefComplaint: osceCase.patientInfo.chiefComplaint,
      keyFindings: abnormalFindings.length > 0 ? abnormalFindings[0].finding : "No abnormal findings documented",
      testResults: "Available test results" // This would be populated from actual test results
    };
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case "high":
        return "text-success";
      case "medium":
        return "text-warning";
      case "low":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const summary = getClinicalSummary();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Diagnosis & Differential</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-100px)] p-1">
          {/* Clinical Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium text-foreground mb-3">Clinical Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-foreground mb-1">Chief Complaint</div>
                <div className="text-muted-foreground" data-testid="text-chief-complaint">
                  {summary.chiefComplaint}
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">Key Findings</div>
                <div className="text-muted-foreground" data-testid="text-key-findings">
                  {summary.keyFindings}
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">Test Results</div>
                <div className="text-muted-foreground" data-testid="text-test-results">
                  {summary.testResults}
                </div>
              </div>
            </div>
          </div>

          {/* Differential Diagnosis */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Differential Diagnosis</h3>
            <RadioGroup value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
              <div className="space-y-3">
                {osceCase.differentialDiagnoses?.map((diff: any, index: number) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem 
                          value={diff.diagnosis} 
                          id={`diagnosis-${index}`}
                          data-testid={`radio-diagnosis-${index}`}
                        />
                        <Label 
                          htmlFor={`diagnosis-${index}`}
                          className="font-medium text-foreground cursor-pointer"
                        >
                          {diff.diagnosis}
                        </Label>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getProbabilityColor(diff.probability)}
                      >
                        {diff.probability} probability
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground ml-7">
                      ICD-10: {diff.icd10}
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Diagnosis Justification */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Clinical Reasoning</h3>
            <Textarea 
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              className="w-full h-24 resize-none"
              placeholder="Explain your diagnostic reasoning, including supporting and opposing evidence..."
              data-testid="textarea-diagnosis-reasoning"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-border">
            <Button
              onClick={() => submitDiagnosisMutation.mutate()}
              disabled={!selectedDiagnosis || submitDiagnosisMutation.isPending}
              className="flex-1"
              data-testid="button-submit-diagnosis"
            >
              {submitDiagnosisMutation.isPending ? "Submitting..." : "Submit Diagnosis"}
            </Button>
            <Button 
              variant="outline"
              data-testid="button-save-draft"
            >
              Save Draft
            </Button>
            <Button 
              variant="secondary"
              data-testid="button-get-hints"
            >
              Get Hints
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
