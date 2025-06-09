import { Parser } from "../types";

const registeredParsers: Parser[] = [];

export const registerParser = (parser: Parser) => {
  registeredParsers.push(parser);
};

export const getRegisteredParsers = () => registeredParsers;