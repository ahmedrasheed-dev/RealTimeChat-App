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
    const scrollEnd = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle Image file selection (Convert to Base64 string for upload)
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

    if (!selectedUser) {
        return (
            <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
                <img src={assets.logo_icon} className='max-w-16' alt="" />
                <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
            </div>
        );
    }

    const isOnline = onlineUsers.includes(selectedUser._id);

    return (
        <div className='h-full overflow-hidden relative backdrop-blur-lg flex flex-col justify-between'>
            {/* Header part */}
            <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
                <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full object-cover" />
                <p className='flex-1 text-lg text-white flex items-center gap-2'>
                    {selectedUser.fullName}
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </p>
                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7 cursor-pointer' />
                <img src={assets.help_icon} alt="help_icon" className='max-md:hidden max-w-5' />
            </div>

            {/* Chat area */}
            <div className='flex-1 overflow-y-scroll p-3 pb-20'>
                {isMessagesLoading ? (
                    <p className="text-gray-400 text-center py-4 text-sm">Loading messages...</p>
                ) : (
                    messages.map((message, index) => {
                        const isSentByMe = message.senderId === authUser?._id;

                        return (
                            <div
                                key={message._id || index}
                                className={`flex items-end gap-2 my-3 ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isSentByMe && (
                                    <img
                                        src={selectedUser.profilePic || assets.avatar_icon}
                                        alt=""
                                        className='w-7 h-7 rounded-full object-cover'
                                    />
                                )}

                                <div className="max-w-[70%]">
                                    {message.image && (
                                        <img
                                            src={message.image}
                                            alt=""
                                            className='max-w-60 border border-gray-700 rounded-lg mb-1'
                                        />
                                    )}
                                    {message.text && (
                                        <p className={`p-3 text-sm rounded-xl break-words text-white ${
                                            isSentByMe ? 'bg-violet-600/70 rounded-br-none' : 'bg-[#282142] rounded-bl-none'
                                        }`}>
                                            {message.text}
                                        </p>
                                    )}
                                    <p className='text-[10px] text-gray-400 text-right mt-0.5'>
                                        {formatMessageTime(message.createdAt)}
                                    </p>
                                </div>

                                {isSentByMe && (
                                    <img
                                        src={authUser?.profilePic || assets.avatar_icon}
                                        alt=""
                                        className='w-7 h-7 rounded-full object-cover'
                                    />
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={scrollEnd}></div>
            </div>

            {/* Image Preview Overlay */}
            {imagePreview && (
                <div className='absolute bottom-16 left-4 bg-[#282142] p-2 rounded-lg border border-violet-500 flex items-center gap-2 z-10'>
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                    <button onClick={() => setImagePreview(null)} className="text-red-400 text-xs px-2 py-1 font-bold">Remove</button>
                </div>
            )}

            {/* Bottom input area */}
            <div className='absolute bottom-0 left-0 right-0 flex items-center p-3 gap-3 bg-[#1c182d] border-t border-stone-700'>
                <div className='flex-1 flex items-center bg-gray-100/10 px-3 rounded-full'>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder='Type a message...'
                        className='flex-1 text-sm p-3 border-none outline-none text-white placeholder-gray-400 bg-transparent'
                    />
                    <input
                        type="file"
                        id="image"
                        accept="image/png, image/jpeg, image/jpg"
                        hidden
                        onChange={handleImageChange}
                    />
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="Attach" className='w-5 mr-2 cursor-pointer opacity-70 hover:opacity-100' />
                    </label>
                </div>
                <img
                    onClick={handleSend}
                    src={assets.send_button}
                    alt="Send"
                    className='w-8 h-8 cursor-pointer hover:scale-105 transition-transform'
                />
            </div>
        </div>
    );
};

export default ChatContainer;