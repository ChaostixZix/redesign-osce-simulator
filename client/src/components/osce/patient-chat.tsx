import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { QUICK_QUESTIONS } from "@/lib/osce-types";

interface PatientChatProps {
  session: any;
  osceCase: any;
}

export default function PatientChat({ session, osceCase }: PatientChatProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: chatHistory = [] } = useQuery({
    queryKey: ["/api/sessions", session.id, "chat"],
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", `/api/sessions/${session.id}/chat`, {
        message: messageText
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id, "chat"] });
      setMessage("");
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessageMutation.mutate(question);
  };

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col" data-testid="panel-patient-chat">
      {/* Patient Information */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <i className="fas fa-user text-muted-foreground text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground" data-testid="text-patient-name">
              {osceCase.patientInfo.name}
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div data-testid="text-patient-age-gender">
                {osceCase.patientInfo.age} years old, {osceCase.patientInfo.gender}
              </div>
              <div data-testid="text-patient-dob">DOB: {osceCase.patientInfo.dob}</div>
              <div data-testid="text-patient-mrn">MRN: {osceCase.patientInfo.mrn}</div>
            </div>
          </div>
        </div>
        
        {/* Vital Signs */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="font-medium text-sm text-foreground mb-2">Vital Signs</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div data-testid="text-vital-bp">BP: {osceCase.vitals.bp}</div>
            <div data-testid="text-vital-hr">HR: {osceCase.vitals.hr} bpm</div>
            <div data-testid="text-vital-temp">Temp: {osceCase.vitals.temp}</div>
            <div data-testid="text-vital-rr">RR: {osceCase.vitals.rr}/min</div>
            <div data-testid="text-vital-o2sat">O2 Sat: {osceCase.vitals.o2sat}%</div>
            <div data-testid="text-vital-bmi">BMI: {osceCase.vitals.bmi}</div>
          </div>
        </div>
      </div>

      {/* AI Patient Chat Interface */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-sm font-medium text-foreground">AI Patient Available</span>
            <i className="fas fa-robot text-primary text-sm"></i>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Start the conversation by asking the patient about their symptoms
              </div>
            )}
            
            {chatHistory.map((msg: any) => (
              <div 
                key={msg.id} 
                className={`flex items-start space-x-3 ${msg.sender === 'student' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'student' ? 'bg-primary' : 'bg-muted'
                }`}>
                  <i className={`fas ${msg.sender === 'student' ? 'fa-user-md text-primary-foreground' : 'fa-user text-muted-foreground'} text-sm`}></i>
                </div>
                <div className="flex-1">
                  <div className={`p-3 rounded-lg max-w-xs ${
                    msg.sender === 'student' 
                      ? 'chat-bubble-user text-primary-foreground ml-auto' 
                      : 'chat-bubble-ai text-foreground border border-border'
                  }`}>
                    <p className="text-sm" data-testid={`text-message-${msg.id}`}>{msg.message}</p>
                  </div>
                  <div className={`text-xs text-muted-foreground mt-1 ${msg.sender === 'student' ? 'text-right' : ''}`}>
                    {msg.sender === 'student' ? 'You' : 'AI Patient'} • {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input 
              type="text" 
              placeholder="Ask the patient a question..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={sendMessageMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
          
          {/* Quick Questions */}
          <div className="mt-3 space-y-1">
            <div className="text-xs text-muted-foreground mb-2">Quick Questions:</div>
            {QUICK_QUESTIONS.slice(0, 3).map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full text-left text-xs justify-start h-auto p-2 bg-muted hover:bg-accent"
                onClick={() => handleQuickQuestion(question)}
                disabled={sendMessageMutation.isPending}
                data-testid={`button-quick-question-${index}`}
              >
                "{question}"
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
