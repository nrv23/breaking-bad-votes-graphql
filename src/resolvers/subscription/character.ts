import { CHANGE_VOTES } from "./../../config/constants";
import { PubSub } from "graphql-subscriptions";
import { IResolvers } from "@graphql-tools/utils";


const pubsub = new PubSub();

const subscriptionResolvers: IResolvers = {
  Subscription: {
    changeVotes: {
      subscribe: () => { //parent, args,context devuelve undefined
      
        return pubsub.asyncIterator(CHANGE_VOTES);
      },
    },
  },
};

export default subscriptionResolvers;

// No dejar archivos de definiciones type root como query mutation o suscription vacios o con solos la definicion básica porque da error
// Hacer las declaraciones de abril, mayo y junio. No pasarse de hoy
