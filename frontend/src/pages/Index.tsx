import Layout from "@/components/layout/Layout";
import PostCard from "@/components/post/PostCard";
import ComposeTweet from "@/components/post/ComposeTweet";
import { Post } from "@/components/post/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { postsAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب المنشورات مع caching تلقائي
  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await postsAPI.getAllPosts();
      // Backend now returns { posts, pagination }
      return response.data.posts || [];
    },
  });

  // إنشاء منشور جديد مع optimistic update
  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; image?: string }) =>
      postsAPI.createPost(data),
    onMutate: async (newPostData) => {
      // إلغاء أي refetch جاري
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // حفظ البيانات القديمة
      const previousPosts = queryClient.getQueryData(["posts"]);

      // تحديث فوري (optimistic)
      const optimisticPost: Post = {
        id: `temp-${Date.now()}`,
        content: newPostData.content,
        image: newPostData.image,
        author: {
          id: user?.id || "",
          username: user?.username || "",
          displayName: user?.displayName || "",
          avatar: user?.avatar,
        },
        likes: 0,
        comments: 0,
        reposts: 0,
        createdAt: new Date().toISOString(),
        isLiked: false,
      };

      queryClient.setQueryData(["posts"], (old: Post[] = []) => [
        optimisticPost,
        ...old,
      ]);

      return { previousPosts };
    },
    onSuccess: (response) => {
      // استبدال المنشور المؤقت بالمنشور الحقيقي
      queryClient.setQueryData(["posts"], (old: Post[] = []) => {
        const newPost = response.data.post;
        return [newPost, ...old.filter((p) => !p.id.startsWith("temp-"))];
      });
    },
    onError: (error, newPost, context) => {
      // إرجاع البيانات القديمة في حالة الخطأ
      queryClient.setQueryData(["posts"], context?.previousPosts);
      toast({
        title: "خطأ",
        description: "فشل نشر المنشور",
        variant: "destructive",
      });
    },
  });

  const handleNewPost = async (content: string, image?: string) => {
    if (!isLoggedIn) {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({ content, image });
    toast({
      title: "نجح",
      description: "تم نشر المنشور بنجاح",
    });
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postsAPI.deletePost(postId);

      // تحديث الـ cache بحذف المنشور
      queryClient.setQueryData(["posts"], (old: Post[] = []) =>
        old.filter((p) => p.id !== postId)
      );

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

      // تحديث الـ cache بالمنشور المعدل
      queryClient.setQueryData(["posts"], (old: Post[] = []) =>
        old.map((p) => (p.id === postId ? updatedPost : p))
      );

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
