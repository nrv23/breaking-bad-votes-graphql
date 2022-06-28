import { Character } from './../../interfaces/character';
import { Db } from 'mongodb';
import { IResolvers } from '@graphql-tools/utils';
import { getCharacterVotes } from '../../lib/database-operations';
import { PHOTO_URL } from '../../config/constants';

const typeResolvers: IResolvers =  {

    Character:  { // esto va leer la respuesta que sea de tipo Character y añadirle a la propiedad votes un valor 
        // los types podrian funcionar como un interceptor.
        votes: async (parent: Character  , __:unknown , context: {}) => {

            return await getCharacterVotes(parent.id);
        },
        photo: (parent: Character) => PHOTO_URL.concat(parent.photo)
    }
}


export default typeResolvers;


// hacer declaraciones hoy, mayo, abril y junio