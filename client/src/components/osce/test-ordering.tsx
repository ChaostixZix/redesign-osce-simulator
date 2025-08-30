import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

interface TestOrderingProps {
  session: any;
  osceCase: any;
  onClose?: () => void;
}

const TEST_CATEGORIES = [
  {
    id: "hematology",
    name: "Hematology",
    description: "CBC, Coagulation studies",
    tests: ["CBC with Differential", "PT/INR", "PTT", "D-Dimer", "ESR", "CRP"]
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Basic metabolic panel, Lipids",
    tests: ["Basic Metabolic Panel", "Comprehensive Metabolic Panel", "Lipid Panel", "HbA1c", "Glucose"]
  },
  {
    id: "cardiac",
    name: "Cardiac Markers",
    description: "Troponins, CK-MB, BNP",
    tests: ["Troponin I", "Troponin T", "CK-MB", "BNP", "Pro-BNP"]
  },
  {
    id: "imaging",
    name: "Imaging",
    description: "X-ray, CT, MRI, Echo",
    tests: ["Chest X-ray", "CT Chest", "Echocardiogram", "CT Abdomen/Pelvis", "MRI"]
  },
  {
    id: "specialized",
    name: "Specialized",
    description: "Cultures, Serology",
    tests: ["Blood Culture", "Urine Culture", "Hepatitis Panel", "Thyroid Function", "Urinalysis"]
  }
];

export default function TestOrdering({ session, osceCase, onClose }: TestOrderingProps) {
  const [selectedCategory, setSelectedCategory] = useState("hematology");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: existingOrders = [] } = useQuery({
    queryKey: ["/api/sessions", session.id, "tests"],
  });

  const orderTestsMutation = useMutation({
    mutationFn: async (tests: string[]) => {
      const response = await apiRequest("POST", `/api/sessions/${session.id}/tests`, {
        tests
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id, "tests"] });
      setSelectedTests([]);
      if (onClose) onClose();
    }
  });

  const toggleTest = (testName: string) => {
    setSelectedTests(prev => 
      prev.includes(testName) 
        ? prev.filter(t => t !== testName)
        : [...prev, testName]
    );
  };

  const currentCategory = TEST_CATEGORIES.find(cat => cat.id === selectedCategory);

  const isTestAlreadyOrdered = (testName: string) => {
    return existingOrders.some((order: any) => order.testName === testName);
  };

  const getTurnaroundTime = (testName: string) => {
    const availableTest = osceCase.availableTests?.find((t: any) => t.name === testName);
    return availableTest?.turnaroundTime || 30;
  };

  if (!onClose) {
    // Render as full page component
    return (
      <div className="flex-1 p-6 bg-background overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <TestOrderingContent />
        </div>
      </div>
    );
  }

  // Render as modal
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Order Laboratory Tests & Imaging</DialogTitle>
        </DialogHeader>
        <TestOrderingContent />
      </DialogContent>
    </Dialog>
  );

  function TestOrderingContent() {
    return (
      <div className="flex h-[600px]">
        {/* Test Categories */}
        <div className="w-1/3 border-r border-border p-4 overflow-y-auto">
          <h3 className="font-medium text-foreground mb-4">Test Categories</h3>
          <div className="space-y-2">
            {TEST_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`test-category p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedCategory === category.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:bg-accent'
                }`}
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`category-${category.id}`}
              >
                <div className="font-medium text-sm text-foreground">{category.name}</div>
                <div className="text-xs text-muted-foreground">{category.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Available Tests */}
        <div className="w-2/3 p-4 overflow-y-auto">
          <h3 className="font-medium text-foreground mb-4">Available Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentCategory?.tests.map((testName) => {
              const isOrdered = isTestAlreadyOrdered(testName);
              const isSelected = selectedTests.includes(testName);
              const turnaroundTime = getTurnaroundTime(testName);
              
              return (
                <div 
                  key={testName}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isOrdered 
                      ? 'border-success bg-success/10' 
                      : isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => !isOrdered && toggleTest(testName)}
                  data-testid={`test-${testName.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">{testName}</div>
                      <div className="text-xs text-muted-foreground">{currentCategory.name}</div>
                      <div className="text-xs text-success mt-1">
                        Results in {turnaroundTime} min
                      </div>
                    </div>
                    {isOrdered ? (
                      <Badge variant="outline" className="text-success border-success">
                        Ordered
                      </Badge>
                    ) : (
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => toggleTest(testName)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Selected Tests Summary */}
          {selectedTests.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-2">
                Selected Tests ({selectedTests.length})
              </h4>
              <div className="space-y-2">
                {selectedTests.map((testName) => (
                  <div key={testName} className="flex items-center justify-between text-sm">
                    <span>{testName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive text-xs p-1 h-auto"
                      onClick={() => toggleTest(testName)}
                      data-testid={`button-remove-test-${testName.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex space-x-3">
                <Button
                  onClick={() => orderTestsMutation.mutate(selectedTests)}
                  disabled={orderTestsMutation.isPending || selectedTests.length === 0}
                  className="flex-1"
                  data-testid="button-order-selected-tests"
                >
                  {orderTestsMutation.isPending ? "Ordering..." : "Order Selected Tests"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTests([])}
                  data-testid="button-clear-selection"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Existing Orders */}
          {existingOrders.length > 0 && (
            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-3">Ordered Tests</h4>
              <div className="space-y-2">
                {existingOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                    <span data-testid={`text-ordered-test-${order.testName.replace(/\s+/g, '-').toLowerCase()}`}>
                      {order.testName}
                    </span>
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
