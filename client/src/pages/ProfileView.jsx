import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/profile-view.css";
import API from "../api/api";

const defaultPhoto =
  "https://via.placeholder.com/400x400.png?text=Profile";

export default function ProfileView() {

  const [searchParams] = useSearchParams();
  const requestedEmail = searchParams.get("email");
  const isOwnProfile = !requestedEmail || requestedEmail === user?.email;
  const pageTitle = isOwnProfile ? "Account Management" : "User Information";

  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    photo: "",
    fullname: "",
    role: "",
    email: "",
    whatsapp: "",
    organization: "",
    specialization: "",
    oldPassword: "",
    newPassword: "",
  });

  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = isOwnProfile;
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      setMessage("");

      try {

        const endpoint = requestedEmail
        ? `/profile/view?email=${encodeURIComponent(requestedEmail)}`
        : "/profile/me";

        const response = await API.get(endpoint);

        const data = response.data;

        if (!data?.success) {
          setError(data.message || "Failed to load profile.");
          setLoading(false);
          return;
        }

        const userProfile = data.data;

        const loadedProfile = {
          photo: userProfile.photo || "",
          fullname: userProfile.fullname || "",
          role: userProfile.role || "",
          email: userProfile.email || user?.email || "",
          whatsapp: userProfile.whatsapp || "",
          organization: userProfile.organization || "",
          specialization: userProfile.specialization || "",
          oldPassword: "",
          newPassword: "",
        };

        setProfile(loadedProfile);
        setOriginalProfile(loadedProfile);

        localStorage.setItem("name", userProfile.fullname || "");
        localStorage.setItem("photo", userProfile.photo || "");

        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              fullname: userProfile.fullname || storedUser.fullname || "",
              photo: userProfile.photo || storedUser.photo || "",
              role: userProfile.role || storedUser.role || "",
              organization:
                userProfile.organization || storedUser.organization || "",
              whatsapp: userProfile.whatsapp || storedUser.whatsapp || "",
              specialization:
                userProfile.specialization || storedUser.specialization || "",
            })
          );
        }

        if (setUser) {
          setUser((prev) => ({
            ...(prev || {}),
            fullname: userProfile.fullname || prev?.fullname || "",
            photo: userProfile.photo || prev?.photo || "",
            role: userProfile.role || prev?.role || "",
            organization: userProfile.organization || prev?.organization || "",
            whatsapp: userProfile.whatsapp || prev?.whatsapp || "",
            specialization:
              userProfile.specialization || prev?.specialization || "",
          }));
        }
      } catch (err) {
        console.error("PROFILE LOAD ERROR:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [setUser, user?.email, user?.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessage("");
    setError("");

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await API.post("/profile/upload-photo", formData);

      const data = response.data;

      if (data?.success) {
        setProfile((prev) => ({
          ...prev,
          photo: data.photoUrl,
        }));

        localStorage.setItem("photo", data.photoUrl || "");

        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              photo: data.photoUrl,
            })
          );
        }

        if (setUser) {
          setUser((prev) => ({
            ...(prev || {}),
            photo: data.photoUrl,
          }));
        }

        setMessage("Photo uploaded successfully.");
      } else {
        setError(data.message || "Failed to upload photo.");
      }
    } catch (err) {
      console.error("PHOTO UPLOAD ERROR:", err);
      setError("Server error while uploading photo.");
    }
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({
      ...prev,
      photo: "",
    }));
    setMessage("");
    setError("");
  };

  const handleCancelEdit = () => {
    if (originalProfile) {
      setProfile({
        ...originalProfile,
        oldPassword: "",
        newPassword: "",
      });
    }
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      setMessage("");
      setError("");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post("/profile/update", {
          photo: profile.photo,
          fullname: profile.fullname,
          whatsapp: profile.whatsapp,
          specialization: profile.specialization,
        });
      

        const data = response.data;

        if (data?.success) {
        const savedProfile = {
          ...profile,
          oldPassword: "",
          newPassword: "",
        };

        setOriginalProfile(savedProfile);
        setProfile(savedProfile);

        localStorage.setItem("name", profile.fullname || "");
        localStorage.setItem("photo", profile.photo || "");

        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              fullname: profile.fullname || "",
              photo: profile.photo || "",
              whatsapp: profile.whatsapp || "",
              organization: profile.organization || "",
              specialization: profile.specialization || "",
            })
          );
        }

        if (setUser) {
          setUser((prev) => ({
            ...(prev || {}),
            fullname: profile.fullname || "",
            photo: profile.photo || "",
            whatsapp: profile.whatsapp || "",
            organization: profile.organization || "",
            specialization: profile.specialization || "",
          }));
        }

        setMessage("Profile updated successfully.");
        setShowPrompt(true);
        setIsEditing(false);

        setTimeout(() => {
          setShowPrompt(false);
        }, 2500);
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("PROFILE SAVE ERROR:", err);
      setError("Server error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordSaving(true);
    setMessage("");
    setError("");

    if (!profile.oldPassword || !profile.newPassword) {
      setError("Please enter both old and new password.");
      setPasswordSaving(false);
      return;
    }

    try {
      const response = await API.post("/profile/change-password", {
          oldPassword: profile.oldPassword,
          newPassword: profile.newPassword,
        });

        const data = response.data;

        if (data?.success) {
        setMessage(data.message || "Password changed successfully.");
        setProfile((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
        }));
      } else {
        setError(data.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("PASSWORD CHANGE ERROR:", err);
      setError("Server error while changing password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="profile-view">
        <div className="profile-card">
          <h2 className="profile-card__title">Loading profile...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-view">
      {showPrompt && (
        <div className="profile-success-toast">
          <div className="profile-success-toast__icon">✓</div>
          <div>
            <p className="profile-success-toast__title">Changes Saved</p>
            <p className="profile-success-toast__text">
              Your profile has been updated successfully.
            </p>
          </div>
        </div>
      )}

      <form className="profile-view__grid" onSubmit={handleSaveProfile}>
        <section className="profile-card profile-card--left">
          <h2 className="profile-card__title">{pageTitle}</h2>

          <div className="profile-photo-card">
            <div className="profile-photo-card__image-wrap">
              <img
                src={profile.photo || defaultPhoto}
                alt={profile.fullname || "Profile"}
                className="profile-photo-card__image"
                onError={(e) => {
                  e.currentTarget.src = defaultPhoto;
                }}
              />
              {isEditing && canEdit && (
                <button
                  type="button"
                  className="profile-photo-card__remove"
                  onClick={handleRemovePhoto}
                >
                  ×
                </button>
              )}
            </div>

            {isEditing && canEdit && (
              <label className="profile-photo-card__upload">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  hidden
                />
              </label>
            )}
          </div>
        {canEdit && (
          <div className="profile-password-box">
            <label className="profile-field">
              <span className="profile-field__label">Old Password</span>
              <input
                type="password"
                name="oldPassword"
                value={profile.oldPassword}
                onChange={handleChange}
                className="profile-field__input"
                placeholder="Enter old password"
              />
            </label>

            <label className="profile-field">
              <span className="profile-field__label">New Password</span>
              <input
                type="password"
                name="newPassword"
                value={profile.newPassword}
                onChange={handleChange}
                className="profile-field__input"
                placeholder="Enter new password"
              />
            </label>

            <button
              type="button"
              className="profile-btn profile-btn--secondary"
              onClick={handlePasswordChange}
              disabled={passwordSaving}
            >
              {passwordSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
          )}
        </section>

        <section className="profile-card profile-card--right">
          <h2 className="profile-card__title">Profile Information</h2>

          {message && (
            <p className="profile-status profile-status--success">{message}</p>
          )}
          {error && (
            <p className="profile-status profile-status--error">{error}</p>
          )}

          <div className="profile-section">
            <div className="profile-fields-grid">
              <label className="profile-field">
                <span className="profile-field__label">Full Name</span>
                <input
                  type="text"
                  name="fullname"
                  value={profile.fullname}
                  onChange={handleChange}
                  className="profile-field__input"
                  placeholder="Enter full name"
                  disabled={!isEditing || !canEdit}
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">Role</span>
                <input
                  type="text"
                  name="role"
                  value={profile.role}
                  className="profile-field__input"
                  disabled
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">Email</span>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  className="profile-field__input"
                  disabled
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">WhatsApp</span>
                <input
                  type="text"
                  name="whatsapp"
                  value={profile.whatsapp}
                  onChange={handleChange}
                  className="profile-field__input"
                  placeholder="Enter WhatsApp number"
                  disabled={!isEditing || !canEdit}
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">Organization</span>
                <input
                  type="text"
                  name="organization"
                  value={profile.organization}
                  className="profile-field__input"
                  disabled
                  readOnly
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">Specialization</span>
                <input
                  type="text"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  className="profile-field__input"
                  placeholder="Enter specialization"
                  disabled={!isEditing || !canEdit}
                />
              </label>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing && canEdit && (
              <button
                type="button"
                className="profile-btn profile-btn--ghost"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
            {canEdit && (
            <button
              type="submit"
              className="profile-btn profile-btn--primary"
              disabled={saving}
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
            </button>
            )}

          </div>
        </section>
      </form>
    </main>
  );
}