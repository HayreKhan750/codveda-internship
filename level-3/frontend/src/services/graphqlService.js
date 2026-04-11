import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_SERVER_URL ? `${import.meta.env.VITE_SERVER_URL}/graphql` : 'http://localhost:5000/graphql',
});

// GraphQL Client
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      age
      department
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      age
      department
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      age
      department
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($userId: ID!) {
    messages(userId: $userId) {
      id
      content
      sender {
        id
        name
        email
      }
      recipient {
        id
        name
        email
      }
      timestamp
    }
  }
`;

export const GET_CONVERSATION = gql`
  query GetConversation($userId: ID!) {
    conversation(userId: $userId) {
      id
      content
      sender {
        id
        name
        email
      }
      recipient {
        id
        name
        email
      }
      timestamp
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      type
      title
      message
      isRead
      createdAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotifications {
    unreadNotifications {
      id
      type
      title
      message
      isRead
      createdAt
    }
  }
`;

export const GET_USER_STATS = gql`
  query GetUserStats {
    userStats {
      totalUsers
      activeUsers
      usersByDepartment {
        department
        count
      }
    }
  }
`;

// GraphQL Mutations
export const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $age: Int, $department: String!) {
    register(name: $name, email: $email, password: $password, age: $age, department: $department) {
      token
      user {
        id
        name
        email
        age
        department
        role
        isActive
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        age
        department
        role
        isActive
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $age: Int, $department: String) {
    updateProfile(name: $name, age: $age, department: $department) {
      id
      name
      email
      age
      department
      role
      isActive
      updatedAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($recipientId: ID!, $content: String!) {
    sendMessage(recipientId: $recipientId, content: $content) {
      id
      content
      sender {
        id
        name
        email
      }
      recipient {
        id
        name
        email
      }
      timestamp
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationRead(notificationId: $notificationId) {
      id
      type
      title
      message
      isRead
      createdAt
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($userId: ID!, $type: String!, $title: String!, $message: String!) {
    createNotification(userId: $userId, type: $type, title: $title, message: $message) {
      id
      type
      title
      message
      isRead
      createdAt
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      name
      email
      role
      updatedAt
    }
  }
`;

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($userId: ID!) {
    deactivateUser(userId: $userId) {
      id
      name
      email
      isActive
      updatedAt
    }
  }
`;

// GraphQL Subscriptions
export const MESSAGE_RECEIVED = gql`
  subscription MessageReceived($userId: ID!) {
    messageReceived(userId: $userId) {
      id
      content
      sender {
        id
        name
        email
      }
      recipient {
        id
        name
        email
      }
      timestamp
    }
  }
`;

export const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived($userId: ID!) {
    notificationReceived(userId: $userId) {
      id
      type
      title
      message
      isRead
      createdAt
    }
  }
`;

export const USER_STATUS_UPDATE = gql`
  subscription UserStatusUpdate {
    userStatusUpdate {
      id
      name
      email
      status
      timestamp
    }
  }
`;
