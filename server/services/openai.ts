import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "default_key" 
});

export interface PatientResponse {
  message: string;
  emotion: "neutral" | "worried" | "relieved" | "anxious" | "pain";
  additionalInfo?: string;
}

export async function getPatientResponse(
  patientInfo: any,
  chatHistory: any[],
  studentMessage: string
): Promise<PatientResponse> {
  try {
    const systemPrompt = `You are simulating a ${patientInfo.age}-year-old ${patientInfo.gender} patient named ${patientInfo.name}. 
    Chief complaint: ${patientInfo.chiefComplaint}
    
    Respond as this patient would in a realistic medical encounter. Be conversational but provide medically relevant information when asked appropriate questions. Show appropriate emotions and concerns. Do not provide medical advice or diagnoses - you are the patient, not a doctor.
    
    Respond with JSON in this format: { "message": "patient response", "emotion": "emotion_type", "additionalInfo": "optional extra context" }`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((msg: any) => ({
        role: msg.sender === "student" ? "user" : "assistant",
        content: msg.message
      })),
      { role: "user", content: studentMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      message: result.message || "I'm not sure what you mean.",
      emotion: result.emotion || "neutral",
      additionalInfo: result.additionalInfo
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      message: "I'm having trouble speaking right now. Could you try again?",
      emotion: "neutral"
    };
  }
}

export async function generatePhysicalFinding(
  bodyPart: string,
  examinationType: string,
  patientCase: any
): Promise<string> {
  try {
    const systemPrompt = `Generate a realistic physical examination finding for a ${patientCase.patientInfo.age}-year-old ${patientCase.patientInfo.gender} with ${patientCase.patientInfo.chiefComplaint}.
    
    Body part: ${bodyPart}
    Examination type: ${examinationType}
    
    Provide a concise, medically accurate finding that would be appropriate for this case. Respond with just the finding text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: systemPrompt }],
      max_tokens: 100,
    });

    return response.choices[0].message.content || "Normal findings";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Unable to generate finding at this time";
  }
}

export async function generateTestResult(
  testName: string,
  patientCase: any
): Promise<any> {
  try {
    const systemPrompt = `Generate a realistic test result for ${testName} for a patient with ${patientCase.patientInfo.chiefComplaint}.
    
    Provide a medically accurate result that fits the clinical scenario. Include reference ranges where appropriate.
    
    Respond with JSON containing the test result data.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: systemPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 150,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI API error:", error);
    return { result: "Test result unavailable", status: "error" };
  }
}
