import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginRequiredDialog from "@/components/auth/LoginRequiredDialog";

interface ComposeTweetProps {
  onPost?: (content: string, image?: string) => void;
}

const ComposeTweet = ({ onPost }: ComposeTweetProps) => {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoggedIn, user } = useAuth();

  const handleSubmit = () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    if (content.trim()) {
      onPost?.(content, imagePreview || undefined);
      setContent("");
      setImagePreview(null);
    }
  };

  const handleFocus = () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
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
              placeholder="ماذا يحدث؟"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFocus}
              className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-[15px] placeholder:text-muted-foreground focus-visible:ring-0"
            />

            {/* Image preview */}
            {imagePreview && (
              <div className="relative mt-3 border border-border overflow-hidden">
                <img
                  src={imagePreview}
                  alt="معاينة"
                  className="w-full h-auto max-h-64 object-cover"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={removeImage}
                  className="absolute top-2 end-2 h-8 w-8 bg-background/80 hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLoginDialog(true);
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() && isLoggedIn}
                size="sm"
              >
                نشر
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LoginRequiredDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        action="نشر منشور جديد"
      />
    </>
  );
};

export default ComposeTweet;
