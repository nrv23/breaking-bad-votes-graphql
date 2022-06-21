import { VoteResponse, IVote } from "./../interfaces/vote";
import { COLLECTIONS } from "./../config/constants";
import { Db, DeleteResult, UpdateResult } from "mongodb";
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
  return (
    await db.collection(COLLECTIONS.VOTES).find({ character: id }).toArray()
  ).length;
}

export async function getLastInsertId(db: Db) {
  // tipar el resultado de la coleccion db.collection<VoteResponse>
  return await db
    .collection<VoteResponse>(COLLECTIONS.VOTES)
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray();
}

export async function addVote(vote: IVote, db: Db) {
  return await db.collection(COLLECTIONS.VOTES).insertOne(vote);
}

export async function getVote(id: String, db: Db) {
  return await db.collection(COLLECTIONS.VOTES).findOne({ id });
}

export async function updateVote(id: String, character: string, db: Db) {
  return await db.collection<UpdateResult>(COLLECTIONS.VOTES).updateOne(
    { id },
    {
      $set: {
        character,
      },
    }
  );
}

export async function deleteVote(id: String, db: Db) {
  return await db.collection<DeleteResult>(COLLECTIONS.VOTES).deleteOne({ id });
}
