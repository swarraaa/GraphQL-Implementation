const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

async function startServer() {
  const app = express();

  const typeDefs = `
        type User {
            id: ID!
            name: String!
            username: String!
            email: String!
        }
        type Todo {
            id: ID!
            title: String!
            completed: Boolean!
            user: User
        }
        
        type Query {
            getTodos: [Todo]
            getUsers: [User]
            getUser(id: ID!): User
        }
    `;

  const resolvers = {
    Todo: {
      user: async (todo) =>
        (
          await axios.get(
            `https://jsonplaceholder.typicode.com/users/${todo.userId}`
          )
        ).data,
    },
    Query: {
      getTodos: async () =>
        (await axios.get("https://jsonplaceholder.typicode.com/todos")).data,
      getUsers: async () =>
        (await axios.get("https://jsonplaceholder.typicode.com/users")).data,
      getUser: async (_, { id }) =>
        (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`))
          .data,
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  app.use(bodyParser.json());
  app.use(cors());

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  app.listen(8000, () => console.log("Server listening at PORT 8000"));
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
});
