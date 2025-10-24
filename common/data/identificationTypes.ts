export const identificationOptions = [
  // Persona Natural
  { value: "DNI", label: "DNI" },
  { value: "PASSPORT", label: "PASPOORT" },

  // Empresa
  { value: "KVK", label: "KVK" },
];

export const personTypeOptions = [
  { value: "INDIVIDUAL", label: "NATUURLIJK PERSOON" },
  { value: "COMPANY", label: "BEDRIJF" },
];

export const filterIdentificationOptionsByPersonType = (
  person_type: string
) => {
  if (person_type === "INDIVIDUAL") {
    return identificationOptions.filter((item) =>
      ["DNI", "PASSPORT"].includes(item.value)
    );
  } else if (person_type === "COMPANY") {
    return identificationOptions.filter((item) => ["KVK"].includes(item.value));
  }
  return [];
};
