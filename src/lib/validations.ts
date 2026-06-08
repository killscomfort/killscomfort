import { z } from "zod";

const preferredContactField = z.enum(["Email", "Phone"], {
  message: "Select how you'd like to be contacted",
});

function withPhoneRequirement<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    if (
      "preferred_contact" in data &&
      data.preferred_contact === "Phone" &&
      !("phone" in data && data.phone?.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number is required when phone is your preferred contact method",
      });
    }
  });
}

export const inquirySchema = withPhoneRequirement(
  z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email required"),
    phone: z.string().optional(),
    preferred_contact: preferredContactField,
    event_type: z.string().min(1, "Select an event type"),
    event_date: z.string().optional(),
    event_location: z.string().optional(),
    budget_range: z.string().optional(),
    message: z.string().optional(),
    source: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
  })
);

export const simpleInquirySchema = withPhoneRequirement(
  z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email required"),
    phone: z.string().optional(),
    preferred_contact: preferredContactField,
    event_type: z.string().min(1, "Select an event type"),
    event_date: z.string().optional(),
    message: z.string().optional(),
    source: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
  })
);

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  bio: z.string().max(500).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
export type SimpleInquiryInput = z.infer<typeof simpleInquirySchema>;
