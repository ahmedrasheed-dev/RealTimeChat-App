import React, { useEffect, useRef, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils.js';

const ChatContainer = () => {
    const { authUser, onlineUsers } = useContext(AuthContext);
    const { selectedUser, setSelectedUser, messages, sendMessage, isMessagesLoading } = useContext(ChatContext);

    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const messagesContainerRef = useRef(null);

    // Auto-scroll inside messages container ONLY without scrolling the outer window
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages]);

    // Handle Image file selection (Convert to Base64)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Handle Message Send
    const handleSend = async () => {
        if (!text.trim() && !imagePreview) return;

        await sendMessage({
            text: text.trim(),
            image: imagePreview,
        });

        setText('');
        setImagePreview(null);
    };

    // Empty Welcome State
    if (!selectedUser) {
        return (
            <div className='h-full min-h-0 flex flex-col items-center justify-center p-8 text-center bg-[#15102a]/50 backdrop-blur-md max-md:hidden select-none overflow-hidden'>
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 animate-pulse">
                        <img src={assets.logo_icon} className='w-12 h-12 object-contain' alt="Snapit" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[#15102a] shadow-[0_0_12px_#10b981]"></div>
                </div>
                <h2 className='text-2xl font-bold text-white mb-2 tracking-tight'>Welcome to Snapit</h2>
                <p className='text-sm text-gray-400 max-w-sm mb-6 leading-relaxed'>
                    Select a conversation from the sidebar to start chatting in real-time with end-to-end security.
                </p>

                <div className="flex flex-wrap justify-center gap-3 text-xs text-violet-300">
                    <span className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-sm">⚡ Real-time Sockets</span>
                    <span className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-sm">📷 Image Sharing</span>
                    <span className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-sm">🔒 Encrypted Storage</span>
                </div>
            </div>
        );
    }

    const isOnline = onlineUsers.includes(selectedUser._id);

    return (
        <div className={`h-full min-h-0 flex flex-col relative bg-[#15102a]/60 backdrop-blur-xl overflow-hidden ${!selectedUser ? 'max-md:hidden' : ''}`}>
            {/* Header Bar - flex-shrink-0 keeps header fixed at top without clipping */}
            <div className='flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#120e26]/80 backdrop-blur-xl z-20'>
                <div className="flex items-center gap-3.5">
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="md:hidden p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <img src={assets.arrow_icon} alt="Back" className='w-5 h-5' />
                    </button>
                    
                    <div className="relative flex-shrink-0">
                        <img
                            src={selectedUser.profilePic || assets.avatar_icon}
                            alt={selectedUser.fullName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/40"
                        />
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#120e26] rounded-full shadow-[0_0_6px_#10b981]"></span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <h2 className='text-sm font-bold text-white tracking-wide truncate'>{selectedUser.fullName}</h2>
                        <p className='text-[11px] text-gray-400 flex items-center gap-1.5 truncate'>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-gray-500'}`}></span>
                            {isOnline ? 'Active Now' : 'Offline'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                        <span>💬 Direct Chat</span>
                    </div>
                </div>
            </div>

            {/* Messages Scrollable Area - ref scrolls internally without moving outer window */}
            <div
                ref={messagesContainerRef}
                className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin'
            >
                {isMessagesLoading ? (
                    <div className="text-center py-10 text-gray-400 text-xs flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-xs flex flex-col items-center gap-2">
                        <span className="text-3xl">👋</span>
                        <p className="text-sm font-medium text-white">Say hello to {selectedUser.fullName}!</p>
                        <p className="text-gray-400">Send a message below to start the conversation.</p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isSentByMe = message.senderId === authUser?._id;

                        return (
                            <div
                                key={message._id || index}
                                className={`flex items-end gap-2.5 animate-fade-in ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isSentByMe && (
                                    <img
                                        src={selectedUser.profilePic || assets.avatar_icon}
                                        alt=""
                                        className='w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-white/20'
                                    />
                                )}

                                <div className={`max-w-[78%] sm:max-w-[65%] flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}>
                                    {message.image && (
                                        <div className="mb-1.5 overflow-hidden rounded-2xl border border-white/15 shadow-xl max-w-xs group relative">
                                            <img
                                                src={message.image}
                                                alt="Attachment"
                                                className='max-w-full h-auto object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300 cursor-pointer'
                                                onClick={() => window.open(message.image, '_blank')}
                                            />
                                        </div>
                                    )}
                                    {message.text && (
                                        <div className={`px-4 py-3 text-sm leading-relaxed rounded-2xl break-words shadow-md ${
                                            isSentByMe
                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-xs shadow-violet-900/30'
                                                : 'bg-[#221c3d]/90 border border-white/10 text-gray-100 rounded-bl-xs shadow-black/20'
                                        }`}>
                                            {message.text}
                                        </div>
                                    )}
                                    <span className={`text-[10px] text-gray-400 mt-1 px-1 ${isSentByMe ? 'text-right' : 'text-left'}`}>
                                        {formatMessageTime(message.createdAt)}
                                    </span>
                                </div>

                                {isSentByMe && (
                                    <img
                                        src={authUser?.profilePic || assets.avatar_icon}
                                        alt=""
                                        className='w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-violet-500/40'
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Image Preview overlay */}
            {imagePreview && (
                <div className='flex-shrink-0 mx-4 mb-2 p-2 rounded-2xl bg-[#1d1736] border border-violet-500/50 flex items-center justify-between shadow-2xl backdrop-blur-xl animate-fade-in'>
                    <div className="flex items-center gap-3">
                        <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-white/10" />
                        <div>
                            <p className="text-xs font-semibold text-white">Image attached</p>
                            <p className="text-[10px] text-gray-400">Ready to send</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setImagePreview(null)}
                        className="px-3 py-1 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                    >
                        Remove
                    </button>
                </div>
            )}

            {/* Input Bar Footer - flex-shrink-0 keeps input bar anchored at bottom */}
            <div className='flex-shrink-0 p-4 bg-[#120e26]/80 border-t border-white/10 backdrop-blur-xl'>
                <div className='flex items-center gap-3 bg-white/[0.06] focus-within:bg-white/[0.1] focus-within:ring-2 focus-within:ring-violet-500/50 border border-white/15 rounded-full px-4 py-1.5 transition-all duration-200'>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder='Type a message...'
                        className='flex-1 text-sm py-2.5 bg-transparent border-none outline-none text-white placeholder-gray-400'
                    />
                    
                    <input
                        type="file"
                        id="image"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        hidden
                        onChange={handleImageChange}
                    />
                    <label
                        htmlFor="image"
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition-colors flex-shrink-0"
                        title="Attach Image"
                    >
                        <img src={assets.gallery_icon} alt="Attach" className='w-5 h-5 opacity-70 hover:opacity-100 transition-opacity' />
                    </label>

                    <button
                        onClick={handleSend}
                        disabled={!text.trim() && !imagePreview}
                        className={`p-2.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30 flex-shrink-0 transition-all duration-200 ${
                            !text.trim() && !imagePreview ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'
                        }`}
                    >
                        <img src={assets.send_button} alt="Send" className='w-4 h-4 object-contain invert' />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatContainer;