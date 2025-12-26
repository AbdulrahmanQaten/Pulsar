import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isFollowing?: boolean;
}

interface FollowersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: User[];
}

const FollowersDialog = ({
  isOpen,
  onClose,
  title,
  users,
}: FollowersDialogProps) => {
  const [followingState, setFollowingState] = useState<Record<string, boolean>>(
    {}
  );
  const { user: currentUser } = useAuth();

  // Initialize following state from user data
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    users.forEach((user) => {
      if (user.isFollowing !== undefined) {
        initialState[user.id] = user.isFollowing;
      }
    });
    setFollowingState(initialState);
  }, [users]);

  const handleFollow = async (userId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await usersAPI.followUser(userId);
      setFollowingState((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا يوجد مستخدمين
            </p>
          ) : (
            users.map((user) => {
              const isCurrentUser = currentUser?.id === user.id;

              return (
                <Link
                  key={user.id}
                  to={`/user/${user.username}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-secondary text-xs">
                        {user.displayName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.displayName}</p>
                      <p className="text-muted-foreground text-xs">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  {!isCurrentUser && (
                    <Button
                      variant={followingState[user.id] ? "outline" : "default"}
                      size="sm"
                      onClick={(e) => handleFollow(user.id, e)}
                    >
                      {followingState[user.id] ? "متابَع" : "متابعة"}
                    </Button>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersDialog;
