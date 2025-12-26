import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";
import PostCard from "@/components/post/PostCard";
import FollowersDialog from "@/components/user/FollowersDialog";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/components/post/PostCard";
import { usersAPI } from "@/lib/api";

const Profile = () => {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user profile and posts on mount
  useEffect(() => {
    if (user?.username) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [user?.username]);

  const fetchUserProfile = async () => {
    if (!user?.username) return;

    try {
      const response = await usersAPI.getUser(user.username);
      setProfileData(response.data.user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchUserPosts = async () => {
    if (!user?.username) return;

    try {
      setLoading(true);
      const response = await usersAPI.getUserPosts(user.username);
      setUserPosts(response.data.posts);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المنشورات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updatedUser: {
    displayName: string;
    username: string;
    bio: string;
    location: string;
    avatar?: string;
  }) => {
    try {
      await usersAPI.updateProfile({
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        location: updatedUser.location,
        avatar: updatedUser.avatar,
      });

      setProfileData((prev) => ({
        ...prev,
        bio: updatedUser.bio,
        location: updatedUser.location,
        avatar: updatedUser.avatar || "",
      }));

      toast({
        title: "نجح",
        description: "تم تحديث الملف الشخصي بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.error || "فشل تحديث الملف الشخصي",
        variant: "destructive",
      });
    }
  };

  const fetchFollowers = async () => {
    if (!user?.id) return;

    try {
      const response = await usersAPI.getFollowers(user.id);
      setFollowers(response.data.followers);
      setShowFollowers(true);
    } catch (error) {
      console.error("Failed to fetch followers:", error);
    }
  };

  const fetchFollowing = async () => {
    if (!user?.id) return;

    try {
      const response = await usersAPI.getFollowing(user.id);
      setFollowing(response.data.following);
      setShowFollowing(true);
    } catch (error) {
      console.error("Failed to fetch following:", error);
    }
  };

  const handleDeletePost = (postId: string) => {
    setUserPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleEditPost = (postId: string, content: string, image?: string) => {
    setUserPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content, image } : p))
    );
  };

  // If not logged in, show login prompt
  if (!isLoggedIn || !user) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl px-0">
          <div className="min-h-screen md:border-x border-border flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">تسجيل الدخول مطلوب</h2>
              <p className="text-muted-foreground">
                يجب عليك تسجيل الدخول للوصول إلى حسابك الشخصي
              </p>
              <Link to="/auth">
                <Button className="mt-4">تسجيل الدخول</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading || !profileData) {
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

  const currentUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: profileData?.bio || "",
    location: profileData?.location || "",
    avatar: profileData?.avatar || user.avatar,
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-0">
        <div className="min-h-screen md:border-x border-border">
          {/* Profile Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-secondary text-lg">
                  {currentUser.displayName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditProfile(true)}
              >
                تعديل الحساب
              </Button>
            </div>

            <div className="mb-3">
              <h2 className="text-xl font-bold">{currentUser.displayName}</h2>
              <p className="text-muted-foreground">@{currentUser.username}</p>
            </div>

            <p className="mb-3 text-[15px]">{currentUser.bio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              {currentUser.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{currentUser.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>
                  انضم في{" "}
                  {new Date(profileData.createdAt).toLocaleDateString("ar-SA", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <button onClick={fetchFollowing} className="hover:underline">
                <span className="font-bold">
                  {profileData?.followingCount || 0}
                </span>{" "}
                <span className="text-muted-foreground">يتابع</span>
              </button>
              <button onClick={fetchFollowers} className="hover:underline">
                <span className="font-bold">
                  {profileData?.followersCount || 0}
                </span>{" "}
                <span className="text-muted-foreground">متابع</span>
              </button>
            </div>
          </div>

          {/* Posts */}
          <div>
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwner={true}
                isLoggedIn={true}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
              />
            ))}
          </div>
        </div>
      </div>

      <FollowersDialog
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="المتابعون"
        users={followers}
      />
      <FollowersDialog
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="يتابع"
        users={following}
      />
      <EditProfileDialog
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={currentUser}
        onSave={handleSaveProfile}
      />
    </Layout>
  );
};

export default Profile;
