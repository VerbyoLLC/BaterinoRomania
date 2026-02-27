/**
 * Romanian counties with their corresponding cities (reședință + major municipalities).
 * Cities are ordered with county seat first.
 */
export const ROMANIAN_COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov', 'Brăila',
  'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița',
  'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov',
  'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu',
  'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea',
] as const

export type RomanianCounty = (typeof ROMANIAN_COUNTIES)[number]

export const CITIES_BY_COUNTY: Record<RomanianCounty, string[]> = {
  'Alba': ['Alba Iulia', 'Blaj', 'Aiud', 'Sebeș', 'Cugir', 'Ocna Mureș', 'Zlatna'],
  'Arad': ['Arad', 'Lipova', 'Chișineu-Criș', 'Curtici', 'Ineu', 'Pâncota'],
  'Argeș': ['Pitești', 'Câmpulung', 'Curtea de Argeș', 'Mioveni', 'Ștefănești', 'Costești'],
  'Bacău': ['Bacău', 'Onești', 'Moinești', 'Buhuși', 'Comănești', 'Dărmănești', 'Târgu Ocna'],
  'Bihor': ['Oradea', 'Salonta', 'Marghita', 'Beiuș', 'Aleșd', 'Valea lui Mihai', 'Săcueni'],
  'Bistrița-Năsăud': ['Bistrița', 'Beclean', 'Năsăud', 'Sângeorz-Băi'],
  'Botoșani': ['Botoșani', 'Dorohoi', 'Săveni', 'Ștefănești', 'Flămânzi'],
  'Brașov': ['Brașov', 'Făgăraș', 'Codlea', 'Săcele', 'Râșnov', 'Rupea', 'Victoria', 'Zărnești'],
  'Brăila': ['Brăila', 'Făurei', 'Ianca'],
  'București': ['București'],
  'Buzău': ['Buzău', 'Râmnicu Sărat', 'Pătârlagele', 'Nehoiu', 'Pogoanele'],
  'Călărași': ['Călărași', 'Oltenița', 'Fundulea', 'Lehliu-Gară'],
  'Caraș-Severin': ['Reșița', 'Caransebeș', 'Oravița', 'Moldova Nouă', 'Băile Herculane'],
  'Cluj': ['Cluj-Napoca', 'Dej', 'Turda', 'Câmpia Turzii', 'Gherla', 'Huedin'],
  'Constanța': ['Constanța', 'Mangalia', 'Medgidia', 'Cernavodă', 'Năvodari', 'Eforie', 'Techirghiol'],
  'Covasna': ['Sfântu Gheorghe', 'Târgu Secuiesc', 'Covasna', 'Baraolt'],
  'Dâmbovița': ['Târgoviște', 'Moreni', 'Pucioasa', 'Găești', 'Fieni', 'Titu'],
  'Dolj': ['Craiova', 'Băilești', 'Calafat', 'Filiași', 'Segarcea', 'Bechet'],
  'Galați': ['Galați', 'Tecuci', 'Târgu Bujor'],
  'Giurgiu': ['Giurgiu', 'Bolintin-Vale', 'Mihăilești'],
  'Gorj': ['Târgu Jiu', 'Motru', 'Rovinari', 'Târgu Cărbunești', 'Bumbești-Jiu'],
  'Harghita': ['Miercurea Ciuc', 'Odorheiu Secuiesc', 'Gheorgheni', 'Toplița', 'Cristuru Secuiesc', 'Băile Tușnad'],
  'Hunedoara': ['Deva', 'Hunedoara', 'Orăștie', 'Petroșani', 'Lupeni', 'Vulcan', 'Brad', 'Hațeg'],
  'Ialomița': ['Slobozia', 'Fetești', 'Urziceni', 'Țăndărei', 'Amara', 'Căzănești'],
  'Iași': ['Iași', 'Pașcani', 'Târgu Frumos', 'Hârlău', 'Podu Iloaiei'],
  'Ilfov': ['Buftea', 'Otopeni', 'Pantelimon', 'Voluntari', 'Măgurele', 'Chitila', 'Popești-Leordeni', 'Bragadiru'],
  'Maramureș': ['Baia Mare', 'Sighetu Marmației', 'Borșa', 'Cavnic', 'Târgu Lăpuș', 'Vișeu de Sus'],
  'Mehedinți': ['Drobeta-Turnu Severin', 'Orșova', 'Strehaia', 'Vânju Mare', 'Baia de Aramă'],
  'Mureș': ['Târgu Mureș', 'Sighișoara', 'Reghin', 'Târnăveni', 'Luduș', 'Iernut', 'Sovata'],
  'Neamț': ['Piatra Neamț', 'Roman', 'Târgu Neamț', 'Bicaz', 'Roznov', 'Săvinești'],
  'Olt': ['Slatina', 'Caracal', 'Corabia', 'Balș', 'Scornicești', 'Drăgănești-Olt'],
  'Prahova': ['Ploiești', 'Câmpina', 'Sinaia', 'Bușteni', 'Azuga', 'Băicoi', 'Breaza', 'Comarnic'],
  'Sălaj': ['Zalău', 'Jibou', 'Șimleu Silvaniei', 'Cehu Silvaniei'],
  'Satu Mare': ['Satu Mare', 'Carei', 'Negrești-Oaș', 'Tășnad', 'Ardud'],
  'Sibiu': ['Sibiu', 'Mediaș', 'Cisnădie', 'Agnita', 'Avrig', 'Miercurea Sibiului', 'Săliște'],
  'Suceava': ['Suceava', 'Fălticeni', 'Rădăuți', 'Câmpulung Moldovenesc', 'Vatra Dornei', 'Gura Humorului', 'Salcea'],
  'Teleorman': ['Alexandria', 'Roșiorii de Vede', 'Turnu Măgurele', 'Zimnicea', 'Videle'],
  'Timiș': ['Timișoara', 'Lugoj', 'Sânnicolau Mare', 'Jimbolia', 'Recaș', 'Buziaș', 'Făget'],
  'Tulcea': ['Tulcea', 'Babadag', 'Măcin', 'Isaccea', 'Sulina'],
  'Vaslui': ['Vaslui', 'Bârlad', 'Huși', 'Negrești', 'Murgeni'],
  'Vâlcea': ['Râmnicu Vâlcea', 'Drăgășani', 'Călimănești', 'Brezoi', 'Horezu', 'Băile Govora'],
  'Vrancea': ['Focșani', 'Adjud', 'Mărășești', 'Odobești', 'Panciu'],
}

/** Get cities for a county. Returns empty array if county not found. */
export function getCitiesForCounty(county: string): string[] {
  return CITIES_BY_COUNTY[county as RomanianCounty] ?? []
}
