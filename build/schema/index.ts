import "graphql-import-node"; // importar ese paquete para que no de problema cuando se importen archivos con extension graphql
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from "graphql";
import resolvers from '../resolvers';
//import typeDefs from './schema.graphql';

import { loadFilesSync} from "@graphql-tools/load-files";
import { mergeTypeDefs} from "@graphql-tools/merge";
import path from "path";

// esta configuracion lo que permite es que, dentro de una carpeta 
// en este caso llamada graphql, cargar todos los archivos que sean esquemas
// 
const typesArray = loadFilesSync(path.join(__dirname,'./graphql'),{extensions: ["graphql"]});
// el loadFIleSync carga todos esos archivos en una sola carga automaticamente y no hay necesidad de importar 
// archivos de extension graphql porque los va cargar todos de una carpeta

const typeDefs = mergeTypeDefs(typesArray); // mezcla todos los schemas en uno solo

 const schema: GraphQLSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  export default schema;