/** Apollo GraphQL server */
import { ApolloServer, gql } from 'apollo-server-koa';
import * as User from "./users/index"

const typeDef = gql`
  type Query
`;

export function createServer() {
    return new ApolloServer({
        typeDefs: [typeDef, User.typeDef],
        // @ts-ignore: 'resolvers' should accept 'Array<IResolvers>'
        // https://github.com/apollographql/apollo-server/issues/1775
        resolvers: [User.resolvers],
        context: ({ ctx }) => {
            return ctx;
        }
    });
}



