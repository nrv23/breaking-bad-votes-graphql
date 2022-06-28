import Database from "../config/database";

// agregar aquí la clase que va ser la instancia de conexion de la base de datos para toda la aplicacion backend
const db = new Database();

async function getConnection() {

    return db.init();
}

export default getConnection;