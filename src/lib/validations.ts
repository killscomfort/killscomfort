import { z } from "zod";

const preferredContactField = z.enum(["Email", "Phone"], {
  message: "Select how you'd like to be contacted",
});

export const inquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  preferred_contact: preferredContactField,
  event_date: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export const simpleInquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  preferred_contact: preferredContactField,
  event_date: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

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
