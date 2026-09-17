import { prisma } from "@/lib/prisma";
import { toDbStatus } from "@/lib/approval-stages";

function parseCompositeId(compositeId) {
  const [type, ...rest] = compositeId.split(":");
  return { type, id: rest.join(":") };
}

export async function PATCH(request, { params }) {
  try {
    const { id: compositeId } = params;
    const { stage, actor } = await request.json();

    const dbStatus = toDbStatus(stage);
    if (!dbStatus) {
      return Response.json({ error: `Unknown stage "${stage}"` }, { status: 400 });
    }

    const { type, id } = parseCompositeId(compositeId);
    const now = new Date();
    const who = actor || "Admin";

    let recordLabel;

 
  if (type === "profile-edit") {
    const record = await prisma.businessProfileEdit.update({
      where: { id },
      data: {
        status: dbStatus,
        reviewedAt: dbStatus === "approved" || dbStatus === "draft" ? now : undefined,
        reviewedBy: dbStatus === "approved" ? who : undefined,
      },
      include: { businessProfile: { include: { business: true } } },
    });
    recordLabel = `${record.businessProfile?.business?.businessName || "Business"} — profile update`;
  } else if (type === "offer") {
    const record = await prisma.offer.update({
      where: { id },
      data: {
        status: dbStatus,
        approvedAt: dbStatus === "approved" ? now : undefined,
        approvedBy: dbStatus === "approved" ? who : undefined,
      },
    });
    recordLabel = `Offer: ${record.title}`;
  } else if (type === "directory-listing") {
    const record = await prisma.directoryListing.update({
      where: { id },
      data: {
        status: dbStatus,
        approvedAt: dbStatus === "approved" ? now : undefined,
        approvedBy: dbStatus === "approved" ? who : undefined,
      },
    });
    recordLabel = `Directory listing: ${record.businessName}`;
  } else if (type === "directory-listing-edit") {
    const editRecord = await prisma.directoryListingEdit.findUnique({ where: { id } });
    if (!editRecord) {
      return Response.json({ error: "Edit not found." }, { status: 404 });
    }

    if (dbStatus === "approved") {
      await prisma.directoryListing.update({
        where: { id: editRecord.directoryListingId },
        data: editRecord.changes,
      });
    }

    const record = await prisma.directoryListingEdit.update({
      where: { id },
      data: {
        status: dbStatus,
        reviewedAt: dbStatus === "approved" || dbStatus === "draft" ? now : undefined,
        reviewedBy: dbStatus === "approved" ? who : undefined,
      },
    });
    recordLabel = `Directory listing edit: ${record.id}`;
  } else {
    return Response.json({ error: `Unknown item type "${type}"` }, { status: 400 });
  }

    // Addendum §18 — record who changed what and when
    await prisma.auditLog.create({
      data: {
        actor: who,
        action: `moved to "${stage}"`,
        recordLabel,
      },
    });

    return Response.json({ item: { id: compositeId, stage } });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to update approval item" }, { status: 500 });
  }
}