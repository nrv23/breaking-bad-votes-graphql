import { Db } from 'mongodb';
import { IResolvers } from '@graphql-tools/utils';
import { getCharacter,getCharacters } from '../../lib/database-operations';

const characterQueryResolvers : IResolvers  = {
    Query : {
        character: async(_: void, args: { id: String}, context: {db:Db}) => {

            return await getCharacter(args.id,context.db);
        },
        characters: async(_: void, __:unknown, context: {db:Db}) => {

            return await getCharacters(context.db);
        }
    }
}


export default characterQueryResolvers;

// No dejar archivos de definiciones type root como query mutation o suscription vacios o con solos la definicion básica porque da error