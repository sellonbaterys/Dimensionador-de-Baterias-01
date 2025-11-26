export type SystemType = 'ONG' | 'HIB' | 'OFF';

export interface ProjectData {
  systemType: SystemType | null;
  consumoMensalKWh: number;
  kWhApuradosMes: number;
  horasBackup: number;
  cargas127V: number;
  cargas220V: number;
  cargas380V: number;
  fatorSimultaneidade: number;
  systemVoltage: string;
  tipoTarifa: string;
  usaraZeroGrid: boolean;
  integrador: string;
  cliente: string;
  cidade: string;
  estado: string;
  distribuidora: string;
  custoKwh: number;
  isMobileApplication: boolean;
}

export interface CalculationResults {
  energiaBessKwh: string;
  numBaterias: number;
  potenciaInversorKw: string;
  effectiveLoadKw: string;
  suggestedInverterBess: string;
  hybridInverterPower: string;
  potenciaPvKwP: string;
  numModulos: number;
  hspUsado: string;
  dailyProductionKwh: number;
  dailyConsumptionKwh: number;
  economiaMensalEstimada: string;
  suggestedInverterPvKw: string;
  cargas127V: number;
  cargas220V: number;
  cargas380V: number;
  FATOR_ECONOMIA_REAL: number;
  totalLoadWatts: number;
  valorInvestimentoEstimado: number;
  vpl: number;
  tir: number;
  paybackAnos: number;
  custoInercia25Anos: number;
  fluxoCaixaAcumulado: number[];
  lcoe: number;
}

export interface PremiumReportData {
  tituloProposta: string;
  resumoExecutivo: string;
  analiseTecnica: string;
  educacaoBess?: { oQueE: string; comoFunciona: string; explicacaoInstalacao: string; };
  contextoLegal: { titulo: string; explicacaoFioB: string; impactoLei14300: string; };
  explicacaoZeroGrid?: string;
  analiseFinanceira: { texto: string; roiEstimadoMeses: number; economiaAnual: number; economiaTotal25Anos: number; };
  impactoAmbiental: { co2EvitadoToneladas: number; arvoresSalvas: number; texto: string; };
  conclusaoVenda: string;
}

export interface ReportContent {
  structured: PremiumReportData;
  rawText?: string;
}

export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id?: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
  imageUrl?: string;
}