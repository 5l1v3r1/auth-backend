import User from "./User";
import { IResolvers } from 'apollo-server-koa';
const resolvers: IResolvers = {
    Query: {
        user: async (parent, args, ctx) => {
            try {
                let user = await User.findOne({ email: ctx.state.jwtdata.email });
                return {
                    username: user.username,
                    email: user.email,
                    verified: user.verified
                }

            } catch (err) {
                ctx.throw(500, err);
            }
        }
    },
};
export {
    resolvers
}