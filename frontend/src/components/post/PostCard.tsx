import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Repeat2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockComments, Comment } from "@/data/mockData";
import PostOptionsMenu from "./PostOptionsMenu";
import EditPostDialog from "./EditPostDialog";
import CommentItem from "./CommentItem";
import LoginRequiredDialog from "@/components/auth/LoginRequiredDialog";
import { useAuth } from "@/contexts/AuthContext";
import UserHoverCard from "@/components/user/UserHoverCard";
import { postsAPI } from "@/lib/api";

export interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  image?: string;
  createdAt: string;
  likes: number;
  comments: number;
  reposts: number;
  isLiked?: boolean;
  isReposted?: boolean;
  repostedBy?: {
    id: string;
    username: string;
    displayName: string;
  };
  originalAuthor?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

interface PostCardProps {
  post: Post;
  showFullContent?: boolean;
  isOwner?: boolean;
  isLoggedIn?: boolean;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string, content: string, image?: string) => void;
}

const PostCard = ({
  post,
  showFullContent = false,
  isOwner = false,
  isLoggedIn = false,
  onDelete,
  onEdit,
}: PostCardProps) => {
  const { user } = useAuth();
  const [currentContent, setCurrentContent] = useState(post.content);
  const [currentImage, setCurrentImage] = useState(post.image);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [likes, setLikes] = useState(post.likes);
  const [reposts, setReposts] = useState(post.reposts);
  const [commentsCount, setCommentsCount] = useState(post.comments || 0);
  const [showComments, setShowComments] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginAction, setLoginAction] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentSort, setCommentSort] = useState<"newest" | "oldest" | "best">(
    "best"
  );
  const [externalLink, setExternalLink] = useState<string | null>(null);
  const [showLinkWarning, setShowLinkWarning] = useState(false);

  const requireLogin = (action: string, callback: () => void) => {
    if (!isLoggedIn) {
      setLoginAction(action);
      setShowLoginDialog(true);
      return;
    }
    callback();
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireLogin("الإعجاب بالمنشور", async () => {
      try {
        const response = await postsAPI.likePost(post.id);
        setIsLiked(!isLiked);
        setLikes(response.data.likes);
      } catch (error) {
        console.error("Failed to like post:", error);
      }
    });
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireLogin("إعادة نشر المنشور", () => {
      setIsReposted(!isReposted);
      setReposts(isReposted ? reposts - 1 : reposts + 1);
    });
  };

  const handleCommentClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireLogin("التعليق على المنشور", async () => {
      setShowComments(true);
      // Fetch comments from API if not already loaded
      if (comments.length === 0) {
        try {
          const response = await postsAPI.getPost(post.id);
          if (response.data.post.comments) {
            setComments(response.data.post.comments);
          }
        } catch (error) {
          console.error("Failed to fetch comments:", error);
        }
      }
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await postsAPI.commentPost(post.id, newComment);

      // Use the comment returned from API with real ID
      const apiComment = response.data.comment;
      const comment: Comment = {
        id: apiComment._id || apiComment.id,
        author: {
          id: apiComment.author._id || apiComment.author.id,
          username: apiComment.author.username,
          displayName: apiComment.author.displayName,
          avatar: apiComment.author.avatar,
        },
        content: apiComment.content,
        createdAt: apiComment.createdAt,
        likes: 0,
        dislikes: 0,
      };

      setComments([...comments, comment]);
      setCommentsCount(commentsCount + 1);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleReplyToComment = async (parentId: string, content: string) => {
    try {
      const response = await postsAPI.replyToComment(
        post.id,
        parentId,
        content
      );

      // Use the reply returned from API with real ID
      const apiReply = response.data.reply;
      const newReply: Comment = {
        id: apiReply._id || apiReply.id,
        author: {
          id: apiReply.author._id || apiReply.author.id || user?.id || "",
          username: apiReply.author.username || user?.username || "",
          displayName: apiReply.author.displayName || user?.displayName || "",
          avatar: apiReply.author.avatar,
        },
        content: apiReply.content,
        createdAt: apiReply.createdAt,
        likes: 0,
        dislikes: 0,
        parentId,
      };

      const addReplyToComment = (commentsList: Comment[]): Comment[] => {
        return commentsList.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies),
            };
          }
          return comment;
        });
      };

      setComments(addReplyToComment(comments));
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  const handleCommentLike = (commentId: string) => {
    // Just for UI state tracking
  };

  const handleCommentDislike = (commentId: string) => {
    // Just for UI state tracking
  };

  const handleEditSave = (postId: string, content: string, image?: string) => {
    setCurrentContent(content);
    setCurrentImage(image);
    onEdit?.(postId, content, image);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `${diffMins}د`;
    if (diffHours < 24) return `${diffHours}س`;
    if (diffDays < 7) return `${diffDays}ي`;

    return date.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      year: diffDays > 365 ? "numeric" : undefined,
    });
  };

  const handleExternalLink = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const href = url.startsWith("http") ? url : `https://${url}`;
    setExternalLink(href);
    setShowLinkWarning(true);
  };

  const confirmOpenLink = () => {
    if (externalLink) {
      window.open(externalLink, "_blank", "noopener,noreferrer");
    }
    setShowLinkWarning(false);
    setExternalLink(null);
  };

  const renderContentWithLinks = (text: string) => {
    const urlRegex =
      /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        urlRegex.lastIndex = 0;
        return (
          <button
            key={index}
            onClick={(e) => handleExternalLink(part, e)}
            className="text-sky-500 hover:text-sky-400 hover:underline inline"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  const getCommentScore = (comment: Comment): number => {
    return comment.likes - comment.dislikes;
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === "best") {
      return getCommentScore(b) - getCommentScore(a);
    }
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return commentSort === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <>
      <article className="fade-in border-b border-border px-4 py-4 transition-colors hover:bg-surface-hover">
        {/* Repost indicator */}
        {post.repostedBy && post.originalAuthor && (
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground pe-10">
            <Repeat2 className="h-3 w-3" />
            <span>
              أعاد النشر من{" "}
              <Link
                to={`/user/${post.originalAuthor.username}`}
                className="hover:underline font-medium"
              >
                @{post.originalAuthor.username}
              </Link>
            </span>
          </div>
        )}

        {/* Header with Avatar */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar */}
            <UserHoverCard
              username={post.repostedBy?.username || post.author.username}
              displayName={
                post.repostedBy?.displayName || post.author.displayName
              }
              avatar={post.repostedBy ? undefined : post.author.avatar}
            >
              <Link
                to={`/user/${
                  post.repostedBy?.username || post.author.username
                }`}
                className="shrink-0"
              >
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage
                    src={post.repostedBy ? undefined : post.author.avatar}
                    alt={
                      post.repostedBy?.displayName || post.author.displayName
                    }
                  />
                  <AvatarFallback className="bg-secondary text-xs">
                    {(
                      post.repostedBy?.displayName || post.author.displayName
                    ).slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </UserHoverCard>

            {/* Name and username */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-2 min-w-0">
              <UserHoverCard
                username={post.repostedBy?.username || post.author.username}
                displayName={
                  post.repostedBy?.displayName || post.author.displayName
                }
                avatar={post.repostedBy ? undefined : post.author.avatar}
              >
                <Link
                  to={`/user/${
                    post.repostedBy?.username || post.author.username
                  }`}
                  className="font-medium hover:underline truncate"
                >
                  {post.repostedBy?.displayName || post.author.displayName}
                </Link>
              </UserHoverCard>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="truncate">
                  @{post.repostedBy?.username || post.author.username}
                </span>
                <span>·</span>
                <time className="whitespace-nowrap">
                  {formatTime(post.createdAt)}
                </time>
              </div>
            </div>
          </div>

          <PostOptionsMenu
            postId={post.id}
            isOwner={isOwner}
            onEdit={() => setShowEditDialog(true)}
            onDelete={() => onDelete?.(post.id)}
          />
        </div>

        {/* Content */}
        <div className="mt-2">
          {/* Post content */}
          <Link to={`/post/${post.id}`}>
            <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {showFullContent || currentContent.length <= 250 ? (
                renderContentWithLinks(currentContent)
              ) : (
                <>
                  {renderContentWithLinks(currentContent.slice(0, 250))}
                  <span className="text-muted-foreground">... </span>
                  <span className="text-sky-500 hover:underline">
                    قراءة المزيد
                  </span>
                </>
              )}
            </p>

            {/* Post image */}
            {currentImage && (
              <div className="mt-3 overflow-hidden border border-border">
                <img
                  src={currentImage}
                  alt="صورة المنشور"
                  className="w-full h-auto object-cover max-h-96"
                  loading="lazy"
                />
              </div>
            )}
          </Link>

          {/* Actions: Like → Comments → Repost */}
          <div className="flex items-center gap-1 mt-3 -me-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-1.5 h-8 px-2 ${
                isLiked
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{likes || ""}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommentClick}
              className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{commentsCount || ""}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRepost}
              className={`gap-1.5 h-8 px-2 ${
                isReposted
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Repeat2
                className={`h-4 w-4 ${isReposted ? "stroke-[2.5px]" : ""}`}
              />
              <span className="text-xs">{reposts || ""}</span>
            </Button>
          </div>
        </div>
      </article>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between">
              <DialogTitle>التعليقات ({comments.length})</DialogTitle>
              {comments.length > 0 && (
                <Select
                  value={commentSort}
                  onValueChange={(v) =>
                    setCommentSort(v as "newest" | "oldest" | "best")
                  }
                >
                  <SelectTrigger className="w-24 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best">الأفضل</SelectItem>
                    <SelectItem value="newest">الأحدث</SelectItem>
                    <SelectItem value="oldest">الأقدم</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </DialogHeader>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {sortedComments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                لا توجد تعليقات بعد
              </p>
            ) : (
              sortedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  onReply={handleReplyToComment}
                  onLike={handleCommentLike}
                  onDislike={handleCommentDislike}
                  onCloseDialog={() => setShowComments(false)}
                />
              ))
            )}
          </div>

          {/* Add comment */}
          <div className="border-t border-border pt-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 border border-border shrink-0">
                <AvatarFallback className="bg-secondary text-xs">
                  {user?.displayName?.slice(0, 2) || "أن"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="أضف تعليقاً..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    تعليق
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <EditPostDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        postId={post.id}
        initialContent={currentContent}
        initialImage={currentImage}
        onSave={handleEditSave}
      />

      {/* Login Required Dialog */}
      <LoginRequiredDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        action={loginAction}
      />

      {/* External Link Warning Dialog */}
      <Dialog open={showLinkWarning} onOpenChange={setShowLinkWarning}>
        <DialogContent className="sm:max-w-sm border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 mb-4">
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl">رابط خارجي</DialogTitle>
              <DialogDescription>أنت على وشك مغادرة الموقع</DialogDescription>
            </DialogHeader>
          </div>

          <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>سيتم توجيهك إلى:</span>
            </div>
            <p className="text-sm break-all text-sky-500 font-medium" dir="ltr">
              {externalLink}
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
            هذا الرابط سينقلك إلى موقع خارجي ليس لنا علاقة به.
            <br />
            تأكد من أنك تثق بهذا الرابط قبل المتابعة.
          </p>

          <DialogFooter className="mt-5 flex-col gap-2 sm:flex-col">
            <Button onClick={confirmOpenLink} className="w-full">
              <ExternalLink className="h-4 w-4 ml-2" />
              فتح الرابط
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowLinkWarning(false)}
              className="w-full text-muted-foreground"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostCard;
