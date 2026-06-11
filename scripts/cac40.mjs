// CAC 40 constituents (Euronext Paris tickers as Yahoo knows them).
// Order is refined by real market cap via fetch-caps.mjs; founded + sector hand-curated.
import { writeFileSync, mkdirSync } from 'node:fs';

const CAC40 = [
  ['MC.PA', 'LVMH', 'Luxury', 1987],
  ['RMS.PA', 'Hermès', 'Luxury', 1837],
  ['OR.PA', "L'Oréal", 'Cosmetics', 1909],
  ['TTE.PA', 'TotalEnergies', 'Energy', 1924],
  ['SU.PA', 'Schneider Electric', 'Industrials', 1836],
  ['AIR.PA', 'Airbus', 'Aerospace', 1970],
  ['SAN.PA', 'Sanofi', 'Pharma', 1973],
  ['EL.PA', 'EssilorLuxottica', 'Eyewear', 1849],
  ['AI.PA', 'Air Liquide', 'Industrial Gases', 1902],
  ['SAF.PA', 'Safran', 'Aerospace', 2005],
  ['BNP.PA', 'BNP Paribas', 'Banking', 1848],
  ['CS.PA', 'AXA', 'Insurance', 1816],
  ['DG.PA', 'Vinci', 'Construction', 1899],
  ['DSY.PA', 'Dassault Systèmes', 'Software', 1981],
  ['SGO.PA', 'Saint-Gobain', 'Building Materials', 1665],
  ['STLAP.PA', 'Stellantis', 'Automotive', 2021],
  ['ACA.PA', 'Crédit Agricole', 'Banking', 1894],
  ['ENGI.PA', 'Engie', 'Utilities', 2008],
  ['RI.PA', 'Pernod Ricard', 'Spirits', 1975],
  ['LR.PA', 'Legrand', 'Electrical Equipment', 1865],
  ['HO.PA', 'Thales', 'Defense', 2000],
  ['BN.PA', 'Danone', 'Food', 1919],
  ['PUB.PA', 'Publicis', 'Advertising', 1926],
  ['ML.PA', 'Michelin', 'Tires', 1889],
  ['VIE.PA', 'Veolia', 'Utilities', 1853],
  ['KER.PA', 'Kering', 'Luxury', 1963],
  ['ORA.PA', 'Orange', 'Telecom', 1988],
  ['GLE.PA', 'Société Générale', 'Banking', 1864],
  ['CAP.PA', 'Capgemini', 'IT Services', 1967],
  ['BVI.PA', 'Bureau Veritas', 'Testing & Certification', 1828],
  ['STMPA.PA', 'STMicroelectronics', 'Semiconductors', 1987],
  ['AC.PA', 'Accor', 'Hotels', 1967],
  ['EN.PA', 'Bouygues', 'Construction', 1952],
  ['MT.AS', 'ArcelorMittal', 'Steel', 2006],
  ['RNO.PA', 'Renault', 'Automotive', 1899],
  ['CA.PA', 'Carrefour', 'Retail', 1958],
  ['EDEN.PA', 'Edenred', 'Payment Services', 2010],
  ['ERF.PA', 'Eurofins Scientific', 'Lab Services', 1987],
  ['URW.PA', 'Unibail-Rodamco-Westfield', 'Real Estate', 1968],
  ['VIV.PA', 'Vivendi', 'Media', 2000],
];

const companies = CAC40.map(([t, n, s, f]) => ({ t, n, s, f }));
mkdirSync(new URL('../data/cac40', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/cac40/companies.json', import.meta.url), JSON.stringify(companies));
console.log(`Wrote ${companies.length} CAC 40 companies`);
