import { gql } from '@apollo/client'

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      department
      age
      isOnline
      createdAt
    }
  }
`

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      department
      age
      isOnline
      createdAt
    }
  }
`

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
      }
      isRead
      createdAt
    }
  }
`

export const GET_CONVERSATIONS = gql`
  query GetConversations {
    conversations {
      id
      name
      email
      role
      department
      isOnline
    }
  }
`

export const GET_USER_STATS = gql`
  query GetUserStats {
    userStats {
      totalUsers
      onlineUsers
      totalMessages
      departmentBreakdown {
        department
        count
      }
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($recipientId: ID!, $content: String!) {
    sendMessage(recipientId: $recipientId, content: $content) {
      id
      content
      sender {
        id
        name
      }
      recipient {
        id
        name
      }
      isRead
      createdAt
    }
  }
`

export const MARK_AS_READ = gql`
  mutation MarkAsRead($messageId: ID!) {
    markAsRead(messageId: $messageId) {
      id
      isRead
    }
  }
`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $age: Int, $department: String) {
    updateProfile(name: $name, age: $age, department: $department) {
      id
      name
      age
      department
    }
  }
`

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      name
      role
    }
  }
`

export const MARK_NOTIFICATIONS_READ = gql`
  mutation MarkNotificationsRead {
    markNotificationsRead
  }
`

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($userId: ID!) {
    deactivateUser(userId: $userId) {
      id
      isActive
    }
  }
`

export const MESSAGE_SENT = gql`
  subscription MessageSent($userId: ID!) {
    messageSent(userId: $userId) {
      id
      content
      sender {
        id
        name
      }
      recipient {
        id
        name
      }
      isRead
      createdAt
    }
  }
`

export const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived {
    notificationReceived {
      id
      message
      type
      isRead
      createdAt
    }
  }
`

