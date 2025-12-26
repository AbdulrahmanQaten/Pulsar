import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { postsAPI } from "@/lib/api";

interface CommentItemProps {
  comment: Comment;
  postId?: string;
  onReply: (parentId: string, content: string) => void;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  onCloseDialog?: () => void;
  depth?: number;
}

const CommentItem = ({
  comment,
  postId,
  onReply,
  onLike,
  onDislike,
  onCloseDialog,
  depth = 0,
}: CommentItemProps) => {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0);
    }
    return parts[0].charAt(0) + parts[1].charAt(0);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "الآن";
    if (hours < 24) return `${hours}س`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}ي`;
    return date.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
  };

  const handleLike = async () => {
    if (!postId) {
      // Fallback to local state if no postId
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      } else {
        setLikes(likes + 1);
        setIsLiked(true);
        if (isDisliked) {
          setDislikes(dislikes - 1);
          setIsDisliked(false);
        }
      }
      onLike(comment.id);
      return;
    }

    try {
      const response = await postsAPI.likeComment(postId, comment.id);
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
      setIsLiked(!isLiked);
      if (isDisliked) setIsDisliked(false);
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  const handleDislike = async () => {
    if (!postId) {
      // Fallback to local state if no postId
      if (isDisliked) {
        setDislikes(dislikes - 1);
        setIsDisliked(false);
      } else {
        setDislikes(dislikes + 1);
        setIsDisliked(true);
        if (isLiked) {
          setLikes(likes - 1);
          setIsLiked(false);
        }
      }
      onDislike(comment.id);
      return;
    }

    try {
      const response = await postsAPI.dislikeComment(postId, comment.id);
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
      setIsDisliked(!isDisliked);
      if (isLiked) setIsLiked(false);
    } catch (error) {
      console.error("Failed to dislike comment:", error);
    }
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent);
    setReplyContent("");
    setShowReplyInput(false);
  };

  const maxDepth = 3;
  const canReply = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? "border-r-2 border-border pr-3 mr-3" : ""}`}>
      <div className="flex gap-3">
        <Link
          to={`/user/${comment.author.username}`}
          onClick={onCloseDialog}
          className="shrink-0"
        >
          <Avatar className="h-8 w-8 border border-border">
            {comment.author.avatar && (
              <AvatarImage
                src={comment.author.avatar}
                alt={comment.author.displayName}
              />
            )}
            <AvatarFallback className="bg-secondary text-xs">
              {getInitials(comment.author.displayName)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/user/${comment.author.username}`}
              onClick={onCloseDialog}
              className="font-medium text-sm hover:underline"
            >
              {comment.author.displayName}
            </Link>
            <Link
              to={`/user/${comment.author.username}`}
              onClick={onCloseDialog}
              className="text-muted-foreground text-xs hover:underline"
            >
              @{comment.author.username}
            </Link>
            <span className="text-muted-foreground text-xs">
              {formatTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm mt-1">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-1 h-7 px-2 text-xs ${
                isLiked
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ThumbsUp
                className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`}
              />
              <span>{likes || ""}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={`gap-1 h-7 px-2 text-xs ${
                isDisliked
                  ? "text-destructive"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ThumbsDown
                className={`h-3.5 w-3.5 ${isDisliked ? "fill-current" : ""}`}
              />
              <span>{dislikes || ""}</span>
            </Button>
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="gap-1 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>رد</span>
              </Button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3 flex gap-2">
              <Avatar className="h-6 w-6 border border-border shrink-0">
                {user?.avatar && (
                  <AvatarImage src={user.avatar} alt={user.displayName || ""} />
                )}
                <AvatarFallback className="bg-secondary text-[10px]">
                  {user?.displayName ? getInitials(user.displayName) : "أن"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="اكتب ردك..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[50px] resize-none text-sm"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowReplyInput(false)}
                    className="h-7 text-xs"
                  >
                    إلغاء
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className="h-7 text-xs"
                  >
                    رد
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="gap-1 h-7 px-2 text-xs text-primary hover:text-primary"
              >
                {showReplies ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                <span>
                  {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "رد" : "ردود"}
                </span>
              </Button>

              {showReplies && (
                <div className="mt-2 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      onLike={onLike}
                      onDislike={onDislike}
                      onCloseDialog={onCloseDialog}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
