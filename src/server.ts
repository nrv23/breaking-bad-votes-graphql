import { makeExecutableSchema } from '@graphql-tools/schema';
import { IResolvers } from "@graphql-tools/utils";
import { ApolloServer } from "apollo-server-express";
import compression from "compression";
import express, { Application } from "express"; //es el tipo de aplicacion para express
import { PubSub } from "graphql-subscriptions";
import { GraphQLSchema } from "graphql";
import { Server, createServer } from "http";
// configurar la profundidad de las consultas en graphql para evitar consultas maliciosas o que boten el servidor
//import depthLimit from "graphql-depth-limit";
import result from "./config/environments";

//import { SubscriptionServer } from "subscriptions-transport-ws";
import { WebSocketServer } from "ws";
// work with commonjs and esm
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { CHANGE_VOTES, PHOTO_URL } from "./config/constants";
import * as obj from './schema';
import {
  addVote,
  deleteVote,
  getCharacter,
  getCharacters,
  getCharacterVotes,
  getLastInsertId,
  getVote,
  updateVote,
} from "./lib/database-operations";
import { Db } from "mongodb";
import { Datetime } from "./lib/datetime";
import { Character } from "./interfaces/character";

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
    this.schema = makeExecutableSchema({typeDefs: obj.default.typeDefs, resolvers: this.loadResolversSchema()});
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

      const context: any = async () => {
        return {
  
          pubsub: this.pubsub,
        };
      };

      //const WebSocketServer = WebSocket.Server || WSWebSocketServer;

      const wsServer = new WebSocketServer({
        server: this.httpServer,
        path: "/graphql",
      });

      // Save the returned server's info so we can shutdown this server later
      const serverCleanup = useServer({ schema: this.schema }, wsServer);

      const apolloServer = new ApolloServer({
        schema: this.schema,
        context,
        introspection: true,
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

      await apolloServer.start();

      // configurar el servidor apollo server

      apolloServer.applyMiddleware({ app: this.app, cors: true }); // configurar el cors en apollo server
      /*
        si las propiedades de type Query llevan el simbolo ! quiere decir que tanto su argumento o su valor de retorno no puede ser nulos

        respetar nombres de propiedades de querys con resolvers, se deben llamar igual para evitar errores 
    */
      //resolvers
      //app.use(cors());

      wsServer.on("connection", () => {
        console.log("conectado");
      });

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

  private loadResolversSchema = () => {
    const resolvers: IResolvers = {
      Query: {
        character: async (
          _: void,
          args: { id: String },
          context: {}
        ) => {
          return await getCharacter(args.id);
        },
        characters: async (_: void, __: unknown, context: {  }) => {
          return await getCharacters();
        },
      },
      Mutation: {
        addVote: async (
          _: void,
          args: { character: string },
          context: {  pubsub: PubSub }
        ) => {
          try {
            const exist = await getCharacter(args.character);

            if (!exist) {
              return {
                status: false,
                message: "No existe el personaje",
              };
            }

            const [index] = await getLastInsertId();

            const response = await addVote(
              {
                character: args.character,
                id: !index.id ? "1" : (+index.id + 1).toString(),
                createdAt: new Datetime().getCurrentDateTime(),
              }
            );

            if (!response) {
              return {
                status: false,
                message: "No se pudo agregar el voto",
              };
            }

            context.pubsub.publish(CHANGE_VOTES, {
              changeVotes: await getCharacters(),
            });

            return {
              status: true,
              message: "Se ha agregado el voto con éxito",
              characters: [await getCharacter(args.character)], // meter en un array el resultado de una consulta
            };
          } catch (error) {
            console.log({ error });
            return {
              status: false,
              message: "Hubo un error",
            };
          }
        },
        updateVote: async (
          _: void,
          args: { character: string; idVote: string },
          context: {}
        ) => {
          try {
            const characterExists = await getCharacter(
              args.character,
             
            );

            if (!characterExists) {
              return {
                status: false,
                message: "No existe el personaje",
              };
            }

            const voteExists = await getVote(args.idVote);

            if (!voteExists) {
              return {
                status: false,
                message: "No hay un voto asignado con ese id",
              };
            }

            // actualizar el voto

            const { modifiedCount } = await updateVote(
              args.idVote,
              args.character
            );

            if (modifiedCount === 0) {
              return {
                status: false,
                message: "No se pudo actualizar el voto",
              };
            } else {
              return {
                status: true,
                message: "Voto actualizado con éxito",
                characters: [await getCharacter(args.character)], // meter en un array el resultado de una consulta
              };
            }
          } catch (error) {
            return {
              status: false,
              message: "Hubo un error",
            };
          }
        },

        deleteVote: async (
          _: void,
          args: { id: string },
          context: {  }
        ) => {
          try {
            const voteExists = await getVote(args.id);

            if (!voteExists) {
              return {
                status: false,
                message: "No hay un voto asignado con ese id",
              };
            }

            const { deletedCount } = await deleteVote(args.id);

            if (deletedCount === 0) {
              return {
                status: false,
                message: "No se pudo eliminar el voto",
              };
            } else {
              return {
                status: true,
                message: "Voto eliminado con éxito",
                // characters: [await getCharacters(context.db)], // meter en un array el resultado de una consulta
              };
            }
            console.log();
          } catch (error) {
            return {
              status: false,
              message: "Hubo un error",
            };
          }
        },
      },
      Subscription: {
        changeVotes: {
          subscribe: () => {
            //parent, args,context devuelve undefined
            return this.pubsub.asyncIterator(CHANGE_VOTES);
          },
        },
      },
      Character: {
        // esto va leer la respuesta que sea de tipo Character y añadirle a la propiedad votes un valor
        // los types podrian funcionar como un interceptor.
        votes: async (parent: Character, __: unknown, context: {  }) => {
          

          return await getCharacterVotes(parent.id);
        },
        photo: (parent: Character) => PHOTO_URL.concat(parent.photo),
      },
    };

    return resolvers;
  };

  listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(+this.DEFAULT_PORT);
    });
  }
}

export default GraphQLServer;
