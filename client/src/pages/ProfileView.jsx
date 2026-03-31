import { useEffect, useState } from "react";
import "../css/profile-view.css";

const defaultPhoto =
  "https://via.placeholder.com/400x400.png?text=Profile";

export default function ProfileView() {
  const [profile, setProfile] = useState({
    photo: "",
    fullname: "",
    role: "",
    email: localStorage.getItem("email") || "",
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
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");

    if (!email) {
      setError("No logged-in user found.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const user = data[0];

          const loadedProfile = {
            photo: user.photo || "",
            fullname: user.fullname || "",
            role: user.role || "",
            email: user.email || email,
            whatsapp: user.whatsapp || "",
            organization: user.organization || "",
            specialization: user.specialization || "",
            oldPassword: "",
            newPassword: "",
          };

          setProfile(loadedProfile);
          setOriginalProfile(loadedProfile);

          localStorage.setItem("name", user.fullname || "");
          localStorage.setItem("photo", user.photo || "");
        } else {
          setError("Profile not found.");
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("PROFILE LOAD ERROR:", err);
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, []);

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

    const response = await fetch("http://localhost:5000/api/profile/upload-photo", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success === true) {
      setProfile((prev) => ({
        ...prev,
        photo: data.photoUrl,
      }));
    } else {
      setError("Failed to upload photo.");
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
      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: profile.email,
          photo: profile.photo,
          fullname: profile.fullname,
          role: profile.role,
          whatsapp: profile.whatsapp,
          organization: profile.organization,
          specialization: profile.specialization,
        }),
      });

      const data = await response.json();

      if (data.success === true) {
        const savedProfile = {
          ...profile,
          oldPassword: "",
          newPassword: "",
        };

        setOriginalProfile(savedProfile);
        setProfile(savedProfile);

        localStorage.setItem("name", profile.fullname || "");
        localStorage.setItem("photo", profile.photo || "");
        localStorage.setItem("email", profile.email || "");

        setMessage("Profile updated successfully.");
        setShowPrompt(true);
        setIsEditing(false);

        setTimeout(() => {
          setShowPrompt(false);
        }, 2500);
      } else {
        setError("Failed to update profile.");
      }
    } catch (err) {
      console.error("PROFILE SAVE ERROR:", err);
      setError("Server error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setMessage("");
    setError("");

    if (!profile.oldPassword || !profile.newPassword) {
      setError("Please enter both old and new password.");
      setPasswordSaving(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: profile.email,
          oldPassword: profile.oldPassword,
          newPassword: profile.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success === true) {
        setMessage("Password changed successfully.");
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
          <h2 className="profile-card__title">Account Management</h2>

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
              {isEditing && (
                <button
                  type="button"
                  className="profile-photo-card__remove"
                  onClick={handleRemovePhoto}
                >
                  ×
                </button>
              )}
            </div>

            {isEditing && (
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
        </section>

        <section className="profile-card profile-card--right">
          <h2 className="profile-card__title">Profile Information</h2>

          {message && <p className="profile-status profile-status--success">{message}</p>}
          {error && <p className="profile-status profile-status--error">{error}</p>}

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
                  disabled={!isEditing}
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">Role</span>
                <select
                  name="role"
                  value={profile.role}
                  onChange={handleChange}
                  className="profile-field__input"
                  disabled={!isEditing}
                >
                  <option value="">Select role</option>
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                  <option value="Subscriber">Subscriber</option>
                </select>
              </label>

              <label className="profile-field">
                <span className="profile-field__label">Email</span>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="profile-field__input"
                  placeholder="Enter email"
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">Organization</span>
                <input
                  type="text"
                  name="organization"
                  value={profile.organization}
                  onChange={handleChange}
                  className="profile-field__input"
                  placeholder="Enter organization"
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                />
              </label>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing && (
              <button
                type="button"
                className="profile-btn profile-btn--ghost"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="profile-btn profile-btn--primary"
              disabled={saving}
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}