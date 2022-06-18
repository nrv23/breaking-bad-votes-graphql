import chalk from "chalk";
import { Db, MongoClient } from "mongodb";

export default class Database {
  db?: Db;

  async init(): Promise<Db | undefined> {
    console.log(
      "========================== DATABASE =========================="
    );

    try {
      const mongoDbUrl = `${process.env.DATABASE}`;
      const mongoCliente = await MongoClient.connect(mongoDbUrl);
      this.db = mongoCliente.db(); // obtener la referencia a la bd conectada
      console.log(`STATUS: ${chalk.green("ONLINE")}`);
      console.log(`DATABASE: ${chalk.green(this.db.databaseName)}`);
    } catch (error) {
      console.log(`ERROR: ${error}`);
      console.log(`STATUS: ${chalk.blue("OFFLINE")}`);
      console.log(`DATABASE: ${chalk.blue(this.db?.databaseName)}`);
    }

    return this.db;
  }
}
