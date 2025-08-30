import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";

interface TreatmentPlanProps {
  session: any;
  osceCase: any;
}

export default function TreatmentPlan({ session, osceCase }: TreatmentPlanProps) {
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  const [instructions, setInstructions] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const saveTreatmentPlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/sessions/${session.id}`, {
        treatmentPlan: {
          medications,
          instructions,
          followUp,
          lifestyle,
          completed: true
        },
        completed: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id] });
    }
  });

  const addMedication = () => {
    if (newMedication.trim()) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const lifestyleOptions = [
    "Diet modification",
    "Exercise program",
    "Smoking cessation",
    "Weight management",
    "Stress reduction",
    "Sleep hygiene"
  ];

  const toggleLifestyle = (option: string) => {
    setLifestyle(prev => 
      prev.includes(option) 
        ? prev.filter(l => l !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Treatment Plan Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-file-medical mr-2 text-primary"></i>
              Treatment & Management Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-foreground mb-1">Selected Diagnosis</div>
                <div className="text-muted-foreground" data-testid="text-selected-diagnosis">
                  {session.selectedDiagnosis || "No diagnosis selected"}
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">Patient</div>
                <div className="text-muted-foreground">
                  {osceCase.patientInfo.name}, {osceCase.patientInfo.age}yo {osceCase.patientInfo.gender}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle>Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add medication (e.g., Aspirin 81mg daily)"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  data-testid="input-new-medication"
                />
                <Button 
                  onClick={addMedication}
                  disabled={!newMedication.trim()}
                  data-testid="button-add-medication"
                >
                  Add
                </Button>
              </div>
              
              {medications.length > 0 && (
                <div className="space-y-2">
                  {medications.map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm" data-testid={`text-medication-${index}`}>{med}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-destructive"
                        data-testid={`button-remove-medication-${index}`}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide detailed instructions for the patient regarding their condition, medications, and care..."
              className="h-32 resize-none"
              data-testid="textarea-patient-instructions"
            />
          </CardContent>
        </Card>

        {/* Lifestyle Modifications */}
        <Card>
          <CardHeader>
            <CardTitle>Lifestyle Modifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lifestyleOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lifestyle-${option}`}
                    checked={lifestyle.includes(option)}
                    onCheckedChange={() => toggleLifestyle(option)}
                    data-testid={`checkbox-lifestyle-${option.replace(/\s+/g, '-').toLowerCase()}`}
                  />
                  <Label 
                    htmlFor={`lifestyle-${option}`}
                    className="text-sm cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Describe follow-up appointments, monitoring requirements, and when to return..."
              className="h-24 resize-none"
              data-testid="textarea-followup-plan"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-3 pb-6">
          <Button
            onClick={() => saveTreatmentPlanMutation.mutate()}
            disabled={saveTreatmentPlanMutation.isPending}
            className="flex-1"
            data-testid="button-complete-osce"
          >
            {saveTreatmentPlanMutation.isPending ? "Completing..." : "Complete OSCE"}
          </Button>
          <Button 
            variant="outline"
            data-testid="button-save-treatment-draft"
          >
            Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
