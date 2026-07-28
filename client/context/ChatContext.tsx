import { createContext, useState, useEffect, useContext, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { AuthContext } from "./AuthContext.js";
import { toast } from "react-hot-toast";
import type { IUser } from "../src/types/user.types.js";
import { isAxiosError } from "axios";

export interface IMessage {
    _id: string;
    senderId: string;
    receiverId: string;
    text: string;
    image?: string;
    seen?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface ImessageData {
    text?: string | null;
    image?: string | null;
}
export interface IChatContext {
    messages: IMessage[];
    users: IUser[];
    selectedUser: IUser | null;
    unseenMessages: Record<string, number>;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    setMessages: Dispatch<SetStateAction<IMessage[]>>;
    setUsers: Dispatch<SetStateAction<IUser[]>>;
    setSelectedUser: Dispatch<SetStateAction<IUser | null>>;
    setUnseenMessages: Dispatch<SetStateAction<Record<string, number>>>;
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: ImessageData) => Promise<any>;
}
interface ChatProviderProps {
    children: ReactNode;
}
export const ChatContext = createContext<IChatContext>({} as IChatContext);

export const ChatProvider = ({ children }: ChatProviderProps) => {
    // storing messages for selected user
    const [messages, setMessages] = useState<IMessage[]>([]);
    // storing all users for left sidebar
    const [users, setUsers] = useState<IUser[]>([]);
    // selected user to chat with
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    // map of user ID to unseen message count { [userId]: number }
    const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});

    // loading states
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);

    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext must be used within AuthProvider');
    }
    const { axios, socket, authUser } = authContext;

    // Fetch sidebar users and unread counts
    const getUsers = async () => {
        setIsUsersLoading(true);
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unSeenMessages || {});
            }
        } catch (error: unknown) {
            const msg = isAxiosError(error)
                ? (error.response?.data as { message?: string | undefined })?.message
                : undefined;
            const message = msg || (error instanceof Error ? error.message : 'An unexpected error occurred.');

            toast.error(message);
        } finally {
            setIsUsersLoading(false);
        }
    };

    // Fetch messages for a specific user
    const getMessages = async (userId: string) => {
        setIsMessagesLoading(true);
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
                // Clear unread count for this user
                setUnseenMessages((prev) => {
                    const updated = { ...prev };
                    delete updated[userId];
                    return updated;
                });
            }
        } catch (error: unknown) {
            const msg = isAxiosError(error)
                ? (error.response?.data as { message?: string | undefined })?.message
                : undefined;
            const message = msg || (error instanceof Error ? error.message : 'An unexpected error occurred.');
            toast.error(message);
        } finally {
            setIsMessagesLoading(false);
        }
    };

    // Send a message to the currently selected user
    const sendMessage = async (messageData: ImessageData) => {
        if (!selectedUser) return;
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
                return data.message;
            }
        } catch (error: unknown) {
            const msg = isAxiosError(error)
                ? (error.response?.data as { message?: string | undefined })?.message
                : undefined;
            const message = msg || (error instanceof Error ? error.message : 'An unexpected error occurred.');
            toast.error(message);
        }
    };

    // Fetch users automatically when user logs in
    useEffect(() => {
        if (authUser) {
            getUsers();
        } else {
            setUsers([]);
            setMessages([]);
            setSelectedUser(null);
            setUnseenMessages({});
        }
    }, [authUser]);

    // Socket listener for incoming real-time messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage: IMessage) => {
            const isMessageFromSelectedUser = selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id);

            if (isMessageFromSelectedUser) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                newMessage.seen = true;
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        isUsersLoading,
        isMessagesLoading,
        setMessages,
        setUsers,
        setSelectedUser,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};