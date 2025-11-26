import React from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sun, Zap, Home, BatteryCharging, Ban, ArrowRight, Router, Fan, Lightbulb } from 'lucide-react';

export const ProposalLoadChart = ({ cargas127V, cargas220V, cargas380V }: { cargas127V: number, cargas220V: number, cargas380V: number }) => {
  const data = [{name:'127V',value:cargas127V},{name:'220V',value:cargas220V},{name:'380V',value:cargas380V}].filter(i=>i.value>0);
  if(data.length===0) return null;
  return <div className="h-64 w-full"><ResponsiveContainer><PieChart><Pie data={data} innerRadius={60} outerRadius={80} dataKey="value"><Cell fill="#3b82f6"/><Cell fill="#22c55e"/><Cell fill="#8b5cf6"/></Pie><Tooltip/></PieChart></ResponsiveContainer></div>;
};

export const BatteryCycleChart = () => {
  const data = [{time:'00h',level:40},{time:'06h',level:20},{time:'12h',level:100},{time:'18h',level:85},{time:'22h',level:55}];
  return <div className="h-full w-full"><ResponsiveContainer><AreaChart data={data}><defs><linearGradient id="cL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/><stop offset="95%" stopColor="#4ade80" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="level" stroke="#22c55e" fill="url(#cL)" /></AreaChart></ResponsiveContainer></div>;
};

export const CashFlowChart = ({ dataPoints }: { dataPoints: number[] }) => {
  const data = dataPoints.map((v,i)=>({year:i,value:v}));
  return <div className="h-full w-full"><ResponsiveContainer><AreaChart data={data}><Area type="monotone" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3}/><Tooltip/></AreaChart></ResponsiveContainer></div>;
};

export const ZeroGridSchematic = () => (
  <div className="w-full bg-white p-6 rounded-2xl flex flex-col items-center">
    <div className="flex gap-4 items-center">
      <Sun size={24} className="text-amber-500"/>
      <Zap size={32} className="text-blue-600"/>
      <Home size={24} className="text-green-600"/>
      <Ban size={24} className="text-red-500"/>
    </div>
    <p className="text-xs text-slate-500 mt-2">Bloqueio Ativo de Injeção</p>
  </div>
);

export const BessOperationSchematic = () => (
  <div className="w-full bg-white p-6 rounded-2xl">
    <div className="flex justify-around"><Sun/><Zap/><Home/></div>
    <div className="text-center mt-4">
      <BatteryCharging className="mx-auto text-green-600"/>
      <p className="text-xs">Armazenamento Inteligente</p>
    </div>
  </div>
);

export const CriticalLoadsSchematic = () => (
  <div className="w-full bg-white p-6 rounded-2xl flex justify-around">
    <div className="opacity-50"><p>Quadro Geral</p><Fan/></div>
    <ArrowRight/>
    <div className="bg-green-50 p-2 border border-green-400 rounded">
      <p>Quadro Crítico</p><Router/><Lightbulb/>
    </div>
  </div>
);