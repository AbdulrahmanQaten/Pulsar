import Layout from "@/components/layout/Layout";
import PostCard from "@/components/post/PostCard";
import ComposeTweet from "@/components/post/ComposeTweet";
import { useState, useEffect } from "react";
import { Post } from "@/components/post/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { postsAPI } from "@/lib/api";

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAllPosts();
      setPosts(response.data.posts);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المنشورات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (content: string, image?: string) => {
    if (!isLoggedIn) {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await postsAPI.createPost({ content, image });
      const newPost = response.data.post;
      setPosts([newPost, ...posts]);
      toast({
        title: "نجح",
        description: "تم نشر المنشور بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.error || "فشل نشر المنشور",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postsAPI.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({
        title: "تم الحذف",
        description: "تم حذف المنشور بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.error || "فشل حذف المنشور",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = async (
    postId: string,
    content: string,
    image?: string
  ) => {
    try {
      const response = await postsAPI.updatePost(postId, { content, image });
      const updatedPost = response.data.post;
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      toast({
        title: "تم التعديل",
        description: "تم تعديل المنشور بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.error || "فشل تعديل المنشور",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:container md:mx-auto md:max-w-2xl md:px-0">
        <div className="min-h-screen md:border-x border-border">
          {/* Compose */}
          <div className="border-b border-border">
            <ComposeTweet onPost={handleNewPost} />
          </div>

          {/* Feed */}
          <div>
            {posts.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                لا توجد منشورات بعد
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isLoggedIn={isLoggedIn}
                  isOwner={post.author.id === user?.id}
                  onDelete={handleDeletePost}
                  onEdit={handleEditPost}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
