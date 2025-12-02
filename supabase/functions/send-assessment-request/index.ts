import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssessmentRequestPayload {
  email: string;
  results: {
    category: string;
    name: string;
    score: number;
    average: string;
  }[];
  overallScore: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, results, overallScore }: AssessmentRequestPayload = await req.json();

    console.log("Sending assessment request email for:", email);

    // Format results for email
    const resultsHtml = results.map(r => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${r.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${r.score}%</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${r.average}/5</td>
      </tr>`
    ).join('');

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "TeamHealth <onboarding@resend.dev>",
      to: ["umbetova.a.t@gmail.com"],
      subject: `New Team Assessment Request from ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">New Team Assessment Request</h1>
          <p>A new team assessment request has been submitted.</p>
          
          <h2>Customer Email:</h2>
          <p><a href="mailto:${email}">${email}</a></p>
          
          <h2>Assessment Results:</h2>
          <p><strong>Overall Score: ${overallScore}%</strong></p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; text-align: left;">Category</th>
                <th style="padding: 8px; text-align: center;">Score</th>
                <th style="padding: 8px; text-align: center;">Average</th>
              </tr>
            </thead>
            <tbody>
              ${resultsHtml}
            </tbody>
          </table>
          
          <p style="margin-top: 24px; color: #666;">
            Please follow up with this customer regarding the €29 team assessment package.
          </p>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation to customer
    const customerEmailResponse = await resend.emails.send({
      from: "TeamHealth <onboarding@resend.dev>",
      to: [email],
      subject: "Your Team Health Assessment Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Thank You for Your Interest!</h1>
          <p>We've received your request for a full team assessment.</p>
          
          <h2>Your Individual Results:</h2>
          <p><strong>Overall Score: ${overallScore}%</strong></p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; text-align: left;">Category</th>
                <th style="padding: 8px; text-align: center;">Score</th>
                <th style="padding: 8px; text-align: center;">Average</th>
              </tr>
            </thead>
            <tbody>
              ${resultsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="margin-top: 0;">What's Next?</h3>
            <p>Our team will contact you shortly with details about the full team assessment package (€29), which includes:</p>
            <ul>
              <li>Team-wide survey for all members</li>
              <li>Aggregated analysis of all responses</li>
              <li>Detailed action recommendations</li>
            </ul>
          </div>
          
          <p style="margin-top: 24px; color: #666;">
            Best regards,<br>
            The TeamHealth Team
          </p>
        </div>
      `,
    });

    console.log("Customer email sent:", customerEmailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-assessment-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
