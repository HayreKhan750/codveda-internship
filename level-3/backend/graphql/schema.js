const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    department: String
    role: String!
    isActive: Boolean!
    isOnline: Boolean
    createdAt: Date!
    updatedAt: Date!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    recipient: User!
    isRead: Boolean!
    createdAt: Date!
  }

  type Notification {
    id: ID!
    type: String!
    title: String
    message: String!
    user: User!
    isRead: Boolean!
    createdAt: Date!
  }

  type UserStats {
    totalUsers: Int!
    onlineUsers: Int!
    totalMessages: Int!
    departmentBreakdown: [DepartmentStat!]!
  }

  type DepartmentStat {
    department: String!
    count: Int!
  }

  type Query {
    me: User
    users: [User!]!
    user(id: ID!): User
    messages(userId: ID!): [Message!]!
    conversations: [User!]!
    notifications: [Notification!]!
    unreadNotifications: [Notification!]!
    userStats: UserStats!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, age: Int, department: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(name: String, age: Int, department: String): User!
    sendMessage(recipientId: ID!, content: String!): Message!
    updateMessage(messageId: ID!, content: String!): Message!
    deleteMessage(messageId: ID!): Boolean!
    markAsRead(messageId: ID!): Message!
    markNotificationsRead: Boolean
    createNotification(userId: ID!, type: String!, title: String!, message: String!): Notification!
    updateUserRole(userId: ID!, role: String!): User!
    deactivateUser(userId: ID!): User!
  }

  type Subscription {
    messageSent(userId: ID!): Message!
    notificationReceived: Notification!
    userStatusUpdate: User!
  }
`;

module.exports = typeDefs;
