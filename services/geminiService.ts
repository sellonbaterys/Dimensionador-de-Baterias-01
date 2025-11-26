import { GoogleGenAI, Type } from "@google/genai";
import { ProjectData, CalculationResults, ReportContent } from "../types";

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    tituloProposta: { type: Type.STRING },
    resumoExecutivo: { type: Type.STRING },
    analiseTecnica: { type: Type.STRING },
    educacaoBess: {
      type: Type.OBJECT,
      properties: {
        oQueE: { type: Type.STRING },
        comoFunciona: { type: Type.STRING },
        explicacaoInstalacao: { type: Type.STRING }
      },
      required: ["oQueE", "comoFunciona", "explicacaoInstalacao"]
    },
    contextoLegal: {
      type: Type.OBJECT,
      properties: {
        titulo: { type: Type.STRING },
        explicacaoFioB: { type: Type.STRING },
        impactoLei14300: { type: Type.STRING }
      },
      required: ["titulo", "explicacaoFioB", "impactoLei14300"]
    },
    explicacaoZeroGrid: { type: Type.STRING },
    analiseFinanceira: {
      type: Type.OBJECT,
      properties: {
        texto: { type: Type.STRING },
        roiEstimadoMeses: { type: Type.NUMBER },
        economiaAnual: { type: Type.NUMBER },
        economiaTotal25Anos: { type: Type.NUMBER }
      },
      required: ["texto", "roiEstimadoMeses", "economiaAnual", "economiaTotal25Anos"]
    },
    impactoAmbiental: {
      type: Type.OBJECT,
      properties: {
        texto: { type: Type.STRING },
        co2EvitadoToneladas: { type: Type.NUMBER },
        arvoresSalvas: { type: Type.NUMBER }
      },
      required: ["texto", "co2EvitadoToneladas", "arvoresSalvas"]
    },
    conclusaoVenda: { type: Type.STRING }
  },
  required: ["tituloProposta", "resumoExecutivo", "analiseTecnica", "educacaoBess", "contextoLegal", "analiseFinanceira", "impactoAmbiental", "conclusaoVenda"]
};

export const generateReport = async (projectData: ProjectData, results: CalculationResults): Promise<ReportContent> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key não encontrada");
  const ai = new GoogleGenAI({ apiKey });

  const zeroGridInstruction = projectData.usaraZeroGrid ? 'O cliente ativou ZERO GRID. Explique.' : 'Sem Zero Grid.';
  const educationalInstruction = (projectData.systemType === 'HIB' || projectData.systemType === 'OFF') ? 'Explique BESS e cargas críticas.' : 'Explique tecnologia solar.';
  const prompt = `Atue como Diretor Comercial. Gere proposta para ${projectData.cliente} em ${projectData.cidade}. Sistema ${projectData.systemType}. ${zeroGridInstruction} ${educationalInstruction} JSON ESTRITO.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        temperature: 0.7
      }
    });

    if (!response.text) {
        throw new Error("No response text from Gemini");
    }

    return { structured: JSON.parse(response.text) };
  } catch (e) {
    throw e;
  }
};