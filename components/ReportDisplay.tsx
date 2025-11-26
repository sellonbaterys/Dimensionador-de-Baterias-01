import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { CashFlowChart, BessOperationSchematic } from './PremiumCharts';
import { ReportContent, ProjectData, CalculationResults } from '../types';

interface ReportDisplayProps {
  content: ReportContent;
  projectData: ProjectData;
  results: CalculationResults;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ content, projectData, results }) => {
    const [customInvestment, setCustomInvestment] = useState("");
    if (!content.structured) return <div>Erro</div>;
    const { structured } = content;
    const handlePrint = () => window.print();
    const handleWhatsapp = () => window.open(`https://wa.me/?text=Proposta para ${projectData.cliente}`, '_blank');

    return (
        <div className="w-full max-w-[210mm] mx-auto font-inter pb-20 bg-white text-slate-900">
            <div className="print:hidden flex justify-end gap-2 p-4">
              <button onClick={handleWhatsapp} className="bg-green-500 text-white p-2 rounded">WhatsApp</button>
              <button onClick={handlePrint} className="bg-slate-200 p-2 rounded">PDF</button>
            </div>
            <header className="p-12 bg-slate-50 border-b">
              <h1 className="text-4xl font-bold">{structured.tituloProposta}</h1>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="border p-4 rounded">Investimento: <input value={customInvestment} onChange={e=>setCustomInvestment(e.target.value)} placeholder="R$ 0,00" className="text-2xl font-bold bg-transparent w-full"/></div>
              </div>
            </header>
            <main className="p-12 space-y-12">
                <section>
                  <h2 className="text-2xl font-bold mb-4">Resumo</h2>
                  <p>{structured.resumoExecutivo}</p>
                </section>
                <section className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded">
                    <h3>Economia Mensal</h3>
                    <p className="text-xl font-bold">R$ {results.economiaMensalEstimada}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <h3>Autonomia</h3>
                    <p className="text-xl font-bold">{projectData.horasBackup}h</p>
                  </div>
                </section>
                {structured.educacaoBess && (
                  <section className="bg-slate-50 p-6 rounded">
                    <h3 className="font-bold">Tecnologia BESS</h3>
                    <p>{structured.educacaoBess.oQueE}</p>
                    <div className="mt-4"><BessOperationSchematic/></div>
                  </section>
                )}
                <section>
                  <h3 className="font-bold">Financeiro</h3>
                  <div className="h-64"><CashFlowChart dataPoints={results.fluxoCaixaAcumulado}/></div>
                  <p>{structured.analiseFinanceira.texto}</p>
                </section>
                <footer className="mt-12 border-t pt-6 text-center">
                  <p>"{structured.conclusaoVenda}"</p>
                </footer>
            </main>
        </div>
    );
};
export default ReportDisplay;