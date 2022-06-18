"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = __importDefault(require("../data"));
const typesResolvers = {
    Data: {
        __resolveType(obj) {
            if (obj.isbn) {
                return "Book";
            }
            if (obj.name) {
                return "People";
            }
        },
    },
    People: {
        booksBuy: (root) => {
            return data_1.default.books.filter((book) => root.books.indexOf(book.id) > -1);
        },
        website: (root) => {
            return !root.website ? "" : root.website;
        },
        github: (root) => {
            return !root.github ? "" : root.github;
        },
        twitter: (root) => {
            return !root.twitter ? "" : root.twitter;
        },
    },
    Book: {
        byPeopleBuy: (root) => {
            return data_1.default.people.filter((p) => p.books.indexOf(root.id) > -1);
        },
        publishedDate: (root) => {
            if (!root.publishedDate) {
                return "";
            }
            return root.publishedDate;
        },
        thumbnailUrl: (root) => {
            if (!root.thumbnailUrl) {
                return "";
            }
            return root.thumbnailUrl;
        },
        shortDescription: (root) => {
            if (!root.shortDescription) {
                return "";
            }
            return root.shortDescription;
        },
        longDescription: (root) => {
            return typeof root.longDescription === "undefined"
                ? ""
                : root.longDescription;
        },
    },
};
exports.default = typesResolvers;
