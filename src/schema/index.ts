import "graphql-import-node";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLSchema } from "graphql";

import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import resolvers from "./../resolvers";
const typesArray = loadFilesSync(path.join(__dirname, "./graphql"), {
  extensions: ["graphql", "gql"],
});

const typeDefs = mergeTypeDefs(typesArray);

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
}); 

export default { 
  typeDefs,
  schema
};
