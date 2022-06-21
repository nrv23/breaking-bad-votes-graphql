import { Datetime } from "./../../lib/datetime";
import { Db } from "mongodb";
import { IResolvers } from "@graphql-tools/utils";
import {
  addVote,
  deleteVote,
  getCharacter,
  getCharacters,
  getLastInsertId,
  getVote,
  updateVote,
} from "../../lib/database-operations";

const mutationCharacterRolvers: IResolvers = {
  Mutation: {
    addVote: async (
      _: void,
      args: { character: string },
      context: { db: Db }
    ) => {
      try {
        const exist = await getCharacter(args.character, context.db);

        if (!exist) {
          return {
            status: false,
            message: "No existe el personaje",
          };
        }

        const [index] = await getLastInsertId(context.db);

        const response = await addVote(
          {
            character: args.character,
            id: !index.id ? "1" : (+index.id + 1).toString(),
            createdAt: new Datetime().getCurrentDateTime(),
          },
          context.db
        );

        if (!response) {
          return {
            status: false,
            message: "No se pudo agregar el voto",
          };
        }

        return {
          status: true,
          message: "Se ha agregado el voto con éxito",
          characters: [await getCharacter(args.character, context.db)], // meter en un array el resultado de una consulta
        };
      } catch (error) {
        return {
          status: false,
          message: "Hubo un error",
        };
      }
    },
    updateVote: async (
      _: void,
      args: { character: string; idVote: string },
      context: { db: Db }
    ) => {
      try {
        const characterExists = await getCharacter(args.character, context.db);

        if (!characterExists) {
          return {
            status: false,
            message: "No existe el personaje",
          };
        }

        const voteExists = await getVote(args.idVote, context.db);

        if (!voteExists) {
          return {
            status: false,
            message: "No hay un voto asignado con ese id",
          };
        }

        // actualizar el voto

        const { modifiedCount } = await updateVote(
          args.idVote,
          args.character,
          context.db
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
            characters: [await getCharacter(args.character, context.db)], // meter en un array el resultado de una consulta
          };
        }
      } catch (error) {
        return {
          status: false,
          message: "Hubo un error",
        };
      }
    },

    deleteVote: async (_: void, args: { id: string }, context: { db: Db }) => {
      try {
        const voteExists = await getVote(args.id, context.db);

        if (!voteExists) {
          return {
            status: false,
            message: "No hay un voto asignado con ese id",
          };
        }

        const { deletedCount } = await deleteVote(args.id, context.db);


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
        console.log()
      } catch (error) {
        return {
          status: false,
          message: "Hubo un error",
        };
      }
    },
  },
};

export default mutationCharacterRolvers;
