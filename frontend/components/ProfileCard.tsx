import { ProfileResponse } from "@/lib/api";
import { MapPin } from "lucide-react";

export default function ProfileCard({ profile }: { profile: ProfileResponse }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-gray-200 shadow-xl">
      <img
        src={profile.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.userId}`}
        alt={profile.displayName}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 text-white">
        <h2 className="text-2xl font-bold">
          {profile.displayName}, {profile.age}
        </h2>
        {profile.city && (
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-200">
            <MapPin size={14} /> {profile.city}
          </p>
        )}
        {profile.bio && <p className="mt-2 line-clamp-2 text-sm text-gray-100">{profile.bio}</p>}
        {profile.interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 5).map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
