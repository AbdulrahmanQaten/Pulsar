import Layout from "@/components/layout/Layout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Explore = () => {
  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-0">
        <div className="min-h-screen md:border-x border-border">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
            <h1 className="text-xl font-bold mb-3">استكشاف</h1>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن المستخدمين والمنشورات..."
                className="pr-10 bg-secondary border-0"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">استكشف المحتوى</h2>
            <p className="text-muted-foreground max-w-sm">
              استخدم شريط البحث أعلاه للعثور على مستخدمين ومنشورات مثيرة
              للاهتمام
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Explore;
