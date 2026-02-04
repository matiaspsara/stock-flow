import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date: Date | string, pattern: string = "dd/MM/yyyy") {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return format(parsed, pattern, { locale: es });
}
