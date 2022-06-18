import GraphQLServer from "./server";
import schema from './schema';

const graphqlServer = new GraphQLServer(schema);

graphqlServer.listen((port: number) => {
    console.log(`Servidor corriendo en puerto ${port}`);
    console.log(`http://localhost:${port}/graphql`);
});


// se crea un archivo llamado nodemon.json que configura eventos donde al ejecutar el evento se puede
// ejecutar un comando. En este caso al ejecutar el evento restart de nodemon
// se va ejecutar el script lint para revisar el codigo