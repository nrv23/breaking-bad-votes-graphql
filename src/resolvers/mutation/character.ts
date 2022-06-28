import { PubSub } from 'graphql-subscriptions';
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
import { CHANGE_VOTES } from "../../config/constants";

const mutationCharacterRolvers: IResolvers = {
  Mutation: {
    addVote: async (
      _: void,
      args: { character: string },
      context: {  pubsub: PubSub }
    ) => {
      
      try {
        const exist = await getCharacter(args.character, );

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
          characters: [await getCharacter(args.character )], // meter en un array el resultado de una consulta
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
      context: {  }
    ) => {
      try {
        const characterExists = await getCharacter(args.character );

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

    deleteVote: async (_: void, args: { id: string }, context: { }) => {
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
};

export default mutationCharacterRolvers;
