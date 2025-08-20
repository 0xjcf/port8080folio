/**
 * Cloudflare Worker for Contact Form Processing
 * Deploy this to Cloudflare Workers and update the form action URL
 * 
 * Required Environment Variables (set in Cloudflare dashboard):
 * - RESEND_API_KEY: Your Resend API key (or use another email service)
 * - TO_EMAIL: Where to send contact form submissions (e.g., consult@joseflores.dev)
 * - FROM_EMAIL: Sender address (e.g., noreply@joseflores.dev)
 */

export default {
  async fetch(request, env) {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: { 'Allow': 'POST' }
      });
    }

    const url = new URL(request.url);
    
    try {
      // Parse form data
      const formData = await request.formData();
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();
      const website = (formData.get('website') || '').toString(); // honeypot
      const timestamp = (formData.get('timestamp') || '').toString();
      
      // Check honeypot (if filled, it's likely a bot)
      if (website) {
        // Silently redirect to success page (fool the bots)
        return Response.redirect(new URL('/contact/thanks', url), 303);
      }
      
      // Basic validation
      if (!name || name.length < 2 || name.length > 70) {
        return Response.redirect(
          new URL('/contact?error=invalid_name#contact-forms', url), 
          303
        );
      }
      
      if (!email || !isValidEmail(email)) {
        return Response.redirect(
          new URL('/contact?error=invalid_email#contact-forms', url), 
          303
        );
      }
      
      if (!message || message.length < 10 || message.length > 5000) {
        return Response.redirect(
          new URL('/contact?error=invalid_message#contact-forms', url), 
          303
        );
      }
      
      // Optional: Check timestamp to prevent instant submissions (bot detection)
      if (timestamp) {
        const submissionTime = Date.now();
        const formLoadTime = parseInt(timestamp);
        const timeDiff = submissionTime - formLoadTime;
        
        // If form was submitted in less than 3 seconds, likely a bot
        if (timeDiff < 3000) {
          return Response.redirect(new URL('/contact/thanks', url), 303);
        }
      }
      
      // Send email using Resend (or your preferred service)
      const emailResponse = await sendEmail(env, {
        name,
        email,
        message
      });
      
      if (!emailResponse.ok) {
        console.error('Email send failed:', await emailResponse.text());
        return Response.redirect(
          new URL('/contact?error=send_failed#contact-forms', url), 
          303
        );
      }
      
      // Success - redirect to thank you page
      return Response.redirect(new URL('/contact/thanks', url), 303);
      
    } catch (error) {
      console.error('Form processing error:', error);
      return Response.redirect(
        new URL('/contact?error=processing#contact-forms', url), 
        303
      );
    }
  }
};

/**
 * Send email using Resend API
 * You can replace this with SendGrid, Mailgun, AWS SES, etc.
 */
async function sendEmail(env, { name, email, message }) {
  const payload = {
    from: env.FROM_EMAIL || 'Website <noreply@joseflores.dev>',
    to: [env.TO_EMAIL || 'consult@joseflores.dev'],
    reply_to: email,
    subject: `Contact Form: Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `
  };
  
  return await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

/**
 * Basic email validation
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}