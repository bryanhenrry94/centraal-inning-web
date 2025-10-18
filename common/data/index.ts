export const CountryList = [
  { value: "AW", label: "Aruba" },
  { value: "BQ", label: "Bonaire" },
  { value: "CW", label: "Curaçao" },
];

export type Catalogo = {
  id: string;
  nombre: string;
};

export const embargoTipos: Catalogo[] = [
  { id: "1", nombre: "Salario" },
  { id: "2", nombre: "Bienes" },
  { id: "3", nombre: "Bote" },
  { id: "4", nombre: "Auto" },
  { id: "5", nombre: "Terreno" },
  { id: "6", nombre: "Otros" },
];

export const islas: Catalogo[] = [
  { id: "1", nombre: "Bonaire" },
  { id: "2", nombre: "Curaçao" },
];
