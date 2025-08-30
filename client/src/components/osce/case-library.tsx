import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export default function CaseLibrary() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["/api/cases"],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (caseId: string) => {
      const response = await apiRequest("POST", "/api/sessions", {
        caseId,
        currentStage: "history",
        timeRemaining: 1800 // 30 minutes
      });
      return response.json();
    },
    onSuccess: (session) => {
      setLocation(`/simulator/${session.id}`);
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-stethoscope text-primary-foreground text-xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-foreground">OSCE Simulator</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-2">Medical Training Platform</p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Practice your clinical skills with AI-powered patient interactions, comprehensive examinations, 
              and realistic medical scenarios designed for medical students and healthcare professionals.
            </p>
          </div>
        </div>
      </div>

      {/* Case Library */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Available OSCE Cases</h2>
          <p className="text-muted-foreground">Select a case to begin your OSCE simulation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((osceCase: any) => (
            <Card key={osceCase.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-case-title-${osceCase.id}`}>
                      {osceCase.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {osceCase.id.slice(0, 8)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    30 min
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground" data-testid={`text-case-description-${osceCase.id}`}>
                    {osceCase.description}
                  </p>
                  
                  {/* Patient Info Preview */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs font-medium text-foreground mb-2">Patient Information</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{osceCase.patientInfo.name}</div>
                      <div>{osceCase.patientInfo.age}yo {osceCase.patientInfo.gender}</div>
                      <div className="font-medium">{osceCase.patientInfo.chiefComplaint}</div>
                    </div>
                  </div>

                  {/* Case Statistics */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{osceCase.differentialDiagnoses?.length || 0} differentials</span>
                    <span>{osceCase.availableTests?.length || 0} available tests</span>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => createSessionMutation.mutate(osceCase.id)}
                    disabled={createSessionMutation.isPending}
                    data-testid={`button-start-case-${osceCase.id}`}
                  >
                    {createSessionMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Starting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play mr-2"></i>
                        Start OSCE
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {cases.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-folder-open text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-lg font-medium text-foreground mb-2">No cases available</h3>
            <p className="text-muted-foreground">Cases will appear here when they are added to the system.</p>
          </div>
        )}
      </div>
    </div>
  );
}
