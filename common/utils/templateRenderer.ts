import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

const renderTemplate = (
  templateName: string,
  data: Record<string, any>
): string => {
  try {
    const projectRoot = path.resolve();

    const templatePath = path.join(
      projectRoot,
      `src/common/Mail/templates/${templateName}.html`
    );

    const templateSource = fs.readFileSync(templatePath, "utf8");

    // Compila la plantilla con Handlebars
    const template = Handlebars.compile(templateSource);

    // Renderiza el HTML con los datos
    const result = template(data);
    return result;
  } catch (error) {
    console.error("Error in renderTemplate:", error);
    throw error;
  }
};

export default renderTemplate;
