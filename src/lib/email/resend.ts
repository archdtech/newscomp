import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'demo-key')

export interface EmailData {
  to: string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(data: EmailData) {
  try {
    // Check if we have a real API key
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'demo-key') {
      console.log('Demo mode: Email would be sent to:', data.to)
      console.log('Subject:', data.subject)
      return { success: true, id: 'demo-' + Date.now(), demo: true }
    }

    const result = await resend.emails.send({
      from: data.from || 'Beacon Compliance <alerts@beacon-compliance.com>',
      to: data.to,
      subject: data.subject,
      html: data.html,
    })

    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export { resend }
