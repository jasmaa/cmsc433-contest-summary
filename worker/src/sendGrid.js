/**
 * Send plain email to single user
 * 
 * @returns 
 */
export async function sendEmail({ email, subject, content }) {
  const url = 'https://api.sendgrid.com/v3/mail/send';
  const payload = {
    "personalizations": [{ "to": [{ "email": email }] }],
    "from": { "email": SENDER_ADDRESS },
    "subject": subject,
    "content": [
      {
        "type": "text/plain",
        "value": content,
      },
    ],
  };
  const req = new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  return await fetch(req);
}

/**
 * Send template email to single user
 * 
 * @returns 
 */
export async function sendEmailTemplate({ email, subject, templateID, data }) {
  const url = 'https://api.sendgrid.com/v3/mail/send';
  const payload = {
    "personalizations": [{
      "to": [{ "email": email }],
      "dynamic_template_data": data,
    }],
    "from": { "email": SENDER_ADDRESS },
    "subject": subject,
    "template_id": templateID,
  };
  const req = new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  return await fetch(req);
}