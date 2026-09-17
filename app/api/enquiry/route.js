import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// POST /api/enquiry
// Creates a reader enquiry against a Digital Partner's business profile.
// Flow per scope §12: Reader → Mara Platform → GHL → Business.
// Consent is required before any GHL forwarding can happen.
//
// Status lifecycle on Enquiry.status:
//   received          -> row created, nothing downstream attempted/succeeded yet
//   forwarded_to_ghl   -> GHL forward succeeded (email may or may not have)
//   failed             -> email send and/or GHL forward failed
//
// Any downstream failure is also written as an EngagementEvent
// (eventType: "enquiry_failed") so it shows up in the Analytics ->
// Enquiries tab funnel without a separate query.

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const LOGO_URL =
  "https://res.cloudinary.com/dbjwbveqn/image/upload/v1788288190/logo_sgvhbv.webp";

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Stub — replace with the real GHL contact/opportunity forward.
// Must return { ok: true, ghlContactId?, ghlOpportunityId? } on success,
// or throw / return { ok: false, error } on failure.
async function forwardToGhl(enquiry, profile) {
  // TODO: wire up actual GHL API call here.
  // Returning ok:true as a no-op stub so existing flow isn't blocked.
  return { ok: true, skipped: true };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      businessProfileId,
      publicationId,
      name,
      email,
      phone,
      message,
      consentGiven,
    } = body;

    console.log("[enquiry] request received for businessProfileId:", businessProfileId);

    if (!businessProfileId || !publicationId) {
      return NextResponse.json(
        { error: "Missing businessProfileId or publicationId." },
        { status: 400 }
      );
    }

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: "Consent is required to submit an enquiry." },
        { status: 400 }
      );
    }

    // NOTE: BusinessProfile has no `destination` relation — that field
    // lives on Destination, which isn't linked to BusinessProfile at all.
    // The publication tied to this enquiry comes from `publicationId`
    // (passed in the request body), so fetch it separately.
    const [profile, publication] = await Promise.all([
      prisma.businessProfile.findUnique({
        where: { id: businessProfileId },
        select: {
          business: { select: { businessName: true, email: true } },
        },
      }),
      prisma.publication.findUnique({
        where: { id: publicationId },
        select: { title: true },
      }),
    ]);

    const enquiry = await prisma.enquiry.create({
      data: {
        businessProfileId,
        publicationId,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        consentGiven: true,
        status: "received",
      },
    });
    console.log("[enquiry] enquiry created:", enquiry.id);

    await prisma.engagementEvent.create({
      data: {
        eventType: "enquiry_submitted",
        businessProfileId,
        publicationId,
        metadata: { enquiryId: enquiry.id },
      },
    });

    const businessEmail = profile?.business?.email;
    const businessName = profile?.business?.businessName || "your business";

    // Track each downstream step independently so a partial failure
    // (e.g. email sent, GHL failed) is still visible in the failure reason.
    const failures = [];

    if (businessEmail) {
      try {
        const safeName = escapeHtml(enquiry.name);
        const safeEmail = escapeHtml(enquiry.email);
        const safePhone = escapeHtml(enquiry.phone);
        const safeMessage = escapeHtml(enquiry.message);
        const safeBusinessName = escapeHtml(businessName);
        const safePublicationTitle = escapeHtml(publication?.title);

        const info = await transporter.sendMail({
          from: `"Mara Media" <${process.env.EMAIL_USER}>`,
          to: businessEmail,
          replyTo: enquiry.email,
          subject: `New enquiry for ${businessName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <div style="text-align:center; padding: 16px 0;">
                <img src="${LOGO_URL}" alt="Mara Media" style="height:36px; width:auto;" />
              </div>

              <h2 style="color: #1a3460;">New enquiry via Mara Media</h2>
              <p>You've received a new enquiry for <strong>${safeBusinessName}</strong>${
                safePublicationTitle ? ` (${safePublicationTitle})` : ""
              }.</p>

              <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                  <td style="padding:6px 0; color:#666; width:90px;">Name</td>
                  <td style="padding:6px 0;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#666;">Email</td>
                  <td style="padding:6px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
                </tr>
                ${
                  safePhone
                    ? `<tr>
                        <td style="padding:6px 0; color:#666;">Phone</td>
                        <td style="padding:6px 0;">${safePhone}</td>
                      </tr>`
                    : ""
                }
                ${
                  safeMessage
                    ? `<tr>
                        <td style="padding:6px 0; color:#666; vertical-align:top;">Message</td>
                        <td style="padding:6px 0;">${safeMessage}</td>
                      </tr>`
                    : ""
                }
              </table>

              <p style="color:#666;font-size:13px;">
                Reply directly to this email to respond to ${safeName}.
              </p>
            </div>
          `,
        });
        console.log("[enquiry] notification email sent:", info.messageId, info.response);
      } catch (mailErr) {
        console.error("[enquiry] FAILED to send notification email:", mailErr);
        failures.push({ step: "email", message: mailErr?.message || "Unknown email error" });
      }
    } else {
      console.log("[enquiry] no business email on file, skipping notification send");
      failures.push({ step: "email", message: "No business email on file" });
    }

    // GHL forward — only meaningful once consent has been given, which is
    // already enforced above.
    let ghlResult = null;
    try {
      ghlResult = await forwardToGhl(enquiry, profile);
      if (!ghlResult?.ok) {
        failures.push({ step: "ghl", message: ghlResult?.error || "GHL forward returned not-ok" });
      }
    } catch (ghlErr) {
      console.error("[enquiry] FAILED to forward to GHL:", ghlErr);
      failures.push({ step: "ghl", message: ghlErr?.message || "Unknown GHL error" });
      await prisma.ghlSyncLog.create({
        data: {
          eventType: "enquiry_forward",
          status: "failed",
          recordLabel: `Enquiry ${enquiry.id}`,
          maraRecordId: enquiry.id,
          errorMessage: ghlErr?.message || "Unknown GHL error",
        },
      });
    }

    // Resolve final status and persist it.
    let finalStatus = "received";
    if (failures.length > 0) {
      finalStatus = "failed";
    } else if (ghlResult?.ok && !ghlResult?.skipped) {
      finalStatus = "forwarded_to_ghl";
    }

    const updateData = { status: finalStatus };
    if (ghlResult?.ghlContactId) updateData.ghlContactId = ghlResult.ghlContactId;
    if (ghlResult?.ghlOpportunityId) updateData.ghlOpportunityId = ghlResult.ghlOpportunityId;
    if (finalStatus === "forwarded_to_ghl") updateData.forwardedAt = new Date();

    await prisma.enquiry.update({
      where: { id: enquiry.id },
      data: updateData,
    });

    if (failures.length > 0) {
      await prisma.engagementEvent.create({
        data: {
          eventType: "enquiry_failed",
          businessProfileId,
          publicationId,
          metadata: { enquiryId: enquiry.id, failures },
        },
      });
    }

    return NextResponse.json({ ok: true, enquiryId: enquiry.id, status: finalStatus });
  } catch (err) {
    console.error("[enquiry] create failed:", err);
    return NextResponse.json(
      { error: "Something went wrong submitting your enquiry." },
      { status: 500 }
    );
  }
}