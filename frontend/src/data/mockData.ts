import { Post } from "@/components/post/PostCard";

export interface Comment {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  replies?: Comment[];
  parentId?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar?: string;
  followers: number;
  following: number;
  postsCount: number;
  followersList?: { id: string; username: string; displayName: string; avatar?: string }[];
  followingList?: { id: string; username: string; displayName: string; avatar?: string }[];
}

export const mockUsers: UserProfile[] = [
  {
    id: "1",
    username: "ahmed_dev",
    displayName: "أحمد المطور",
    bio: "مطور ويب | مهتم بالتقنية والذكاء الاصطناعي",
    avatar: undefined,
    followers: 1234,
    following: 567,
    postsCount: 89,
    followersList: [
      { id: "2", username: "sara_design", displayName: "سارة التصميم" },
      { id: "3", username: "omar_tech", displayName: "عمر التقني" },
      { id: "4", username: "mona_writer", displayName: "منى الكاتبة" },
    ],
    followingList: [
      { id: "2", username: "sara_design", displayName: "سارة التصميم" },
      { id: "3", username: "omar_tech", displayName: "عمر التقني" },
    ],
  },
  {
    id: "2",
    username: "sara_design",
    displayName: "سارة التصميم",
    bio: "مصممة UI/UX | أحب البساطة في التصميم",
    avatar: undefined,
    followers: 2567,
    following: 432,
    postsCount: 156,
    followersList: [
      { id: "1", username: "ahmed_dev", displayName: "أحمد المطور" },
      { id: "3", username: "omar_tech", displayName: "عمر التقني" },
    ],
    followingList: [
      { id: "1", username: "ahmed_dev", displayName: "أحمد المطور" },
      { id: "4", username: "mona_writer", displayName: "منى الكاتبة" },
    ],
  },
  {
    id: "3",
    username: "omar_tech",
    displayName: "عمر التقني",
    bio: "محلل تقني | أشارك آخر أخبار التكنولوجيا",
    avatar: undefined,
    followers: 5678,
    following: 234,
    postsCount: 312,
    followersList: [
      { id: "1", username: "ahmed_dev", displayName: "أحمد المطور" },
      { id: "2", username: "sara_design", displayName: "سارة التصميم" },
    ],
    followingList: [
      { id: "2", username: "sara_design", displayName: "سارة التصميم" },
    ],
  },
  {
    id: "4",
    username: "mona_writer",
    displayName: "منى الكاتبة",
    bio: "كاتبة محتوى | أحب القراءة والكتابة",
    avatar: undefined,
    followers: 890,
    following: 123,
    postsCount: 67,
    followersList: [
      { id: "2", username: "sara_design", displayName: "سارة التصميم" },
    ],
    followingList: [
      { id: "1", username: "ahmed_dev", displayName: "أحمد المطور" },
    ],
  },
];

export const mockPosts: Post[] = [
  {
    id: "1",
    author: mockUsers[0],
    content: "البساطة في التصميم ليست مجرد أسلوب، إنها فلسفة. كل عنصر له غرض، وكل مساحة فارغة لها معنى.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 42,
    comments: 8,
    reposts: 12,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop",
  },
  {
    id: "2",
    author: mockUsers[1],
    content: "أعمل على مشروع جديد بتصميم minimal.\n\nالأبيض والأسود فقط.\nلا ألوان زائدة.\nلا عناصر غير ضرورية.\n\nالنتيجة؟ تركيز أعلى على المحتوى.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 156,
    comments: 23,
    reposts: 45,
    isLiked: true,
  },
  {
    id: "3",
    author: mockUsers[2],
    content: "التصميم الجيد هو التصميم الذي لا تلاحظه. يعمل بسلاسة ويوصل الرسالة بدون تشتيت.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 89,
    comments: 15,
    reposts: 28,
    repostedBy: {
      id: "1",
      username: "ahmed_dev",
      displayName: "أحمد المطور",
    },
    originalAuthor: mockUsers[2],
    image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&h=400&fit=crop",
  },
  {
    id: "4",
    author: mockUsers[3],
    content: "الكلمات القليلة أحياناً تحمل أكبر المعاني.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    likes: 234,
    comments: 31,
    reposts: 67,
  },
  {
    id: "5",
    author: mockUsers[0],
    content: "نصيحة للمصممين الجدد:\n\n١. ابدأ بالأساسيات\n٢. تعلم من الآخرين\n٣. مارس كل يوم\n٤. لا تخف من الفشل\n٥. البساطة هي الحل",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes: 567,
    comments: 89,
    reposts: 123,
  },
];

export const mockComments: Record<string, Comment[]> = {
  "1": [
    {
      id: "c1",
      author: mockUsers[1],
      content: "كلام رائع! البساطة فعلاً فن بحد ذاته.",
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      likes: 5,
      dislikes: 0,
      replies: [
        {
          id: "c1-r1",
          author: mockUsers[0],
          content: "شكراً سارة! أقدر رأيك كثيراً.",
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          likes: 2,
          dislikes: 0,
          parentId: "c1",
        },
      ],
    },
    {
      id: "c2",
      author: mockUsers[2],
      content: "أتفق معك تماماً. المساحة الفارغة تتحدث أحياناً أكثر من الكلمات.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      likes: 3,
      dislikes: 1,
    },
  ],
  "2": [
    {
      id: "c3",
      author: mockUsers[0],
      content: "مشروع واعد! كيف تتعامل مع التباين في الألوان؟",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      likes: 8,
      dislikes: 0,
      replies: [
        {
          id: "c3-r1",
          author: mockUsers[1],
          content: "أستخدم درجات الرمادي للتباين الناعم.",
          createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          likes: 4,
          dislikes: 0,
          parentId: "c3",
        },
      ],
    },
  ],
  "3": [
    {
      id: "c4",
      author: mockUsers[3],
      content: "هذا ما أحاول تطبيقه في كتاباتي أيضاً.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      likes: 2,
      dislikes: 0,
    },
  ],
};

export const suggestedUsers = mockUsers.slice(1, 4).map(user => ({
  ...user,
  isFollowing: false,
}));
