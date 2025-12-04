import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailPayload {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailPayload = await req.json();

    console.log("Sending contact email from:", email);

    // Send email to admin
    const emailResponse = await resend.emails.send({
      from: "TeamHealth Contact <onboarding@resend.dev>",
      to: ["umbetova.a.t@gmail.com"],
      subject: `Team Coaching Inquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">New Team Coaching Inquiry</h1>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          </div>
          
          <h2>Message:</h2>
          <div style="background-color: #fff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="margin-top: 24px; color: #666;">
            This message was sent via the TeamHealth contact form.
          </p>
        </div>
      `,
    });

    console.log("Contact email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
