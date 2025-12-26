import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    bio?: string;
    isFollowing?: boolean;
  };
}

const UserCard = ({ user }: UserCardProps) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFollowing(!isFollowing);
  };

  return (
    <Link
      to={`/user/${user.username}`}
      className="flex items-start gap-3 p-4 transition-colors hover:bg-surface-hover"
    >
      <Avatar className="h-10 w-10 border border-border">
        <AvatarImage src={user.avatar} alt={user.displayName} />
        <AvatarFallback className="bg-secondary text-xs">
          {user.displayName.slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{user.displayName}</p>
            <p className="text-sm text-muted-foreground truncate">
              @{user.username}
            </p>
          </div>
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={handleFollow}
            className="shrink-0"
          >
            {isFollowing ? "متابَع" : "متابعة"}
          </Button>
        </div>
        {user.bio && (
          <p className="mt-1 text-sm line-clamp-2">{user.bio}</p>
        )}
      </div>
    </Link>
  );
};

export default UserCard;
