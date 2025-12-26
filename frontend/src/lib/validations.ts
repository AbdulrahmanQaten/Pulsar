import { z } from "zod";

// Username validation: English letters, numbers, underscores only, 3-20 chars
export const usernameSchema = z
  .string()
  .min(3, { message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" })
  .max(20, { message: "اسم المستخدم يجب أن يكون أقل من 20 حرف" })
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message: "اسم المستخدم يجب أن يبدأ بحرف إنجليزي ويحتوي فقط على أحرف إنجليزية وأرقام و _",
  });

export const emailSchema = z
  .string()
  .email({ message: "البريد الإلكتروني غير صالح" });

export const passwordSchema = z
  .string()
  .min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });

export const displayNameSchema = z
  .string()
  .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" })
  .max(50, { message: "الاسم يجب أن يكون أقل من 50 حرف" });

export const signupSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, { message: "أدخل البريد أو اسم المستخدم" }),
  password: passwordSchema,
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
