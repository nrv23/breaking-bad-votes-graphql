import { Db } from 'mongodb';
import { IResolvers } from '@graphql-tools/utils';
import { getCharacter,getCharacters } from '../../lib/database-operations';

const characterQueryResolvers : IResolvers  = {
    Query : {
        character: async(_: void, args: { id: String}, context: {}) => {

            return await getCharacter(args.id);
        },
        characters: async(_: void, __:unknown, context: {}) => {

            return await getCharacters();
        }
    }
}


export default characterQueryResolvers;

// No dejar archivos de definiciones type root como query mutation o suscription vacios o con solos la definicion básica porque da error