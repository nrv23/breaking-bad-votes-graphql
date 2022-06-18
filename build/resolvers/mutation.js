"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = __importDefault(require("../data"));
const mutationResolvers = {
    Mutation: {
        addBook: (_, args) => {
            const found = data_1.default.books.filter(value => value.title === args.book.title)[0];
            if (found) {
                return {
                    message: `El libro ${args.book.title} ya existe`,
                    status: false
                };
            }
            const id = +data_1.default.books[data_1.default.books.length - 1].id + 1;
            args.book.id = id.toString();
            data_1.default.books.push(args.book);
            return {
                status: true,
                message: "Nuevo libro agregado correctamente",
                item: args.book
            };
        },
        updateBook: (_, args) => {
            let found = null;
            for (let i = 0; i < data_1.default.books.length; i++) {
                if (data_1.default.books[i].id === args.book.id) {
                    found = data_1.default.books[i] = args.book;
                    break;
                }
            }
            if (!found) {
                return {
                    message: `Está intentando actualizar un libro que no existe`,
                    status: false
                };
            }
            return {
                status: true,
                message: `El libro ${args.book.title} se ha actualizado correctamente`,
                item: found
            };
        },
        deleteBook: (_, args) => {
            let found = null;
            for (let i = 0; i < data_1.default.books.length; i++) {
                if (data_1.default.books[i].id === args.id) {
                    found = data_1.default.books[i];
                    break;
                }
            }
            if (!found) {
                return {
                    status: false,
                    message: `Èl libro con ID ${args.id} no existe`
                };
            }
            data_1.default.books = data_1.default.books.filter((value) => value.id !== args.id);
            return {
                status: true,
                message: "Se ha borrado el libro",
                item: found
            };
        },
        addPerson: (_, args) => {
            const found = data_1.default.people.filter(person => person.name === args.person.name)[0];
            if (found) {
                return {
                    status: false,
                    message: `La persona con nombre ${args.person.name} ya existe`
                };
            }
            const id = +data_1.default.people[data_1.default.people.length - 1].id + 1;
            args.person.id = id.toString();
            data_1.default.people.push(args.person);
            return {
                status: true,
                message: "Se ha agregado correctamente",
                item: args.person
            };
        },
        updatePerson: (_, args) => {
            let found = null;
            for (let i = 0; i < data_1.default.people.length; i++) {
                if (data_1.default.people[i].id === args.person.id) {
                    found = data_1.default.people[i] = args.person;
                    break;
                }
            }
            if (!found) {
                return {
                    status: false,
                    message: `La persona con id ${args.person.id} no existe`
                };
            }
            return {
                status: true,
                message: "Se ha actualizado correctamente",
                item: found
            };
        },
        deletePerson: (_, args) => {
            const deleted = data_1.default.people.filter(person => person.id !== args.id);
            if (deleted.length > 0 && deleted.length < data_1.default.people.length) {
                data_1.default.people = deleted;
                return {
                    status: true,
                    message: "Se ha borrado correctamente"
                };
            }
            else {
                return {
                    status: false,
                    message: `No se encontró una persona con el id ${args.id}`
                };
            }
        }
    }
};
exports.default = mutationResolvers;
