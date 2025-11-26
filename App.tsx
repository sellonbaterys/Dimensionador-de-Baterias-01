import React, { useState, useEffect } from 'react';
import { Sun, BatteryCharging, Unplug, Calculator, Zap, CheckCircle, Instagram, Loader2, HardHat, User, Lightbulb, Settings, LayoutDashboard, Battery, Gauge, FileText } from 'lucide-react';
import { BRAZILIAN_STATES } from './constants';
import { fetchCitiesForState, fetchTariffDetails } from './services/locationService';
import { calculateDimensioning } from './utils/calculations';
import { generateReport } from './services/geminiService';
import InputField from './components/ui/InputField';
import SystemOption from './components/ui/SystemOption';
import StepIndicator from './components/ui/StepIndicator';
import ResultItem from './components/ui/ResultItem';
import ReportDisplay from './components/ReportDisplay';
import PremiumModal from './components/PremiumModal';
import SalesPitchModal from './components/SalesPitchModal';
import { ProjectData, CalculationResults, ReportContent } from './types';

const INITIAL_DATA: ProjectData = {
  systemType: null,
  cliente: '',
  integrador: '',
  estado: 'SP',
  cidade: 'São Paulo',
  distribuidora: '',
  custoKwh: 0,
  consumoMensalKWh: 500,
  systemVoltage: '220V',
  tipoTarifa: 'B1',
  horasBackup: 4,
  cargas127V: 0,
  cargas220V: 0,
  cargas380V: 0,
  fatorSimultaneidade: 70,
  usaraZeroGrid: false,
  kWhApuradosMes: 0,
  isMobileApplication: false
};

const App = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ProjectData>(INITIAL_DATA);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [report, setReport] = useState<ReportContent | null>(null);
  const [isGen, setIsGen] = useState(false);
  const [showPrem, setShowPrem] = useState(false);
  const [showSales, setShowSales] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tariffSource, setTariffSource] = useState('STATE_DEFAULT');

  useEffect(() => {
    const load = async () => {
      setLoadingCities(true);
      const l = await fetchCitiesForState(data.estado);
      setCities(l);
      setLoadingCities(false);
    };
    load();
  }, [data.estado]);

  useEffect(() => {
    const loadT = async () => {
      const t = await fetchTariffDetails(data.estado, data.cidade);
      setData(p => ({...p, distribuidora: t.distribuidora, custoKwh: t.preco}));
      setTariffSource(t.sourceType);
    };
    loadT();
  }, [data.estado, data.cidade]);

  const handleIn = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setData(p => ({
      ...p,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const calc = () => {
    const r = calculateDimensioning(data);
    setResults(r);
    setStep(5);
    setTimeout(() => setShowSales(true), 800);
  };

  const genRep = async () => {
    if (!results) return;
    setIsGen(true);
    try {
      const r = await generateReport(data, results);
      setReport(r);
    } catch(e) {
      alert('Erro ao gerar');
    }
    setIsGen(false);
  };

  const renderStep1 = () => (
    <div className="py-8 px-4 text-center">
      <h2 className="text-5xl font-extrabold text-white mb-8">Calculadora de <span className="text-green-400">Baterias Pro</span></h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <SystemOption icon={Sun} title="On-Grid" description="Rede" isSelected={data.systemType === 'ONG'} onClick={() => { setData(p => ({...p, systemType: 'ONG'})); setTimeout(() => setStep(2), 300) }} />
        <SystemOption icon={BatteryCharging} title="Híbrido" description="Backup" isSelected={data.systemType === 'HIB'} onClick={() => { setData(p => ({...p, systemType: 'HIB'})); setTimeout(() => setStep(2), 300) }} />
        <SystemOption icon={Unplug} title="Off-Grid" description="Isolado" isSelected={data.systemType === 'OFF'} onClick={() => { setData(p => ({...p, systemType: 'OFF'})); setTimeout(() => setStep(2), 300) }} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="glass-panel p-8 rounded-3xl">
        <InputField label="Integrador" name="integrador" value={data.integrador} onChange={handleIn} Icon={HardHat} />
        <InputField label="Cliente" name="cliente" value={data.cliente} onChange={handleIn} Icon={User} />
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <select name="estado" value={data.estado} onChange={handleIn} className="bg-slate-900 p-4 rounded-xl text-white border border-white/10">
            {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.nome}</option>)}
          </select>
          <select name="cidade" value={data.cidade} onChange={handleIn} className="bg-slate-900 p-4 rounded-xl text-white border border-white/10">
            {loadingCities ? <option>Carregando...</option> : cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const isOff = data.systemType === 'OFF';
    return (
      <div className="max-w-4xl mx-auto glass-panel p-8 rounded-3xl">
        {!isOff && (
          <div className="bg-slate-800 p-4 rounded-xl mb-4 border border-white/10">
            <p className="text-green-400 text-xs font-bold">TARIFA DETECTADA</p>
            <div className="flex gap-4 mt-2">
              <InputField label="Distribuidora" name="distribuidora" value={data.distribuidora} onChange={handleIn} Icon={Zap} />
              <InputField label="R$/kWh" name="custoKwh" value={data.custoKwh} onChange={handleIn} Icon={Zap} type="number" />
            </div>
          </div>
        )}
        <InputField label={isOff ? "Média kWh/mês" : "Consumo Mensal"} name="consumoMensalKWh" value={data.consumoMensalKWh} onChange={handleIn} Icon={Lightbulb} type="number" />
        <div className="mt-4">
          <label>Tensão</label>
          <select name="systemVoltage" value={data.systemVoltage} onChange={handleIn} className="w-full bg-slate-900 p-4 rounded-xl text-white mt-2">
            <option value="220V">220V Mono</option>
            <option value="127V">127V Mono</option>
          </select>
        </div>
        {isOff && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3>Cargas Nominais (Opcional)</h3>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="127V" name="cargas127V" value={data.cargas127V} onChange={handleIn} Icon={LayoutDashboard} type="number" />
              <InputField label="220V" name="cargas220V" value={data.cargas220V} onChange={handleIn} Icon={LayoutDashboard} type="number" />
              <InputField label="380V" name="cargas380V" value={data.cargas380V} onChange={handleIn} Icon={LayoutDashboard} type="number" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-3 gap-6 mb-8">
        <InputField label="Cargas 127V" name="cargas127V" value={data.cargas127V} onChange={handleIn} Icon={LayoutDashboard} type="number" />
        <InputField label="Cargas 220V" name="cargas220V" value={data.cargas220V} onChange={handleIn} Icon={LayoutDashboard} type="number" />
        <InputField label="Cargas 380V" name="cargas380V" value={data.cargas380V} onChange={handleIn} Icon={LayoutDashboard} type="number" />
      </div>
      <div className="glass-panel p-8 rounded-3xl grid grid-cols-2 gap-8">
        <InputField label="Autonomia (h)" name="horasBackup" value={data.horasBackup} onChange={handleIn} Icon={Battery} type="number" />
        <InputField label="Simultaneidade (%)" name="fatorSimultaneidade" value={data.fatorSimultaneidade} onChange={handleIn} Icon={Settings} type="number" />
      </div>
    </div>
  );

  const renderRes = () => {
    if (!results) return null;
    const isBess = data.systemType === 'HIB' || data.systemType === 'OFF';
    return (
      <div className="max-w-6xl mx-auto animate-[fadeIn_0.6s_ease-out]">
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-green-500/20 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.3)] backdrop-blur-md relative z-10">
             <CheckCircle size={14} /> Estudo de Viabilidade Técnica
          </div>
          <h2 className="text-5xl font-black text-white mb-3 relative z-10">Solução Energética</h2>
          <p className="text-slate-400 text-lg relative z-10">Configuração otimizada para <span className="text-white font-semibold">{data.cliente}</span></p>
        </div>

        {isBess ? (
          <div className="glass-panel p-8 rounded-[2rem] border border-green-500/20 shadow-2xl relative overflow-hidden mb-8">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-500"></div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-6 border-r border-white/5 pr-8">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><Sun className="text-amber-400"/> Geração Solar</h3>
                   <ResultItem icon={Sun} title="Potência Solar" value={`${results.potenciaPvKwP} kWp`} description="Sugerida" highlight />
                   <ResultItem icon={Lightbulb} title="Geração Média" value={`${results.dailyProductionKwh.toFixed(1)} kWh/dia`} description="Estimada" />
                   <ResultItem icon={FileText} title="Economia Mensal" value={`R$ ${results.economiaMensalEstimada}`} description="Redução na Fatura" highlight />
                </div>
                <div className="space-y-6 pl-4">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><BatteryCharging className="text-green-400"/> Armazenamento Inteligente</h3>
                   <ResultItem icon={Battery} title="Banco de Baterias" value={`${results.energiaBessKwh} kWh`} description={`${results.numBaterias} unidades de 5kWh`} highlight />
                   <ResultItem icon={Zap} title="Inversor Híbrido" value={`${results.potenciaInversorKw} kW`} description={`Modelo: ${results.suggestedInverterBess}`} />
                   <ResultItem icon={Gauge} title="Carga Instantânea" value={`${results.effectiveLoadKw} kW`} description={`Autonomia: ${data.horasBackup}h`} />
                </div>
             </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <ResultItem icon={Sun} title="Potência Solar Sugerida" value={`${results.potenciaPvKwP} kWp`} description="Sugerida" highlight />
            <ResultItem icon={Lightbulb} title="Geração Média" value={`${results.dailyProductionKwh.toFixed(1)} kWh/dia`} description="Média" />
            <ResultItem icon={Calculator} title="Inversor" value={`${results.suggestedInverterPvKw} kW`} description="Híbrido" />
            <ResultItem icon={FileText} title="Economia" value={`R$ ${results.economiaMensalEstimada}`} description="Mensal" highlight />
          </div>
        )}

        <div className="flex justify-center mt-8">
          {!report ? (
             <button onClick={genRep} disabled={isGen} className="bg-green-600 px-8 py-4 rounded-2xl font-bold text-xl flex items-center gap-2 hover:scale-105 transition-transform">{isGen ? <Loader2 className="animate-spin"/> : <FileText/>} Relatório Premium</button>
          ) : (
             <ReportDisplay content={report} projectData={data} results={results}/>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-slate-100 pb-20">
      <header className="p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur fixed w-full z-50 border-b border-white/10">
        <div className="font-bold text-xl">Calculadora<span className="text-green-400">.Pro</span></div>
        <a href="https://www.instagram.com/sellon.batterys" target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-green-400 flex items-center gap-2">
          <Instagram size={14}/> Sellon Partner
        </a>
      </header>
      <main className="pt-24 px-4">
        <div className="mb-8 flex justify-center gap-4">
          {[1,2,3,4,5].map(s => <StepIndicator key={s} step={s} currentStep={step} title="" systemType={data.systemType}/>)}
        </div>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderRes()}
      </main>
      {step <= 5 && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4">
          <button onClick={() => step > 1 && setStep(s => s - 1)} disabled={step === 1} className="bg-slate-800 px-6 py-3 rounded-xl">Voltar</button>
          {step < 5 && <button onClick={() => { if(step === 4 || (step === 3 && data.systemType !== 'HIB')) calc(); else setStep(s => s + 1); }} className="bg-blue-600 px-6 py-3 rounded-xl font-bold">{step === 4 ? 'Calcular' : 'Próximo'}</button>}
        </div>
      )}
      <PremiumModal isOpen={showPrem} onClose={() => setShowPrem(false)}/>
      <SalesPitchModal isOpen={showSales} onClose={() => setShowSales(false)}/>
    </div>
  );
};

export default App;