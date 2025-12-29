import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Image, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Compose = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = () => {
    if (content.trim()) {
      toast.success("تم نشر المنشور بنجاح");
      navigate("/");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("حجم الصورة كبير جداً! الحد الأقصى 5 ميجابايت");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

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

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <Button onClick={handleSubmit} disabled={!content.trim()} size="sm">
          نشر
        </Button>
      </header>

      {/* Compose Area */}
      <div className="p-4">
        <Textarea
          placeholder="ماذا يحدث؟"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
          autoFocus
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

        {/* Actions */}
        <div className="flex items-center mt-4 pt-4 border-t border-border">
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
            onClick={() => fileInputRef.current?.click()}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <Image className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Compose;
