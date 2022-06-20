import { COLLECTIONS } from "./../config/constants";
import { Db } from "mongodb";
// lista de personajes

export async function getCharacters(db: Db) {
  return await db
    .collection(COLLECTIONS.CHARACTERS)
    .find()
    .sort({ id: 1 })
    .toArray();
}

export async function getCharacter(id: String, db: Db) {
  return await db.collection(COLLECTIONS.CHARACTERS).findOne({ id });
}


export async function getCharacterVotes(id: String, db: Db) { 

  return (await db.collection(COLLECTIONS.VOTES).find({ character: id }).toArray()).length;

}