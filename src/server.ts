import { ApolloServer } from "apollo-server-express";
import compression from "compression";
import express, { Application } from "express"; //es el tipo de aplicacion para express
import { PubSub } from "graphql-subscriptions";
import { GraphQLSchema } from "graphql";
import { Server, createServer } from "http";
// configurar la profundidad de las consultas en graphql para evitar consultas maliciosas o que boten el servidor
//import depthLimit from "graphql-depth-limit";
import result from "./config/environments";
import Database from "./config/database";
//import { SubscriptionServer } from "subscriptions-transport-ws";
import {WebSocketServer} from "ws";


// work with commonjs and esm

import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
class GraphQLServer {
  //propiedades

  private app!: Application;
  private httpServer!: Server;
  private readonly DEFAULT_PORT: number = 5000; // este campo se va leer solamente
  private schema!: GraphQLSchema;
  private pubsub!: PubSub;
  constructor(schema: GraphQLSchema) {
    if (schema === undefined) {
      // si el valor esqyema esta indefinido
      throw new Error("EL valor del schema de graphql es un valor requerido");
    }
    this.schema = schema;
    this.init();
  }

  private init() {
    this.initializeEnviroments();
    this.configExpress();
    this.configApolloServerExpress();
    this.configRoutes();
  }

  private initializeEnviroments(): void {
    if (process.env.NODE_ENV !== "production") {
      // si el ambiente no es produccion use las variables del archivo .env
      const envs = result;
      console.log(envs);
    }
  }

  private configExpress(): void {
    this.app = express();
    this.pubsub = new PubSub();
    this.app.use(compression());
    this.httpServer = createServer(this.app);
  }

  private async configApolloServerExpress() {
    try {
      const database = new Database();
      const db = await database.init();

      const context: any = async () => {
        return {
          db,
          pubsub: this.pubsub
        };
      };

      //const WebSocketServer = WebSocket.Server || WSWebSocketServer;
     
      const wsServer = new WebSocketServer({
        server: this.httpServer,
        path: "/graphql"
      });

      // Save the returned server's info so we can shutdown this server later
      const serverCleanup = useServer({ schema: this.schema }, wsServer);

      const apolloServer = new ApolloServer({
        schema: this.schema,
        introspection: true,
        context,
        cache: "bounded",
        plugins: [
          // Proper shutdown for the HTTP server.
          ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer }),

          // Proper shutdown for the WebSocket server.
          {
            async serverWillStart() {
              return {
                async drainServer() {
                  await serverCleanup.dispose();
                },
              };
            },
          },
        ],
      });
      //validationRules: [depthLimit(10)] esta validacion indica hasta cual nivel de profundidad es permitido consultar
      // por ejemplo en el caso de la api, tiene 3 niveles, y podria limitar incluso al nivel 1 o 2. Limitando el
      // nivel de profundidad se evita que consulte niveles que no existen en la api

      await apolloServer.start()

      // configurar el servidor apollo server

      apolloServer.applyMiddleware({ app: this.app, cors: true }); // configurar el cors en apollo server
      /*
        si las propiedades de type Query llevan el simbolo ! quiere decir que tanto su argumento o su valor de retorno no puede ser nulos

        respetar nombres de propiedades de querys con resolvers, se deben llamar igual para evitar errores 
    */
      //resolvers
      //app.use(cors());

      wsServer.on("connection",() => {
        console.log("conectado");
      })


      // hab9litar el servidor para las suscripciones
    } catch (error) {
      console.log({ error });
      process.exit(1); // si pasa un error detener la ejecución
    }
  }

  private configRoutes(): void {
    this.app.get("/", (_, res) => {
      // habililitar mediante un endpoint de tipo rest, la ruta para consultas a la api de graphql
      res.redirect("/graphql");
    });
    //"nodemon \"src/app.ts\" --exec \"ts-node\" \"src/app.ts\" -e ts,graphql,json" ejecutar usando ts-node el archivo
    //app.ts y escuchar cambios en cualquier extension ts,graphql, json y se podrian meter mas opciones
    /*
          npx tsc -p . && ncp src/schema build/schema
  
          con ncp copiar todos los archivos de la carpeta esquema y pegarlos a la carpeta build/schema
          cuando se haga el proceso de crear el proyecto a produccion
  
          generar el archivo con opciones default tsconfig.json npx tsc --init 
      */
  }

  listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(+this.DEFAULT_PORT);
    });
  }
}

export default GraphQLServer;
