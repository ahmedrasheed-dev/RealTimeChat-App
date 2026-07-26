import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import assets from '../assets/assets';

const RightSidebar = () => {
    const { authUser, logout, onlineUsers } = useContext(AuthContext);
    const { selectedUser, messages } = useContext(ChatContext);

    // Displays selected user if chat is active, otherwise displays logged-in user (yourself)
    const userToDisplay = selectedUser || authUser;

    if (!userToDisplay) return null;

    const isOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : true;

    // Extract image URLs from active conversation messages
    const mediaImages = selectedUser
        ? messages.filter((msg) => msg.image).map((msg) => msg.image)
        : [];

    return (
        <div className={`bg-[#120e26]/80 backdrop-blur-xl h-full min-h-0 flex flex-col border-l border-white/10 text-white max-md:hidden select-none overflow-hidden`}>
            {/* User Profile Card Header - flex-shrink-0 */}
            <div className='flex-shrink-0 p-6 flex flex-col items-center text-center border-b border-white/5'>
                <div className="relative mb-3">
                    <img
                        src={userToDisplay?.profilePic || assets.avatar_icon}
                        className='w-20 h-20 rounded-full object-cover ring-4 ring-violet-500/30 shadow-xl'
                        alt={userToDisplay?.fullName}
                    />
                    {isOnline && (
                        <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#120e26] rounded-full shadow-[0_0_10px_#10b981]"></span>
                    )}
                </div>

                <h2 className='text-lg font-bold text-white flex items-center justify-center gap-2 mb-1 truncate max-w-full'>
                    {userToDisplay?.fullName}
                </h2>
                
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 mb-3">
                    {selectedUser ? (isOnline ? '🟢 Online' : '⚪ Offline') : '👤 Your Account'}
                </span>

                <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3 text-left">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-violet-400 mb-1">About / Bio</p>
                    <p className='text-xs text-gray-300 leading-relaxed truncate-2-lines'>
                        {userToDisplay?.bio || 'Hey there! I am using Snapit chat app.'}
                    </p>
                </div>
            </div>

            {/* Media Gallery Section - flex-1 min-h-0 */}
            <div className='flex-1 min-h-0 p-5 overflow-y-auto scrollbar-thin'>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                        <span>🖼️ Shared Media</span>
                    </h3>
                    {mediaImages.length > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
                            {mediaImages.length}
                        </span>
                    )}
                </div>

                <div className='grid grid-cols-2 gap-2.5'>
                    {mediaImages.length > 0 ? (
                        mediaImages.map((url, index) => (
                            <div
                                key={index}
                                onClick={() => window.open(url, '_blank')}
                                className='group cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-square relative shadow-md hover:border-violet-500/50 transition-all duration-300'
                            >
                                <img
                                    src={url}
                                    alt="Shared media"
                                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                                />
                                <div className="absolute inset-0 bg-violet-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                                    View ↗
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-8 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                            <p className="text-2xl mb-1">🌄</p>
                            <p className="text-xs text-gray-400">
                                {selectedUser ? "No media shared in this chat yet" : "Select a conversation to view shared media"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Action Button - flex-shrink-0 */}
            <div className="flex-shrink-0 p-5 border-t border-white/5">
                <button
                    onClick={logout}
                    className='w-full py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-red-500/10'
                >
                    <span>🚪</span>
                    <span>Logout Account</span>
                </button>
            </div>
        </div>
    );
};

export default RightSidebar;