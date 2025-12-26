import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface LoginRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

const LoginRequiredDialog = ({ isOpen, onClose, action = "هذا الإجراء" }: LoginRequiredDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>تسجيل الدخول مطلوب</DialogTitle>
          <DialogDescription className="pt-2">
            يجب عليك تسجيل الدخول لـ{action}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-4">
          <Link to="/auth" className="w-full">
            <Button className="w-full">تسجيل الدخول</Button>
          </Link>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginRequiredDialog;
