import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AdminReplyRequest, AdminSessionsResponse, AnthropicConversation, AnthropicConversationInput, AnthropicConversationWithMessages, AnthropicError, AnthropicMessage, AnthropicMessageInput, CreateSessionRequest, GetSupportMessagesParams, HealthStatus, MessagesResponse, SendMessageRequest, SupportMessage, SupportSession, UpdateStatusRequest } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create or resume a support session
 */
export declare const getCreateSupportSessionUrl: () => string;
export declare const createSupportSession: (createSessionRequest: CreateSessionRequest, options?: RequestInit) => Promise<SupportSession>;
export declare const getCreateSupportSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSupportSession>>, TError, {
        data: BodyType<CreateSessionRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSupportSession>>, TError, {
    data: BodyType<CreateSessionRequest>;
}, TContext>;
export type CreateSupportSessionMutationResult = NonNullable<Awaited<ReturnType<typeof createSupportSession>>>;
export type CreateSupportSessionMutationBody = BodyType<CreateSessionRequest>;
export type CreateSupportSessionMutationError = ErrorType<unknown>;
/**
 * @summary Create or resume a support session
 */
export declare const useCreateSupportSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSupportSession>>, TError, {
        data: BodyType<CreateSessionRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSupportSession>>, TError, {
    data: BodyType<CreateSessionRequest>;
}, TContext>;
/**
 * @summary Get messages for a session
 */
export declare const getGetSupportMessagesUrl: (sessionId: string, params?: GetSupportMessagesParams) => string;
export declare const getSupportMessages: (sessionId: string, params?: GetSupportMessagesParams, options?: RequestInit) => Promise<MessagesResponse>;
export declare const getGetSupportMessagesQueryKey: (sessionId: string, params?: GetSupportMessagesParams) => readonly [`/api/support/sessions/${string}/messages`, ...GetSupportMessagesParams[]];
export declare const getGetSupportMessagesQueryOptions: <TData = Awaited<ReturnType<typeof getSupportMessages>>, TError = ErrorType<unknown>>(sessionId: string, params?: GetSupportMessagesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupportMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSupportMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSupportMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof getSupportMessages>>>;
export type GetSupportMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Get messages for a session
 */
export declare function useGetSupportMessages<TData = Awaited<ReturnType<typeof getSupportMessages>>, TError = ErrorType<unknown>>(sessionId: string, params?: GetSupportMessagesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupportMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a message in a session
 */
export declare const getSendSupportMessageUrl: (sessionId: string) => string;
export declare const sendSupportMessage: (sessionId: string, sendMessageRequest: SendMessageRequest, options?: RequestInit) => Promise<SupportMessage>;
export declare const getSendSupportMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendSupportMessage>>, TError, {
        sessionId: string;
        data: BodyType<SendMessageRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendSupportMessage>>, TError, {
    sessionId: string;
    data: BodyType<SendMessageRequest>;
}, TContext>;
export type SendSupportMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendSupportMessage>>>;
export type SendSupportMessageMutationBody = BodyType<SendMessageRequest>;
export type SendSupportMessageMutationError = ErrorType<unknown>;
/**
 * @summary Send a message in a session
 */
export declare const useSendSupportMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendSupportMessage>>, TError, {
        sessionId: string;
        data: BodyType<SendMessageRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendSupportMessage>>, TError, {
    sessionId: string;
    data: BodyType<SendMessageRequest>;
}, TContext>;
/**
 * @summary Get all support sessions (admin)
 */
export declare const getGetAdminSessionsUrl: () => string;
export declare const getAdminSessions: (options?: RequestInit) => Promise<AdminSessionsResponse>;
export declare const getGetAdminSessionsQueryKey: () => readonly ["/api/support/admin/sessions"];
export declare const getGetAdminSessionsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminSessions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminSessionsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminSessions>>>;
export type GetAdminSessionsQueryError = ErrorType<unknown>;
/**
 * @summary Get all support sessions (admin)
 */
export declare function useGetAdminSessions<TData = Awaited<ReturnType<typeof getAdminSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a reply as support agent (admin)
 */
export declare const getSendAdminReplyUrl: (sessionId: string) => string;
export declare const sendAdminReply: (sessionId: string, adminReplyRequest: AdminReplyRequest, options?: RequestInit) => Promise<SupportMessage>;
export declare const getSendAdminReplyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendAdminReply>>, TError, {
        sessionId: string;
        data: BodyType<AdminReplyRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendAdminReply>>, TError, {
    sessionId: string;
    data: BodyType<AdminReplyRequest>;
}, TContext>;
export type SendAdminReplyMutationResult = NonNullable<Awaited<ReturnType<typeof sendAdminReply>>>;
export type SendAdminReplyMutationBody = BodyType<AdminReplyRequest>;
export type SendAdminReplyMutationError = ErrorType<unknown>;
/**
 * @summary Send a reply as support agent (admin)
 */
export declare const useSendAdminReply: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendAdminReply>>, TError, {
        sessionId: string;
        data: BodyType<AdminReplyRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendAdminReply>>, TError, {
    sessionId: string;
    data: BodyType<AdminReplyRequest>;
}, TContext>;
/**
 * @summary Update session status (admin)
 */
export declare const getUpdateSessionStatusUrl: (sessionId: string) => string;
export declare const updateSessionStatus: (sessionId: string, updateStatusRequest: UpdateStatusRequest, options?: RequestInit) => Promise<SupportSession>;
export declare const getUpdateSessionStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSessionStatus>>, TError, {
        sessionId: string;
        data: BodyType<UpdateStatusRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSessionStatus>>, TError, {
    sessionId: string;
    data: BodyType<UpdateStatusRequest>;
}, TContext>;
export type UpdateSessionStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateSessionStatus>>>;
export type UpdateSessionStatusMutationBody = BodyType<UpdateStatusRequest>;
export type UpdateSessionStatusMutationError = ErrorType<unknown>;
/**
 * @summary Update session status (admin)
 */
export declare const useUpdateSessionStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSessionStatus>>, TError, {
        sessionId: string;
        data: BodyType<UpdateStatusRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSessionStatus>>, TError, {
    sessionId: string;
    data: BodyType<UpdateStatusRequest>;
}, TContext>;
/**
 * @summary List all conversations
 */
export declare const getListAnthropicConversationsUrl: () => string;
export declare const listAnthropicConversations: (options?: RequestInit) => Promise<AnthropicConversation[]>;
export declare const getListAnthropicConversationsQueryKey: () => readonly ["/api/anthropic/conversations"];
export declare const getListAnthropicConversationsQueryOptions: <TData = Awaited<ReturnType<typeof listAnthropicConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAnthropicConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAnthropicConversations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAnthropicConversationsQueryResult = NonNullable<Awaited<ReturnType<typeof listAnthropicConversations>>>;
export type ListAnthropicConversationsQueryError = ErrorType<unknown>;
/**
 * @summary List all conversations
 */
export declare function useListAnthropicConversations<TData = Awaited<ReturnType<typeof listAnthropicConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAnthropicConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new conversation
 */
export declare const getCreateAnthropicConversationUrl: () => string;
export declare const createAnthropicConversation: (anthropicConversationInput: AnthropicConversationInput, options?: RequestInit) => Promise<AnthropicConversation>;
export declare const getCreateAnthropicConversationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAnthropicConversation>>, TError, {
        data: BodyType<AnthropicConversationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAnthropicConversation>>, TError, {
    data: BodyType<AnthropicConversationInput>;
}, TContext>;
export type CreateAnthropicConversationMutationResult = NonNullable<Awaited<ReturnType<typeof createAnthropicConversation>>>;
export type CreateAnthropicConversationMutationBody = BodyType<AnthropicConversationInput>;
export type CreateAnthropicConversationMutationError = ErrorType<unknown>;
/**
 * @summary Create a new conversation
 */
export declare const useCreateAnthropicConversation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAnthropicConversation>>, TError, {
        data: BodyType<AnthropicConversationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAnthropicConversation>>, TError, {
    data: BodyType<AnthropicConversationInput>;
}, TContext>;
/**
 * @summary Get conversation with messages
 */
export declare const getGetAnthropicConversationUrl: (id: number) => string;
export declare const getAnthropicConversation: (id: number, options?: RequestInit) => Promise<AnthropicConversationWithMessages>;
export declare const getGetAnthropicConversationQueryKey: (id: number) => readonly [`/api/anthropic/conversations/${number}`];
export declare const getGetAnthropicConversationQueryOptions: <TData = Awaited<ReturnType<typeof getAnthropicConversation>>, TError = ErrorType<AnthropicError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnthropicConversation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAnthropicConversation>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAnthropicConversationQueryResult = NonNullable<Awaited<ReturnType<typeof getAnthropicConversation>>>;
export type GetAnthropicConversationQueryError = ErrorType<AnthropicError>;
/**
 * @summary Get conversation with messages
 */
export declare function useGetAnthropicConversation<TData = Awaited<ReturnType<typeof getAnthropicConversation>>, TError = ErrorType<AnthropicError>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnthropicConversation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Delete a conversation
 */
export declare const getDeleteAnthropicConversationUrl: (id: number) => string;
export declare const deleteAnthropicConversation: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteAnthropicConversationMutationOptions: <TError = ErrorType<AnthropicError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAnthropicConversation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAnthropicConversation>>, TError, {
    id: number;
}, TContext>;
export type DeleteAnthropicConversationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAnthropicConversation>>>;
export type DeleteAnthropicConversationMutationError = ErrorType<AnthropicError>;
/**
 * @summary Delete a conversation
 */
export declare const useDeleteAnthropicConversation: <TError = ErrorType<AnthropicError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAnthropicConversation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAnthropicConversation>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List messages in a conversation
 */
export declare const getListAnthropicMessagesUrl: (id: number) => string;
export declare const listAnthropicMessages: (id: number, options?: RequestInit) => Promise<AnthropicMessage[]>;
export declare const getListAnthropicMessagesQueryKey: (id: number) => readonly [`/api/anthropic/conversations/${number}/messages`];
export declare const getListAnthropicMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listAnthropicMessages>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAnthropicMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAnthropicMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAnthropicMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listAnthropicMessages>>>;
export type ListAnthropicMessagesQueryError = ErrorType<unknown>;
/**
 * @summary List messages in a conversation
 */
export declare function useListAnthropicMessages<TData = Awaited<ReturnType<typeof listAnthropicMessages>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAnthropicMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a message and receive an AI response (SSE stream)
 */
export declare const getSendAnthropicMessageUrl: (id: number) => string;
export declare const sendAnthropicMessage: (id: number, anthropicMessageInput: AnthropicMessageInput, options?: RequestInit) => Promise<unknown>;
export declare const getSendAnthropicMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendAnthropicMessage>>, TError, {
        id: number;
        data: BodyType<AnthropicMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendAnthropicMessage>>, TError, {
    id: number;
    data: BodyType<AnthropicMessageInput>;
}, TContext>;
export type SendAnthropicMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendAnthropicMessage>>>;
export type SendAnthropicMessageMutationBody = BodyType<AnthropicMessageInput>;
export type SendAnthropicMessageMutationError = ErrorType<unknown>;
/**
 * @summary Send a message and receive an AI response (SSE stream)
 */
export declare const useSendAnthropicMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendAnthropicMessage>>, TError, {
        id: number;
        data: BodyType<AnthropicMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendAnthropicMessage>>, TError, {
    id: number;
    data: BodyType<AnthropicMessageInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map