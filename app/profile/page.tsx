"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Mail,
  Edit2,
  Save,
  X,
  Calendar,
  Film,
  Tv,
  Clock,
  Bookmark,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStore } from "@/lib/store";

export default function ProfilePage() {
  const { profile, stats, isLoading, updateProfile } = useUserProfile();
  const user = useUserStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      username: profile?.username || "",
      bio: profile?.bio || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 pt-24">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-20 pt-24">
        <p className="text-muted-foreground">
          Please sign in to view your profile.
        </p>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="container mx-auto px-4 pb-10 pt-20 md:pt-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-montserrat font-bold">
          Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and view your activity
        </p>
      </div>

      {/* Profile Card */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            {/* Avatar and Basic Info */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.full_name?.[0]?.toUpperCase() ||
                    profile.username?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase() ||
                    "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-montserrat font-bold">
                    {profile.full_name || profile.username || "User"}
                  </h2>
                  <div className="flex items-center gap-1 text-muted-foreground mt-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            {/* Bio */}
            {!isEditing && profile.bio && (
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Member Since */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Calendar className="w-4 h-4" />
              <span>Member since {memberSince}</span>
            </div>

            {/* Edit Mode */}
            {isEditing && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Full Name
                  </label>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Username
                  </label>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                    size="sm"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          {/* Movies Watched */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Movies Watched
                </p>
                <p className="text-2xl font-bold">
                  {stats?.totalMoviesWatched || 0}
                </p>
              </div>
              <Film className="w-8 h-8 text-primary/50" />
            </div>
          </div>

          {/* Series Watched */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Series Watched
                </p>
                <p className="text-2xl font-bold">
                  {stats?.totalSeriesWatched || 0}
                </p>
              </div>
              <Tv className="w-8 h-8 text-primary/50" />
            </div>
          </div>

          {/* Total Hours */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Hours Watched
                </p>
                <p className="text-2xl font-bold">{stats?.totalHours || 0}h</p>
              </div>
              <Clock className="w-8 h-8 text-primary/50" />
            </div>
          </div>

          {/* Watchlist */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  In Watchlist
                </p>
                <p className="text-2xl font-bold">
                  {stats?.watchlistCount || 0}
                </p>
              </div>
              <Bookmark className="w-8 h-8 text-primary/50" />
            </div>
          </div>

          {/* Favorites */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Favorites</p>
                <p className="text-2xl font-bold">
                  {stats?.favoritesCount || 0}
                </p>
              </div>
              <Heart className="w-8 h-8 text-primary/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
