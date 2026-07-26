import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    // storing messages for selected user
    const [messages, setMessages] = useState([]);
    // storing all users for left sidebar
    const [users, setUsers] = useState([]);
    // selected user to chat with
    const [selectedUser, setSelectedUser] = useState(null);
    // map of user ID to unseen message count { [userId]: number }
    const [unseenMessages, setUnseenMessages] = useState({});

    // loading states
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);

    const { axios, socket, authUser } = useContext(AuthContext);

    // Fetch sidebar users and unread counts
    const getUsers = async () => {
        setIsUsersLoading(true);
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unSeenMessages || {});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsUsersLoading(false);
        }
    };

    // Fetch messages for a specific user
    const getMessages = async (userId) => {
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
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsMessagesLoading(false);
        }
    };

    // Send a message to the currently selected user
    const sendMessage = async (messageData) => {
        if (!selectedUser) return;
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
                return data.message;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
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

        const handleNewMessage = (newMessage) => {
            const isMessageFromSelectedUser = selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id);

            if (isMessageFromSelectedUser) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                newMessage.seen = true;
                axios.put(`/api/messages/mark/${newMessage._id}` );
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