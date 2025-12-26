import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Post } from "@/components/post/PostCard";
import { Comment } from "@/data/mockData";
import { postsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import CommentItem from "@/components/post/CommentItem";

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const response = await postsAPI.getPost(postId);
      const postData = response.data.post;
      setPost(postData);
      setLikes(postData.likes);
      setIsLiked(postData.isLiked || false);
      // Set comments if available from API
      if (postData.comments) {
        setComments(postData.comments);
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn || !postId) {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await postsAPI.likePost(postId);
      setIsLiked(!isLiked);
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId) return;

    if (!isLoggedIn) {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      await postsAPI.commentPost(postId, newComment);

      const comment: Comment = {
        id: Date.now().toString(),
        author: {
          id: user?.id || "",
          username: user?.username || "",
          displayName: user?.displayName || "",
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
      };

      setComments([...comments, comment]);
      setNewComment("");

      toast({
        title: "نجح",
        description: "تم إضافة التعليق بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة التعليق",
        variant: "destructive",
      });
    }
  };

  const handleReplyToComment = (parentId: string, content: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      author: {
        id: user?.id || "",
        username: user?.username || "",
        displayName: user?.displayName || "",
      },
      content,
      createdAt: new Date().toISOString(),
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
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl px-0">
          <div className="min-h-screen md:border-x border-border flex items-center justify-center">
            <div className="text-center">جاري التحميل...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl px-0">
          <div className="min-h-screen md:border-x border-border flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium">المنشور غير موجود</p>
              <p className="text-muted-foreground mt-2">قد يكون تم حذفه</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-0">
        <div className="min-h-screen md:border-x border-border">
          {/* Post Content */}
          <article className="border-b border-border px-4 py-4">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <Link to={`/user/${post.author.username}`}>
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback className="bg-secondary">
                    {post.author.displayName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  to={`/user/${post.author.username}`}
                  className="font-medium hover:underline"
                >
                  {post.author.displayName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  @{post.author.username}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-3">
              {post.content}
            </p>

            {/* Post Image */}
            {post.image && (
              <div className="mb-3 overflow-hidden border border-border rounded-lg">
                <img
                  src={post.image}
                  alt="صورة المنشور"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Time */}
            <p className="text-sm text-muted-foreground mb-4">
              {formatTime(post.createdAt)}
            </p>

            {/* Stats */}
            <div className="flex gap-4 py-3 border-y border-border text-sm">
              <span>
                <strong>{likes}</strong> إعجاب
              </span>
              <span>
                <strong>{comments.length}</strong> تعليق
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`gap-1.5 h-9 px-3 flex-1 ${
                  isLiked
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                <span>إعجاب</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground h-9 px-3 flex-1"
              >
                <MessageCircle className="h-5 w-5" />
                <span>تعليق</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground h-9 px-3 flex-1"
              >
                <Repeat2 className="h-5 w-5" />
                <span>إعادة نشر</span>
              </Button>
            </div>
          </article>

          {/* Add Comment */}
          {isLoggedIn && (
            <div className="border-b border-border p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 border border-border shrink-0">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-secondary text-xs">
                    {user?.displayName?.slice(0, 2) || "أن"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="أضف تعليقاً..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
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
          )}

          {/* Comments List */}
          <div className="divide-y divide-border">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                لا توجد تعليقات بعد
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4">
                  <CommentItem
                    comment={comment}
                    postId={postId}
                    onReply={handleReplyToComment}
                    onLike={() => {}}
                    onDislike={() => {}}
                    onCloseDialog={() => {}}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostPage;
