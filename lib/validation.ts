import { z } from 'zod'
import { RANGES } from './config'

export const ClaimSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Please enter your full name')
    .max(120, 'Name is too long')
    .trim(),

  contact: z
    .string()
    .min(5, 'Please enter a valid email address or mobile number')
    .max(200)
    .trim(),

  range_name: z.enum(RANGES as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a valid range' }),
  }),

  // Validated against VALID_CLAIM_CODES at the action level (env-dependent)
  claim_code: z
    .string()
    .min(1, 'Please enter the claim code from your survey')
    .max(30)
    .trim()
    .transform((v) => v.toUpperCase()),

  survey_location: z
    .enum(['at_range_before', 'at_range_after', 'away'])
    .optional(),
})

export type ClaimInput = z.infer<typeof ClaimSchema>
