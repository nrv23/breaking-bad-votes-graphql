import { mergeResolvers } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";

// cada vez que se cargue un resolver de tipo ts o js se va cargar y fusionar automaticamente

const resolverArray = loadFilesSync(path.join(__dirname), {
  extensions: ["ts", "js"],
}); // carga todos los ficheros de extension ts y js excepto el archivo de entrada index

const resolversIndex =  mergeResolvers(resolverArray);
export default resolversIndex;
