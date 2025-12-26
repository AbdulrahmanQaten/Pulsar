import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, X } from "lucide-react";

interface EditPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  initialContent: string;
  initialImage?: string;
  onSave: (postId: string, content: string, image?: string) => void;
}

const EditPostDialog = ({
  isOpen,
  onClose,
  postId,
  initialContent,
  initialImage,
  onSave,
}: EditPostDialogProps) => {
  const [content, setContent] = useState(initialContent);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImagePreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (content.trim()) {
      onSave(postId, content.trim(), imagePreview);
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset to initial values when closing
      setContent(initialContent);
      setImagePreview(initialImage);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل المنشور</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="ماذا يحدث؟"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none text-[15px]"
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative border border-border overflow-hidden">
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

          {/* Image upload */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Image className="h-4 w-4" />
              {imagePreview ? "تغيير الصورة" : "إضافة صورة"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={!content.trim()}>
            حفظ التعديلات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
