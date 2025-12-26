import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";

interface UserHoverCardProps {
  username: string;
  displayName: string;
  avatar?: string;
  children: React.ReactNode;
}

const UserHoverCard = ({
  username,
  displayName,
  avatar,
  children,
}: UserHoverCardProps) => {
  const [userData, setUserData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();

  // Check if this is the current user
  const isCurrentUser = user?.username === username;

  useEffect(() => {
    // Fetch user data when hover card opens
    const fetchUserData = async () => {
      try {
        const response = await usersAPI.getUser(username);
        setUserData(response.data.user);
        setIsFollowing(response.data.user.isFollowing || false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [username]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userData) return;

    try {
      await usersAPI.followUser(userData.id);
      setIsFollowing(!isFollowing);
      // Update follower count
      if (userData) {
        setUserData({
          ...userData,
          followersCount: isFollowing
            ? userData.followersCount - 1
            : userData.followersCount + 1,
        });
      }
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
    }
  };

  const bio = userData?.bio || "";
  const followers = userData?.followersCount || 0;
  const following = userData?.followingCount || 0;

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-72 p-4"
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <div className="flex flex-col gap-3">
          {/* Header with avatar and follow button */}
          <div className="flex items-start justify-between">
            <Link to={`/user/${username}`}>
              <Avatar className="h-14 w-14 border-2 border-border">
                <AvatarImage src={avatar} alt={displayName} />
                <AvatarFallback className="bg-secondary text-sm">
                  {displayName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </Link>
            {!isCurrentUser && (
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
                className="text-xs"
              >
                {isFollowing ? "متابَع" : "متابعة"}
              </Button>
            )}
          </div>

          {/* Name and username */}
          <div>
            <Link
              to={`/user/${username}`}
              className="font-bold hover:underline block"
            >
              {displayName}
            </Link>
            <span className="text-muted-foreground text-sm">@{username}</span>
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-sm text-foreground leading-relaxed">{bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <Link
              to={`/user/${username}`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-bold">
                {following.toLocaleString("ar-SA")}
              </span>
              <span className="text-muted-foreground mr-1">يتابع</span>
            </Link>
            <Link
              to={`/user/${username}`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-bold">
                {followers.toLocaleString("ar-SA")}
              </span>
              <span className="text-muted-foreground mr-1">متابع</span>
            </Link>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserHoverCard;
