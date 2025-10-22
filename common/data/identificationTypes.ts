export const identificationOptions = [
  // Persona Natural
  { value: "DNI", label: "DNI" },
  { value: "PASSPORT", label: "Pasaporte" },

  // Empresa
  { value: "KVK", label: "Registro KVK" },
];

export const personTypeOptions = [
  { value: "INDIVIDUAL", label: "Persona Natural" },
  { value: "COMPANY", label: "Empresa" },
];

export const filterIdentificationOptionsByPersonType = (personType: string) => {
  if (personType === "INDIVIDUAL") {
    return identificationOptions.filter((item) =>
      ["DNI", "PASSPORT"].includes(item.value)
    );
  } else if (personType === "COMPANY") {
    return identificationOptions.filter((item) => ["KVK"].includes(item.value));
  }
  return [];
};
