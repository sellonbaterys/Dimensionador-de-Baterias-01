import { TARIFF_DATA } from '../constants';

const cityCache: Record<string, string[]> = {};

export const fetchCitiesForState = async (uf: string): Promise<string[]> => {
  if (cityCache[uf]) return cityCache[uf];
  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    if (!response.ok) throw new Error('Falha');
    const data = await response.json();
    const cityNames = data.map((city: any) => city.nome).sort((a: string, b: string) => a.localeCompare(b));
    cityCache[uf] = cityNames;
    return cityNames;
  } catch (error) {
    return ['Capital'];
  }
};

export const fetchTariffDetails = async (uf: string, city: string) => {
  const stateData = TARIFF_DATA[uf] || TARIFF_DATA['PADRAO'];
  let info = stateData.default;
  let sourceType = 'STATE_DEFAULT';
  if (stateData.cities && stateData.cities[city]) {
    info = stateData.cities[city];
    sourceType = 'CITY_SPECIFIC';
  }
  return { distribuidora: info.distributor, preco: info.price, uf, cidade: city, sourceType };
};