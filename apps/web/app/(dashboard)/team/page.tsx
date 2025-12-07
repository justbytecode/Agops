"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Plus, 
  Mail, 
  Shield, 
  RefreshCw, 
  Trash2,
  Edit,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "MEMBER" });
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteForm.email || !inviteForm.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });

      if (res.ok) {
        toast.success("Team member invited successfully");
        setShowInviteDialog(false);
        setInviteForm({ name: "", email: "", role: "MEMBER" });
        fetchMembers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to invite member");
      }
    } catch (error) {
      toast.error("Failed to invite member");
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Team member removed");
        fetchMembers();
      }
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER": return <Badge className="bg-violet-500/20 text-violet-400 border-0">Owner</Badge>;
      case "ADMIN": return <Badge className="bg-blue-500/20 text-blue-400 border-0">Admin</Badge>;
      case "MEMBER": return <Badge className="bg-[#333] text-[#808080] border-0">Member</Badge>;
      case "VIEWER": return <Badge className="bg-[#2a2a2a] text-[#606060] border-0">Viewer</Badge>;
      default: return <Badge className="bg-[#333] text-[#808080] border-0">{role}</Badge>;
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return email[0].toUpperCase();
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Team Management</h2>
          <p className="text-[#808080]">Manage your team members and their access permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchMembers}
            className="bg-[#2a2a2a] border-[#333] text-[#808080] hover:text-white hover:bg-[#333]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-gray-100">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription className="text-[#808080]">
                  Send an invitation to add a new member to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="bg-[#222] border-[#333] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="bg-[#222] border-[#333] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full bg-[#222] border border-[#333] text-white rounded-lg px-3 py-2"
                  >
                    <option value="ADMIN">Admin - Full access</option>
                    <option value="MEMBER">Member - Can view and manage</option>
                    <option value="VIEWER">Viewer - Read-only access</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="bg-transparent border-[#333] text-[#808080]">
                  Cancel
                </Button>
                <Button onClick={inviteMember} disabled={isInviting} className="bg-white text-black hover:bg-gray-100">
                  {isInviting ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-[#e4ebf5] rounded-3xl p-5 text-slate-800">
          <p className="text-xs text-slate-500 mb-1">Total Members</p>
          <p className="text-3xl font-bold text-slate-900">{members.length}</p>
        </div>
        <div className="bg-[#f0e6ff] rounded-3xl p-5 text-purple-900">
          <p className="text-xs text-purple-600 mb-1">Admins</p>
          <p className="text-3xl font-bold">{members.filter(m => m.role === "ADMIN" || m.role === "OWNER").length}</p>
        </div>
        <div className="bg-[#e0f2e9] rounded-3xl p-5 text-emerald-900">
          <p className="text-xs text-green-600 mb-1">Members</p>
          <p className="text-3xl font-bold">{members.filter(m => m.role === "MEMBER").length}</p>
        </div>
        <div className="bg-[#fff9c4] rounded-3xl p-5 text-yellow-900">
          <p className="text-xs text-yellow-700 mb-1">Viewers</p>
          <p className="text-3xl font-bold">{members.filter(m => m.role === "VIEWER").length}</p>
        </div>
      </div>

      {/* Members Table */}
      <div className="border border-[#2a2a2a] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[#2a2a2a]">
          <h3 className="text-xl font-semibold text-white">Team Members</h3>
          <p className="text-[#808080] text-sm">All members in your organization with their roles and permissions.</p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#222] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-[#808080]">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No team members yet. Invite someone to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-[#606060] uppercase tracking-wide">
                    <th className="pb-4 w-12"></th>
                    <th className="pb-4">Name</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Joined</th>
                    <th className="pb-4">Last Active</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-4">
                        <Avatar className="h-9 w-9 border border-[#333]">
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs">
                            {getInitials(member.name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{member.name || "No name"}</span>
                          <span className="text-xs text-[#808080] flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {member.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-[#606060]" />
                          {getRoleBadge(member.role)}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-[#808080]">
                        {formatDate(member.createdAt)}
                      </td>
                      <td className="py-4 text-sm text-[#808080]">
                        {formatDate(member.lastLoginAt)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Edit" className="hover:bg-[#333]">
                            <Edit className="h-4 w-4 text-[#808080]" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Remove"
                            onClick={() => removeMember(member.id)}
                            disabled={member.role === "OWNER"}
                            className="hover:bg-[#333]"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
