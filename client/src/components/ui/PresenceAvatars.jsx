export default function PresenceAvatars({ users }) {
    if (!users || users.length === 0) return null;

    return (
        <div className="flex items-center">
            <div className="flex -space-x-2">
                {users.slice(0, 5).map((user) => (
                    <div
                        key={user.userId}
                        title={user.name}
                        className="w-7 h-7 rounded-full border-2 border-slate-900
                                   flex items-center justify-center
                                   text-white text-xs font-medium
                                   cursor-default"
                        style={{ backgroundColor: user.color }}
                    >
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                ))}
                {users.length > 5 && (
                    <div className="w-7 h-7 rounded-full border-2 border-slate-900
                                    bg-slate-600 flex items-center justify-center
                                    text-white text-xs font-medium">
                        +{users.length - 5}
                    </div>
                )}
            </div>
            <span className="ml-2 text-slate-500 text-xs">
                {users.length} online
            </span>
        </div>
    );
}