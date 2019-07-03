import { gql } from "apollo-server-koa";

const typeDef = gql`
  type User {
    username: String
    email: String
    verified: Boolean
  }

  extend type Query {
    user: User
  }
`;

export {
    typeDef
};
