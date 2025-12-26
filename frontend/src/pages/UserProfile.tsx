import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";
import PostCard from "@/components/post/PostCard";
import FollowersDialog from "@/components/user/FollowersDialog";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Post } from "@/components/post/PostCard";
import { usersAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { username } = useParams();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const { user: currentUser, isLoggedIn } = useAuth();

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    if (!username) return;

    try {
      const response = await usersAPI.getUser(username);
      setProfileData(response.data.user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchUserPosts = async () => {
    if (!username) return;

    try {
      setLoading(true);
      const response = await usersAPI.getUserPosts(username);
      setUserPosts(response.data.posts);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    if (!profileData?.id) return;

    try {
      const response = await usersAPI.getFollowers(profileData.id);
      setFollowers(response.data.followers);
      setShowFollowers(true);
    } catch (error) {
      console.error("Failed to fetch followers:", error);
    }
  };

  const fetchFollowing = async () => {
    if (!profileData?.id) return;

    try {
      const response = await usersAPI.getFollowing(profileData.id);
      setFollowing(response.data.following);
      setShowFollowing(true);
    } catch (error) {
      console.error("Failed to fetch following:", error);
    }
  };

  const handleFollow = async () => {
    if (!profileData || !isLoggedIn) return;

    try {
      await usersAPI.followUser(profileData.id);
      // Refetch profile to get updated counts
      const response = await usersAPI.getUser(username!);
      setProfileData(response.data.user);
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
    }
  };

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

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-0">
        <div className="min-h-screen md:border-x border-border">
          {/* Profile Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="bg-secondary text-lg">
                  {profileData.displayName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {isLoggedIn && currentUser?.username !== username && (
                <Button
                  variant={profileData.isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollow}
                >
                  {profileData.isFollowing ? "إلغاء المتابعة" : "متابعة"}
                </Button>
              )}
            </div>

            <div className="mb-3">
              <h2 className="text-xl font-bold">{profileData.displayName}</h2>
              <p className="text-muted-foreground">@{profileData.username}</p>
            </div>

            {profileData.bio && (
              <p className="mb-3 text-[15px]">{profileData.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              {profileData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.location}</span>
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
                  {profileData.followingCount || 0}
                </span>{" "}
                <span className="text-muted-foreground">يتابع</span>
              </button>
              <button onClick={fetchFollowers} className="hover:underline">
                <span className="font-bold">
                  {profileData.followersCount || 0}
                </span>{" "}
                <span className="text-muted-foreground">متابع</span>
              </button>
            </div>
          </div>

          {/* Posts */}
          <div>
            {userPosts.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                لا توجد منشورات بعد
              </div>
            ) : (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isOwner={post.author.id === currentUser?.id}
                  isLoggedIn={isLoggedIn}
                />
              ))
            )}
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
    </Layout>
  );
};

export default UserProfile;
