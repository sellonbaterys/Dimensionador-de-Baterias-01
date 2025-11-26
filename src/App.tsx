import React, { useState, useEffect } from 'react';
import { Sun, BatteryCharging, Unplug, Calculator, Zap, CheckCircle, Instagram, Loader2, HardHat, User, Lightbulb, Settings, LayoutDashboard, Battery, Gauge, FileText, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
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
    setTimeout(() => setShowSales(true), 1200);
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

  const getStepTitle = (s: number) => {
    switch (s) {
      case 1: return "Sistema";
      case 2: return "Local";
      case 3: return "Consumo";
      case 4: return "Baterias";
      case 5: return "Proposta";
      default: return "";
    }
  };

  const renderStep1 = () => (
    <div className="py-8 px-4 text-center animate-in fade-in duration-700">
      <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
        Energy<span className="text-green-500">Expert</span>
      </h2>
      <p className="text-slate-400 mb-12 text-lg max-w-2xl mx-auto leading-relaxed">
        Selecione a tecnologia ideal para iniciar o dimensionamento profissional do projeto.
      </p>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <SystemOption 
          icon={Sun} 
          title="On-Grid" 
          description="Foco em ECONOMIA. Conectado à rede da concessionária, permite abater até 95% da conta de luz através do sistema de compensação de créditos. Possui o menor custo de investimento inicial e o retorno financeiro (ROI) mais rápido do mercado. Nota: Por norma de segurança, desliga durante apagões." 
          isSelected={data.systemType === 'ONG'} 
          onClick={() => { setData(p => ({...p, systemType: 'ONG'})); setTimeout(() => setStep(2), 300) }} 
        />
        <SystemOption 
          icon={BatteryCharging} 
          title="Híbrido" 
          description="Foco em SEGURANÇA. A união perfeita entre economia e proteção. Funciona conectado à rede para reduzir a conta, mas possui um banco de baterias inteligente. Em caso de queda de energia (blackout), o sistema assume as cargas críticas automaticamente, mantendo sua casa funcional." 
          isSelected={data.systemType === 'HIB'} 
          onClick={() => { setData(p => ({...p, systemType: 'HIB'})); setTimeout(() => setStep(2), 300) }} 
        />
        <SystemOption 
          icon={Unplug} 
          title="Off-Grid" 
          description="Foco em INDEPENDÊNCIA. A solução definitiva para autossuficiência. Ideal para locais remotos sem acesso à rede ou para quem deseja se desconectar da concessionária. O sistema gera e armazena 100% da energia necessária para uso diurno e noturno, sem contas mensais." 
          isSelected={data.systemType === 'OFF'} 
          onClick={() => { setData(p => ({...p, systemType: 'OFF'})); setTimeout(() => setStep(2), 300) }} 
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="glass-panel p-8 rounded-3xl border border-white/5">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><User className="text-green-400"/> Dados do Cliente</h3>
        <InputField label="Integrador / Responsável" name="integrador" value={data.integrador} onChange={handleIn} Icon={HardHat} placeholder="Nome da sua empresa" />
        <div className="h-4"></div>
        <InputField label="Nome do Cliente" name="cliente" value={data.cliente} onChange={handleIn} Icon={User} placeholder="Para quem é o projeto?" />
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="group w-full">
            <label className="text-[11px] uppercase font-black tracking-widest text-slate-300 mb-2.5 flex items-center gap-2">Estado</label>
            <select name="estado" value={data.estado} onChange={handleIn} className="w-full bg-slate-900/60 border border-white/30 text-white rounded-xl py-4 pl-5 pr-4 focus:ring-1 focus:ring-green-500 outline-none text-lg font-bold appearance-none cursor-pointer hover:bg-slate-800/50 transition-colors shadow-sm">
              {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.nome}</option>)}
            </select>
          </div>
          <div className="group w-full">
            <label className="text-[11px] uppercase font-black tracking-widest text-slate-300 mb-2.5 flex items-center gap-2">Cidade</label>
            <select name="cidade" value={data.cidade} onChange={handleIn} className="w-full bg-slate-900/60 border border-white/30 text-white rounded-xl py-4 pl-5 pr-4 focus:ring-1 focus:ring-green-500 outline-none text-lg font-bold appearance-none cursor-pointer hover:bg-slate-800/50 transition-colors shadow-sm">
              {loadingCities ? <option>Carregando...</option> : cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const isOff = data.systemType === 'OFF';
    return (
      <div className="max-w-4xl mx-auto glass-panel p-8 rounded-3xl animate-in slide-in-from-bottom-8 fade-in duration-500">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Zap className="text-green-400"/> Perfil de Consumo</h3>
        {!isOff && (
          <div className="bg-slate-900/50 p-6 rounded-2xl mb-8 border border-green-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <p className="text-green-400 text-xs font-black tracking-widest mb-4 flex items-center gap-2 uppercase"><Settings size={12}/> Tarifa Detectada (Automático)</p>
            <div className="flex gap-6">
              <InputField label="Distribuidora" name="distribuidora" value={data.distribuidora} onChange={handleIn} Icon={Zap} className="bg-slate-950/50" />
              <InputField label="R$/kWh" name="custoKwh" value={data.custoKwh} onChange={handleIn} Icon={Zap} type="number" className="bg-slate-950/50" />
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
            <InputField 
              label={isOff ? "Média kWh/mês Estimada" : "Consumo Mensal (kWh)"} 
              name="consumoMensalKWh" 
              value={data.consumoMensalKWh} 
              onChange={handleIn} 
              Icon={Lightbulb} 
              type="number" 
              placeholder="Ex: 500"
              description="Verifique a 'Média de Consumo' na conta de luz."
            />
            <div className="group w-full">
              <label className="text-[11px] uppercase font-black tracking-widest text-slate-300 mb-2.5 flex items-center gap-2">Tensão da Rede</label>
              <select name="systemVoltage" value={data.systemVoltage} onChange={handleIn} className="w-full bg-slate-900/60 border border-white/30 text-white rounded-xl py-4 pl-5 pr-4 focus:ring-1 focus:ring-green-500 outline-none text-lg font-bold appearance-none cursor-pointer shadow-sm">
                <option value="220V">220V (Fase-Fase ou Mono)</option>
                <option value="127V">127V (Monofásico)</option>
                <option value="380V">380V (Trifásico)</option>
              </select>
            </div>
        </div>
        {isOff && (
          <div className="mt-8 pt-8 border-t border-white/5">
            <h4 className="text-lg font-semibold mb-4 text-slate-300">Cargas Específicas (Opcional)</h4>
            <div className="grid grid-cols-3 gap-4">
              <InputField 
                label="Potência 127V (W)" 
                name="cargas127V" 
                value={data.cargas127V} 
                onChange={handleIn} 
                Icon={LayoutDashboard} 
                type="number"
                description="Ex: TV, Lâmpadas, Roteador."
              />
              <InputField 
                label="Potência 220V (W)" 
                name="cargas220V" 
                value={data.cargas220V} 
                onChange={handleIn} 
                Icon={LayoutDashboard} 
                type="number"
                description="Ex: Chuveiro, Ar Condicionado."
              />
              <InputField 
                label="Potência 380V (W)" 
                name="cargas380V" 
                value={data.cargas380V} 
                onChange={handleIn} 
                Icon={LayoutDashboard} 
                type="number"
                description="Ex: Motores Industriais."
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">* Preencha apenas se souber a carga instantânea dos equipamentos.</p>
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="glass-panel p-8 rounded-3xl mb-8">
         <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Battery className="text-green-400"/> Dimensionamento do Backup</h3>
         <div className="grid md:grid-cols-2 gap-8">
            <InputField 
              label="Autonomia Desejada (Horas)" 
              name="horasBackup" 
              value={data.horasBackup} 
              onChange={handleIn} 
              Icon={Battery} 
              type="number" 
              description="Tempo estimado que o sistema deve sustentar as cargas sem sol/rede." 
            />
            <InputField 
              label="Fator de Simultaneidade (%)" 
              name="fatorSimultaneidade" 
              value={data.fatorSimultaneidade} 
              onChange={handleIn} 
              Icon={Settings} 
              type="number" 
              description="Porcentagem dos equipamentos que ficarão ligados ao mesmo tempo (Padrão: 70%)." 
            />
         </div>
      </div>
      
      <div className="glass-panel p-8 rounded-3xl border border-white/5">
         <h4 className="text-lg font-semibold mb-6 text-slate-300">Detalhamento de Cargas Críticas (Watts)</h4>
         <p className="text-sm text-slate-400 mb-6 -mt-4">Insira a soma da potência (em Watts) dos equipamentos que você deseja manter ligados durante uma queda de energia.</p>
         <div className="grid grid-cols-3 gap-6">
            <InputField 
              label="Potência Total 127V (Watts)" 
              name="cargas127V" 
              value={data.cargas127V} 
              onChange={handleIn} 
              Icon={LayoutDashboard} 
              type="number"
              description="Ex: Geladeira (200W) + Luzes (100W) + TV (150W)."
            />
            <InputField 
              label="Potência Total 220V (Watts)" 
              name="cargas220V" 
              value={data.cargas220V} 
              onChange={handleIn} 
              Icon={LayoutDashboard} 
              type="number"
              description="Ex: Ar Condicionado (1500W) + Chuveiro (5500W)."
            />
            <InputField 
              label="Potência Total 380V (Watts)" 
              name="cargas380V" 
              value={data.cargas380V} 
              onChange={handleIn} 
              Icon={LayoutDashboard} 
              type="number"
              description="Apenas para equipamentos industriais trifásicos."
            />
         </div>
      </div>
    </div>
  );

  const renderRes = () => {
    if (!results) return null;
    const isBess = data.systemType === 'HIB' || data.systemType === 'OFF';
    
    return (
      <div className="max-w-6xl mx-auto animate-[fadeIn_0.8s_ease-out]">
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-green-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.3)] backdrop-blur-md relative z-10">
             <CheckCircle size={14} /> Resultado do Dimensionamento
          </div>
          <h2 className="text-5xl font-black text-white mb-3 relative z-10">Solução Energética</h2>
          <p className="text-slate-400 text-lg relative z-10">Configuração otimizada para <span className="text-white font-semibold">{data.cliente}</span></p>
        </div>

        {isBess ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
               {/* Coluna 1: Solar */}
               <ResultItem icon={Sun} title="Potência Solar" value={`${results.potenciaPvKwP} kWp`} description="Arranjo Fotovoltaico" highlight />
               <ResultItem icon={Lightbulb} title="Geração Média" value={`${results.dailyProductionKwh.toFixed(1)} kWh`} description="Produção Diária Estimada" />
               <ResultItem icon={FileText} title="Economia Estimada" value={`R$ ${results.economiaMensalEstimada}`} description="Redução Mensal na Fatura" highlight />

               {/* Coluna 2: Baterias */}
               <ResultItem icon={BatteryCharging} title="Banco de Baterias" value={`${results.energiaBessKwh} kWh`} description={`${results.numBaterias} módulos de 5kWh`} highlight />
               <ResultItem icon={Gauge} title="Autonomia" value={`${data.horasBackup} Horas`} description={`Carga Média: ${results.effectiveLoadKw} kW`} />
               <ResultItem icon={Zap} title="Inversor Híbrido" value={`${results.potenciaInversorKw} kW`} description={results.suggestedInverterBess} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             <ResultItem icon={Sun} title="Potência Solar" value={`${results.potenciaPvKwP} kWp`} description="Arranjo Sugerido" highlight />
             <ResultItem icon={Lightbulb} title="Produção Mensal" value={`${(results.dailyProductionKwh * 30).toFixed(0)} kWh`} description="Estimativa de Geração" />
             <ResultItem icon={Calculator} title="Inversor" value={`${results.suggestedInverterPvKw} kW`} description="Potência Nominal" />
             <ResultItem icon={BarChart3} title="Economia Mensal" value={`R$ ${results.economiaMensalEstimada}`} description="Poupança Estimada" highlight />
          </div>
        )}

        <div className="flex justify-center mt-12 pb-8">
          {!report ? (
             <button onClick={genRep} disabled={isGen} className="group bg-gradient-to-r from-green-600 to-emerald-600 px-10 py-5 rounded-2xl font-bold text-xl text-white flex items-center gap-3 shadow-[0_0_40px_rgba(22,163,74,0.3)] hover:shadow-[0_0_60px_rgba(22,163,74,0.5)] hover:scale-105 transition-all">
                {isGen ? <Loader2 className="animate-spin"/> : <FileText className="group-hover:rotate-12 transition-transform"/>} 
                Gerar Proposta Comercial com IA
             </button>
          ) : (
             <ReportDisplay content={report} projectData={data} results={results}/>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-slate-100 pb-32 font-sans selection:bg-green-500/30">
      <header className="p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-xl fixed top-0 w-full z-40 border-b border-white/5">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30"><Zap size={18} className="text-green-400"/></div>
            <span>Energy<span className="text-green-400">Expert</span></span>
        </div>
        <a href="https://www.instagram.com/sellon.batterys" target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-green-400 flex items-center gap-2 transition-colors border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5">
          <Instagram size={14}/> Sellon Partner
        </a>
      </header>

      <main className="pt-28 px-4 max-w-7xl mx-auto">
        <div className="mb-12 relative max-w-3xl mx-auto px-4">
          <div className="absolute top-5 left-16 right-16 h-1 bg-slate-800 -z-10 rounded-full">
             <div 
               className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
               style={{ width: `${((step - 1) / 4) * 100}%` }}
             ></div>
          </div>
          <div className="flex justify-between relative z-0">
            {[1,2,3,4,5].map(s => <StepIndicator key={s} step={s} currentStep={step} title={getStepTitle(s)} systemType={data.systemType}/>)}
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderRes()}
      </main>

      {/* FOOTER NAVIGATION BAR */}
      {step >= 1 && step <= 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <button 
              onClick={() => step > 1 && setStep(s => s - 1)}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all group ${step === 1 ? 'text-slate-600 cursor-not-allowed opacity-50' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Voltar
            </button>
            
            {step < 5 && (
              <button 
                onClick={() => { 
                  if(step === 4 || (step === 3 && data.systemType !== 'HIB')) calc(); 
                  else setStep(s => s + 1); 
                }} 
                disabled={step === 1 && !data.systemType}
                className={`flex items-center gap-3 bg-green-500 hover:bg-green-400 text-slate-900 px-8 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all transform hover:-translate-y-1 active:scale-95 group ${step === 1 && !data.systemType ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}
              >
                {step === 4 || (step === 3 && data.systemType !== 'HIB') ? 'Calcular Projeto' : 'Próximo'} 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            
          </div>
        </div>
      )}

      <PremiumModal isOpen={showPrem} onClose={() => setShowPrem(false)}/>
      <SalesPitchModal isOpen={showSales} onClose={() => setShowSales(false)}/>
    </div>
  );
};

export default App;