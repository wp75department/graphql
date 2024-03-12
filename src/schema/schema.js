const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
  }

  type Token {
    token: String!
  }
  type Query {
    users: [User] 
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): Token!
    login(email: String!, password: String!): Token!
    forgotPassword(email: String!): String! 
    resetPassword(resetToken: String!, newPassword: String!): String!
  }
`;

module.exports = typeDefs;
