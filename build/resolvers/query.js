"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = __importDefault(require("../data"));
const queryResolvers = {
    Query: {
        hello: () => "Hola a la api de graphql",
        helloWithName: (_, args, context, info) => {
            console.log({ info });
            console.log({ context });
            return `Hola ${args.name}`;
        },
        peopleNumber: () => 1231231,
        booksList: () => {
            return {
                status: true,
                message: "Lista de libros correctamente cargada",
                list: data_1.default.books
            };
        },
        peopleList: () => {
            return {
                status: true,
                message: "Lista de personas cargada correctamente",
                list: data_1.default.people
            };
        },
        getBook: (_, args) => {
            const libro = data_1.default.books.filter(({ id }) => id === args.id)[0];
            return {
                status: typeof libro === 'undefined' ? false : true,
                message: typeof libro === 'undefined' ? 'Sin resultados' : 'Libro encontrado',
                item: libro
            };
        },
        getPerson: (_, args) => {
            const found = data_1.default.people.filter(({ id }) => id === args.id)[0];
            return {
                status: typeof found === 'undefined' ? false : true,
                message: typeof found === 'undefined' ? 'Sin resultados' : 'Persona encontrada',
                item: found
            };
        },
    },
};
exports.default = queryResolvers;
