import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/http.js";
import { prefixedId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

function toPublicLead(lead: any) {
  return {
    lead_id: lead.leadId,
    company: lead.company,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    volume: lead.volume,
    message: lead.message,
    status: lead.status,
    created_at: lead.createdAt,
  };
}

export async function createLead(input: {
  company: string;
  name: string;
  email: string;
  phone: string;
  volume?: string;
  message?: string;
}) {
  const lead = await prisma.b2BLead.create({
    data: {
      leadId: prefixedId("lead", 5),
      company: input.company,
      name: input.name,
      email: input.email.toLowerCase().trim(),
      phone: input.phone,
      volume: input.volume,
      message: input.message,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  });
  return toPublicLead(lead);
}

export async function listLeads() {
  const leads = await prisma.b2BLead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return leads.map(toPublicLead);
}

export async function updateLeadStatus(leadId: string, status = "new") {
  const lead = await prisma.b2BLead.update({ where: { leadId }, data: { status, updatedAt: nowIso() } }).catch(() => null);
  if (!lead) throw new AppError(404, "Not found");
  return { ok: true };
}
