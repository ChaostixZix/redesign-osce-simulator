import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OSCE_STAGES } from "@/lib/osce-types";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useState } from "react";

interface OsceSidebarProps {
  session: any;
  osceCase: any;
  onOpenTests: () => void;
  onOpenDiagnosis: () => void;
}

export default function OsceSidebar({ session, osceCase, onOpenTests, onOpenDiagnosis }: OsceSidebarProps) {
  const [timeRemaining, setTimeRemaining] = useState(session.timeRemaining);
  const queryClient = useQueryClient();

  const pauseSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/sessions/${session.id}`, {
        timeRemaining: timeRemaining
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id] });
    }
  });

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev: number) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageStatus = (stageId: string) => {
    const currentIndex = OSCE_STAGES.findIndex(s => s.id === session.currentStage);
    const stageIndex = OSCE_STAGES.findIndex(s => s.id === stageId);
    
    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "current";
    return "pending";
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "fas fa-check";
      case "current":
        return "fas fa-clock";
      default:
        return "fas fa-circle";
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "current":
        return "bg-primary";
      default:
        return "bg-muted border-2 border-border";
    }
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col" data-testid="sidebar-main">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-stethoscope text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">OSCE Simulator</h1>
            <p className="text-sm text-muted-foreground">Medical Training Platform</p>
          </div>
        </div>
      </div>

      {/* Timer & Session Info */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground">Session Timer</h3>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <svg className="w-8 h-8 progress-ring" viewBox="0 0 36 36">
                <path 
                  className="text-muted stroke-current" 
                  strokeWidth="3" 
                  fill="none" 
                  d="M18 2.0845 A 15.9155 15.9155 0 0 1 18 33.9155 A 15.9155 15.9155 0 0 1 18 2.0845"
                />
                <path 
                  className="text-primary stroke-current" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeDasharray={`${(timeRemaining / 1800) * 100}, 100`}
                  d="M18 2.0845 A 15.9155 15.9155 0 0 1 18 33.9155 A 15.9155 15.9155 0 0 1 18 2.0845"
                />
              </svg>
            </div>
            <span className="text-sm font-mono text-foreground" data-testid="text-timer">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <div data-testid="text-case-info">Case: {osceCase.title} (ID: {osceCase.id.slice(0, 8)})</div>
          <div data-testid="text-patient-info">
            Patient: {osceCase.patientInfo.name}, {osceCase.patientInfo.age}{osceCase.patientInfo.gender[0]}
          </div>
        </div>
      </div>

      {/* OSCE Stages Progress */}
      <div className="p-6 flex-1 overflow-y-auto">
        <h3 className="font-medium text-foreground mb-4">OSCE Progress</h3>
        <div className="space-y-3">
          {OSCE_STAGES.map((stage, index) => {
            const status = getStageStatus(stage.id);
            return (
              <div key={stage.id} className="flex items-center space-x-3 stage-indicator">
                <div className={`w-8 h-8 rounded-full ${getStageColor(status)} flex items-center justify-center`}>
                  <i className={`${getStageIcon(status)} ${status === "pending" ? "text-muted-foreground" : "text-white"} text-xs`}></i>
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                    {stage.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {status === "completed" && "Completed"}
                    {status === "current" && "In Progress"}
                    {status === "pending" && "Pending"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 border-t border-border">
        <div className="space-y-2">
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => pauseSessionMutation.mutate()}
            disabled={pauseSessionMutation.isPending}
            data-testid="button-pause-session"
          >
            <i className="fas fa-pause mr-2"></i>
            {pauseSessionMutation.isPending ? "Saving..." : "Pause Session"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            data-testid="button-save-progress"
          >
            <i className="fas fa-save mr-2"></i>Save Progress
          </Button>
        </div>
      </div>
    </div>
  );
}
