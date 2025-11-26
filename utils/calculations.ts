import { BESS_BATTERY_CAPACITY_KWH, BESS_DOD_FACTOR, COMMERCIAL_INVERTER_KW, FATOR_COMPENSACAO_LIQUIDA, HSP_BY_STATE, MODULE_POWER_Wp, PV_PERFORMANCE_FACTOR, INFLACAO_ENERGETICA_ANUAL, TAXA_DESCONTO_ANUAL, CUSTO_MANUTENCAO_ANUAL } from '../constants';
import { ProjectData, CalculationResults } from '../types';

const suggestInverterType = (cargas127V: number, cargas220V: number, cargas380V: number, systemVoltage: string) => {
  const has127 = cargas127V > 0; const has220 = cargas220V > 0; const has380 = cargas380V > 0;
  if (!has127 && !has220 && !has380) return "Nenhuma carga prioritária definida.";
  if (systemVoltage === '380V') return "Trifásico 380V";
  if (systemVoltage === '220V Trifásico') return "Trifásico 220V";
  if (has127 && has220) return "Split-Phase (Bifásico) ou Monofásico com Trafo";
  if (has220) return "Monofásico 220V";
  if (has127) return "Monofásico 127V";
  return "Monofásico Padrão";
};

const suggestPvInverterPower = (potenciaPvKwP: number) => { if (!potenciaPvKwP || isNaN(potenciaPvKwP)) return "0.0"; let targetInverterPower = potenciaPvKwP / 1.5; let roundedPower = Math.ceil(targetInverterPower); if (roundedPower < 2) roundedPower = 2; return roundedPower.toFixed(1); };

const suggestBessInverterPower = (effectiveLoadKw: number, maxPvPowerKw: number) => {
  const commercialKw = COMMERCIAL_INVERTER_KW; const safeLoad = effectiveLoadKw || 3.0; const safePv = maxPvPowerKw || 0;
  const inverterByLoad = commercialKw.find(kw => kw >= safeLoad); const targetByPv = safePv / 1.3; let finalPower = 0;
  if (inverterByLoad) { const candidates = commercialKw.filter(kw => kw >= safeLoad); if (targetByPv < safeLoad) { finalPower = inverterByLoad; } else { const suitableCandidates = candidates.filter(kw => kw >= safeLoad); if(suitableCandidates.length > 0) { finalPower = suitableCandidates.reduce((prev, curr) => { return (Math.abs(curr - targetByPv) < Math.abs(prev - targetByPv) ? curr : prev); }); } else { finalPower = inverterByLoad; } } } else { finalPower = commercialKw[commercialKw.length - 1]; } return finalPower.toFixed(1);
};

const calculateProjectCost = (kwp: number, kwhBess: number, inverterKw: number, isHybrid: boolean) => { const PRICE_PER_KWP_SOLAR = 3200; const PRICE_PER_KW_INVERTER = 1200; const PRICE_PER_KW_HYBRID = 2500; const PRICE_PER_KWH_BATTERY = 3800; const PROJECT_AND_LABOR_FACTOR = 1.4; const safeKwp = kwp || 0; const safeKwhBess = kwhBess || 0; const safeInverterKw = inverterKw || 0; let hardwareCost = 0; if (isHybrid || safeKwhBess > 0) { hardwareCost = (safeKwp * PRICE_PER_KWP_SOLAR) + (safeInverterKw * PRICE_PER_KW_HYBRID) + (safeKwhBess * PRICE_PER_KWH_BATTERY); } else { hardwareCost = (safeKwp * PRICE_PER_KWP_SOLAR) + (safeInverterKw * PRICE_PER_KW_INVERTER); } return hardwareCost * PROJECT_AND_LABOR_FACTOR; };

const calculateAdvancedFinancials = (investment: number, monthlySavings: number) => {
    if (!investment || investment <= 0 || !monthlySavings || monthlySavings <= 0) return { vpl: 0, tir: 0, paybackAnos: 0, custoInercia25Anos: 0, fluxoCaixaAcumulado: [0], lcoe: 0 };
    const years = 25; const cashFlow = [-investment]; let cumulativeCashFlow = -investment; const accumulatedFlowPoints = [-investment]; let custoInerciaTotal = 0; let paybackFound = false; let paybackTime = 0; let annualSavings = monthlySavings * 12;
    for (let year = 1; year <= years; year++) { const inflatedSavings = annualSavings * Math.pow(1 + INFLACAO_ENERGETICA_ANUAL, year - 1); const maintenance = year > 1 ? investment * CUSTO_MANUTENCAO_ANUAL : 0; const inverterReplacement = year === 12 ? investment * 0.15 : 0; const netYearlyFlow = inflatedSavings - maintenance - inverterReplacement; cashFlow.push(netYearlyFlow); cumulativeCashFlow += netYearlyFlow; accumulatedFlowPoints.push(cumulativeCashFlow); custoInerciaTotal += inflatedSavings; if (!paybackFound && cumulativeCashFlow >= 0) { const previousCumulative = accumulatedFlowPoints[year-1]; const fraction = Math.abs(previousCumulative) / netYearlyFlow; paybackTime = (year - 1) + fraction; paybackFound = true; } }
    if (!paybackFound) paybackTime = 25;
    let vpl = 0; for (let t = 0; t < cashFlow.length; t++) { vpl += cashFlow[t] / Math.pow(1 + TAXA_DESCONTO_ANUAL, t); }
    let tir = 0.0; let min = -1.0; let max = 1.0; let guess = 0.1; for(let i=0; i<50; i++) { let npv = 0; for (let t = 0; t < cashFlow.length; t++) { npv += cashFlow[t] / Math.pow(1 + guess, t); } if (Math.abs(npv) < 1) break; if (npv > 0) min = guess; else max = guess; guess = (min + max) / 2; } tir = guess * 100; if (isNaN(tir) || !isFinite(tir)) tir = 0;
    const totalEnergyLifetime = (monthlySavings / 0.85) * 12 * 25; const totalCostLifetime = investment + (investment * CUSTO_MANUTENCAO_ANUAL * 24) + (investment * 0.15); const lcoe = totalEnergyLifetime > 0 ? totalCostLifetime / totalEnergyLifetime : 0;
    return { vpl, tir, paybackAnos: paybackTime, custoInercia25Anos: custoInerciaTotal, fluxoCaixaAcumulado: accumulatedFlowPoints, lcoe };
};

export const calculateDimensioning = (data: ProjectData): CalculationResults => {
  const { systemType, consumoMensalKWh, horasBackup, cargas127V, cargas220V, cargas380V, fatorSimultaneidade, estado, custoKwh, systemVoltage, kWhApuradosMes } = data; const hspState = HSP_BY_STATE[estado] || HSP_BY_STATE['PADRAO'];
  let energiaBessKwh = 0, effectiveLoadKw = 0, totalLoadWatts = 0, potenciaInversorKw = '0.0', suggestedInverterBess = ''; const isBess = systemType === 'HIB' || systemType === 'OFF';
  let localCargas127V = cargas127V || 0; let localCargas220V = cargas220V || 0; let localCargas380V = cargas380V || 0; let dimensionamentoPorCargas = true;
  if (isBess) { if (systemType === 'OFF' && kWhApuradosMes > 0) { if (localCargas127V === 0 && localCargas220V === 0 && localCargas380V === 0) dimensionamentoPorCargas = false; } totalLoadWatts = localCargas127V + localCargas220V + localCargas380V; if (totalLoadWatts === 0 && systemType === 'HIB' && consumoMensalKWh > 0) { const avgHourly = (consumoMensalKWh / 30) / 24; totalLoadWatts = (avgHourly * 2.0) * 1000; dimensionamentoPorCargas = true; } effectiveLoadKw = (totalLoadWatts * (fatorSimultaneidade / 100)) / 1000; if (dimensionamentoPorCargas) { energiaBessKwh = effectiveLoadKw * horasBackup / BESS_DOD_FACTOR; } else { energiaBessKwh = (kWhApuradosMes / 30) / BESS_DOD_FACTOR; effectiveLoadKw = energiaBessKwh / 5; } suggestedInverterBess = suggestInverterType(localCargas127V, localCargas220V, localCargas380V, systemVoltage); }
  let potenciaPvKwP = 0, numModulos = 0, dailyProductionKwh = 0, dailyConsumptionKwh = 0, economiaMensalEstimada = 0, suggestedInverterPvKw = ''; const isPV = systemType !== null;
  if (isPV) { let dailyEnergyToCover; if (systemType === 'OFF') { if(dimensionamentoPorCargas) { dailyEnergyToCover = effectiveLoadKw * 24 * 0.5; } else { dailyEnergyToCover = (kWhApuradosMes / 30) + (energiaBessKwh * BESS_DOD_FACTOR * 0.2); } dailyConsumptionKwh = dailyEnergyToCover; } else { dailyEnergyToCover = consumoMensalKWh / 30; dailyConsumptionKwh = dailyEnergyToCover; } potenciaPvKwP = (dailyEnergyToCover / (hspState * PV_PERFORMANCE_FACTOR)); numModulos = Math.ceil((potenciaPvKwP * 1000) / MODULE_POWER_Wp); dailyProductionKwh = potenciaPvKwP * hspState * PV_PERFORMANCE_FACTOR; if (systemType !== 'OFF') { economiaMensalEstimada = (consumoMensalKWh * custoKwh) * FATOR_COMPENSACAO_LIQUIDA; } else { economiaMensalEstimada = dailyProductionKwh * 30 * custoKwh; } suggestedInverterPvKw = suggestPvInverterPower(potenciaPvKwP); }
  if (isBess) { const minPowerByLoad = effectiveLoadKw > 0 ? effectiveLoadKw : 3.0; potenciaInversorKw = suggestBessInverterPower(minPowerByLoad, potenciaPvKwP); }
  const safeInverterPv = parseFloat(suggestedInverterPvKw) || 0; const safeInverterBess = parseFloat(potenciaInversorKw) || 0; const valorInvestimentoEstimado = calculateProjectCost(potenciaPvKwP, energiaBessKwh, isBess ? safeInverterBess : safeInverterPv, isBess); const financials = calculateAdvancedFinancials(valorInvestimentoEstimado, economiaMensalEstimada);
  return { energiaBessKwh: energiaBessKwh.toFixed(1), numBaterias: Math.ceil(energiaBessKwh / BESS_BATTERY_CAPACITY_KWH), potenciaInversorKw, effectiveLoadKw: effectiveLoadKw.toFixed(1), suggestedInverterBess, hybridInverterPower: potenciaInversorKw, potenciaPvKwP: potenciaPvKwP.toFixed(2), numModulos, hspUsado: hspState.toFixed(2), dailyProductionKwh, dailyConsumptionKwh, economiaMensalEstimada: economiaMensalEstimada.toFixed(2), suggestedInverterPvKw, cargas127V: localCargas127V, cargas220V: localCargas220V, cargas380V: localCargas380V, FATOR_ECONOMIA_REAL: FATOR_COMPENSACAO_LIQUIDA, totalLoadWatts, valorInvestimentoEstimado, ...financials };
};