import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { BODY_PARTS, EXAMINATION_TOOLS } from "@/lib/osce-types";

interface PhysicalExamProps {
  session: any;
  osceCase: any;
  onOpenTests: () => void;
}

export default function PhysicalExam({ session, osceCase, onOpenTests }: PhysicalExamProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const examineMutation = useMutation({
    mutationFn: async ({ bodyPart, examinationType }: { bodyPart: string; examinationType: string }) => {
      const response = await apiRequest("POST", `/api/sessions/${session.id}/examine`, {
        bodyPart,
        examinationType
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id] });
    }
  });

  const performExamination = (bodyPart: string, examinationType: string) => {
    examineMutation.mutate({ bodyPart, examinationType });
  };

  const getFindings = () => {
    return Object.entries(session.physicalFindings || {}).map(([key, finding]: [string, any]) => {
      const [bodyPart, examType] = key.split('_');
      return {
        id: key,
        bodyPart: bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1),
        examType: examType.charAt(0).toUpperCase() + examType.slice(1),
        finding: finding.finding,
        normal: finding.normal,
        timestamp: finding.timestamp
      };
    });
  };

  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Body Diagram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-male mr-2 text-primary"></i>
                Interactive Body Examination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="w-full h-96 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center body-diagram">
                  <div className="text-center">
                    <i className="fas fa-male text-6xl text-muted-foreground mb-3"></i>
                    <p className="text-sm text-muted-foreground mb-4">Click on body parts to examine</p>
                    <div className="grid grid-cols-2 gap-2 text-xs max-w-xs mx-auto">
                      {BODY_PARTS.map((part) => (
                        <Button
                          key={part.id}
                          variant="outline"
                          size="sm"
                          className="p-2 hover:bg-accent"
                          onClick={() => setSelectedBodyPart(part.id)}
                          data-testid={`button-body-part-${part.id}`}
                        >
                          {part.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Examination Actions for Selected Body Part */}
                {selectedBodyPart && (
                  <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-medium text-sm mb-3">
                      Examine: {BODY_PARTS.find(p => p.id === selectedBodyPart)?.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {BODY_PARTS.find(p => p.id === selectedBodyPart)?.examinations.map((exam) => (
                        <Button
                          key={exam}
                          size="sm"
                          onClick={() => performExamination(selectedBodyPart, exam)}
                          disabled={examineMutation.isPending}
                          data-testid={`button-exam-${exam}`}
                        >
                          <i className={`fas fa-${exam === 'inspection' ? 'search' : exam === 'palpation' ? 'hand-paper' : exam === 'percussion' ? 'hand-fist' : 'stethoscope'} mr-1`}></i>
                          {exam.charAt(0).toUpperCase() + exam.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Examination Tools & Findings */}
          <div className="space-y-6">
            {/* Available Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-toolbox mr-2 text-primary"></i>
                  Examination Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {EXAMINATION_TOOLS.map((tool) => (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "outline"}
                      className="p-3 h-auto flex-col"
                      onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                      data-testid={`button-tool-${tool.id}`}
                    >
                      <i className={`${tool.icon} text-primary mb-2 text-lg`}></i>
                      <span className="text-xs font-medium">{tool.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Findings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-clipboard-list mr-2 text-primary"></i>
                  Examination Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getFindings().length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No examination findings yet. Start by examining the patient.
                    </p>
                  ) : (
                    getFindings().map((finding) => (
                      <div 
                        key={finding.id} 
                        className={`p-3 rounded-lg ${finding.normal ? 'bg-muted' : 'bg-warning/10 border border-warning/20'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-sm text-foreground" data-testid={`text-finding-${finding.id}`}>
                              {finding.bodyPart} - {finding.examType}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {finding.finding}
                            </div>
                          </div>
                          <Badge variant={finding.normal ? "default" : "destructive"} className="text-xs">
                            {finding.normal ? "Normal" : "Abnormal"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    onClick={onOpenTests} 
                    className="w-full justify-start"
                    data-testid="button-order-tests"
                  >
                    <i className="fas fa-vial mr-2"></i>Order Tests
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    data-testid="button-record-finding"
                  >
                    <i className="fas fa-plus mr-2"></i>Record Custom Finding
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
