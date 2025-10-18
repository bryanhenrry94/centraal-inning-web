export const identificationOptions = [
  // Persona Natural
  { value: "DNI", label: "DNI" },
  { value: "PASSPORT", label: "Pasaporte" },

  // Empresa
  { value: "KVK", label: "Registro KVK" },
];

export const personTypeOptions = [
  { value: "individual", label: "Persona Natural" },
  { value: "company", label: "Empresa" },
];

export const filterIdentificationOptionsByPersonType = (personType: string) => {
  if (personType === "individual") {
    return identificationOptions.filter((item) =>
      ["DNI", "PASSPORT"].includes(item.value)
    );
  } else if (personType === "company") {
    return identificationOptions.filter((item) => ["KVK"].includes(item.value));
  }
  return [];
};
