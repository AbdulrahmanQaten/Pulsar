import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  displayName: string;
  username: string;
  bio: string;
  location: string;
  avatar?: string;
}

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
}

const EditProfileDialog = ({ isOpen, onClose, user, onSave }: EditProfileDialogProps) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      displayName,
      username,
      bio,
      location,
      avatar,
    });
    toast({
      title: "تم الحفظ",
      description: "تم تحديث معلومات الحساب بنجاح",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل الحساب</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Avatar upload */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-border cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-secondary text-lg">
                  {displayName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الاسم</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="الاسم المعروض"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم المستخدم</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم المستخدم"
              dir="ltr"
              className="text-left"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">النبذة</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="أخبرنا عن نفسك"
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الموقع</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="المدينة، البلد"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            حفظ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
