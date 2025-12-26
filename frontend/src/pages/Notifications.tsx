import Layout from "@/components/layout/Layout";
import { Bell } from "lucide-react";

const Notifications = () => {
  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-0">
        <div className="min-h-screen md:border-x border-border">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
            <h1 className="text-xl font-bold">الإشعارات</h1>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">لا توجد إشعارات</h2>
            <p className="text-muted-foreground max-w-sm">
              عندما يتفاعل شخص ما مع منشوراتك أو يتابعك، ستظهر الإشعارات هنا
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
