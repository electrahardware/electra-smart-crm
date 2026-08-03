import { Eye, MessageCircle, Pencil, Phone, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Lead } from "../../types/lead";
import { canEditLead, isOwnerOrManager } from "../../utils/auth";
import StatusBadge from "./StatusBadge";

interface Props { lead: Lead; index: number; selected: boolean; onToggle: () => void; onView: () => void; onEdit: () => void; onDelete: () => void; }
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat("en-GB").format(new Date(value)).replace(/\//g, "-") : "—";

export default function LeadRow({ lead, index, selected, onToggle, onView, onEdit, onDelete }: Props) {
  const canDelete = isOwnerOrManager(); const canEdit = canEditLead();
  const lastEditAge = (() => { if (!lead.lastEditedAt) return ""; const days = Math.floor((new Date(new Date().setHours(0,0,0,0)).getTime() - new Date(new Date(lead.lastEditedAt).setHours(0,0,0,0)).getTime()) / 86400000); if (days <= 0) return "bg-emerald-50 text-emerald-700 ring-emerald-100"; if (days >= 2 && days <= 3) return "bg-amber-50 text-amber-700 ring-amber-100"; if (days >= 7) return "bg-red-50 text-red-700 ring-red-100"; return "bg-zinc-100 text-zinc-600 ring-zinc-200"; })();
  const numbers = [lead.mobile, lead.secondaryMobile, lead.whatsapp].map((value) => value?.trim()).filter((value): value is string => Boolean(value)).filter((value, itemIndex, array) => array.indexOf(value) === itemIndex);
  const initials = (lead.customerName || lead.shopName || "?").trim().slice(0, 2).toUpperCase();
  async function copy(event: React.MouseEvent<HTMLButtonElement>, mobile: string) { event.stopPropagation(); try { await navigator.clipboard.writeText(mobile); toast.success("Mobile number copied"); } catch { toast.error("Unable to copy mobile number"); } }

  return <tr onClick={onView} onDoubleClick={(event) => { event.stopPropagation(); onEdit(); }} className={`group cursor-pointer border-b border-zinc-100 transition-all duration-200 ${selected ? "bg-red-50/70" : index % 2 ? "bg-zinc-50/65" : "bg-white"} hover:bg-red-50/70`}>
    <td className="px-4 py-4"><input aria-label={`Select ${lead.customerName || lead.mobile}`} type="checkbox" checked={selected} onClick={(event) => event.stopPropagation()} onChange={onToggle} /></td>
    <td className="px-4 py-4"><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white ring-4 ring-zinc-100">{initials}</span><div className="min-w-0"><p className="truncate font-semibold text-zinc-900 group-hover:text-[#be171d]">{lead.customerName || "Unnamed lead"}</p><div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">{numbers.map((mobile) => <button key={mobile} title="Copy mobile number" onClick={(event) => copy(event, mobile)} className="font-medium text-zinc-600 hover:text-[#e31e24] hover:underline">{mobile}</button>)}<span className="text-zinc-300">•</span><span>{formatDate(lead.leadDate || lead.createdAt)}</span></div></div></div></td>
    <td className="max-w-[180px] px-4 py-4 text-sm font-medium text-zinc-700"><span className="line-clamp-2">{lead.shopName || "—"}</span></td>
    <td className="px-4 py-4 text-sm text-zinc-600">{lead.city || "—"}</td>
    <td className="px-4 py-4"><span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"><i className="h-1.5 w-1.5 rounded-full bg-[#e31e24]" />{lead.leadOwner || "Unassigned"}</span></td>
    <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
    <td className="px-4 py-4">{lead.lastEditedAt ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${lastEditAge}`}>{formatDate(lead.lastEditedAt)}</span> : <span className="text-sm text-zinc-400">—</span>}</td>
    <td className="px-4 py-4 text-sm text-zinc-600">{lead.followupDate ? <div><p className="font-medium text-zinc-800">{formatDate(lead.followupDate)}</p><p className="mt-0.5 text-xs text-zinc-500">{lead.followupTime || "Scheduled"}</p></div> : "—"}</td>
    <td className="px-4 py-4"><div className="flex items-center justify-end gap-1 opacity-75 transition group-hover:opacity-100"><a href={`tel:${lead.mobile}`} onClick={(event) => event.stopPropagation()} className="rounded-lg p-2 text-zinc-600 hover:bg-red-50 hover:text-[#e31e24]" title="Call"><Phone size={16}/></a><a href={`https://wa.me/91${lead.mobile}`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="rounded-lg p-2 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700" title="WhatsApp"><MessageCircle size={16}/></a>{canEditLead() && <button onClick={(event) => { event.stopPropagation(); onView(); }} className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100" title="View"><Eye size={16}/></button>}{canEdit && <button onClick={(event) => { event.stopPropagation(); onEdit(); }} className="rounded-lg p-2 text-zinc-600 hover:bg-amber-50 hover:text-amber-700" title="Edit"><Pencil size={16}/></button>}{canDelete && <button onClick={(event) => { event.stopPropagation(); onDelete(); }} className="rounded-lg p-2 text-zinc-600 hover:bg-red-50 hover:text-[#e31e24]" title="Delete"><Trash2 size={16}/></button>}</div></td>
  </tr>;
}
