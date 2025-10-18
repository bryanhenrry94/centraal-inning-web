import { CountryList } from "../data";

export function getSubdomain(hostname: string | undefined) {
  if (!hostname) return null;

  // En dev: tenant1.localhost (o tenant1.localhost:3000)
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000";

  // quitar puerto si existe
  const cleanHost = hostname.split(":")[0];

  // si el host es igual al dominio base → no hay subdominio
  if (cleanHost === baseDomain || cleanHost === "localhost") {
    return null;
  }

  // subdominio = lo que está antes del dominio base
  const parts = cleanHost.split(".");
  if (parts.length < 2) return null;

  return parts[0]; // "tenant1"
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getNameCountry = (code: string) => {
  const country = CountryList.find((c) => c.value === code);
  return country ? country.label : code;
};
