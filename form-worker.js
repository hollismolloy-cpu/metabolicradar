// MetabolicRadar Contact Form Worker
// Receives form submissions and sends email via MailChannels (free, built into Cloudflare)

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();
      const { name, email, path, message } = data;

      // Send via MailChannels (free Cloudflare integration)
      const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: 'hollismolloy@gmail.com', name: 'Hollis Molloy' }],
          }],
          from: {
            email: 'noreply@metabolicradar.com',
            name: 'MetabolicRadar Contact Form',
          },
          reply_to: { email: email, name: name },
          subject: `New inquiry from ${name} — MetabolicRadar`,
          content: [{
            type: 'text/plain',
            value: `New contact form submission from MetabolicRadar.com\n\n` +
              `Name: ${name}\n` +
              `Email: ${email}\n` +
              `Interested in: ${path || 'Not specified'}\n\n` +
              `Message:\n${message || '(no message)'}\n\n` +
              `---\nReply directly to this email to respond to ${name}.`,
          }, {
            type: 'text/html',
            value: `
              <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #faf9f7; border-radius: 12px;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #8a9ab0; margin-bottom: 20px;">New inquiry · MetabolicRadar.com</p>
                <h2 style="font-size: 24px; font-weight: 400; color: #1c2230; margin-bottom: 20px; font-family: Georgia, serif;">${name} wants to connect.</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #e8edf5; font-size: 13px; color: #8a9ab0; width: 120px;">Name</td><td style="padding: 10px 0; border-bottom: 1px solid #e8edf5; font-size: 14px; color: #1c2230;">${name}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #e8edf5; font-size: 13px; color: #8a9ab0;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #e8edf5; font-size: 14px; color: #3d7a8a;"><a href="mailto:${email}" style="color: #3d7a8a;">${email}</a></td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #e8edf5; font-size: 13px; color: #8a9ab0;">Interested in</td><td style="padding: 10px 0; border-bottom: 1px solid #e8edf5; font-size: 14px; color: #1c2230;">${path || 'Not specified'}</td></tr>
                </table>
                ${message ? `<div style="background: white; border: 1px solid #e8edf5; border-radius: 10px; padding: 16px; font-size: 14px; line-height: 1.7; color: #4a5568;">${message}</div>` : ''}
                <p style="margin-top: 20px; font-size: 12px; color: #8a9ab0;">Reply directly to this email to respond to ${name}.</p>
              </div>
            `,
          }],
        }),
      });

      if (emailResponse.status === 202) {
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } else {
        const err = await emailResponse.text();
        console.error('MailChannels error:', err);
        return new Response(JSON.stringify({ success: false, error: err }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
