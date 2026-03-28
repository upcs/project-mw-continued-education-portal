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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

          setProfile((prev) => ({
            ...prev,
            photo: user.photo || "",
            fullname: user.fullname || "",
            role: user.role || "",
            email: user.email || email,
            whatsapp: user.whatsapp || "",
            organization: user.organization || "",
            specialization: user.specialization || "",
          }));

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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setProfile((prev) => ({
      ...prev,
      photo: imageUrl,
    }));

    setMessage("");
    setError("");
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({
      ...prev,
      photo: "",
    }));
    setMessage("");
    setError("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
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
        localStorage.setItem("name", profile.fullname || "");
        localStorage.setItem("photo", profile.photo || "");
        localStorage.setItem("email", profile.email || "");

        setMessage("Profile updated successfully.");
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
              <button
                type="button"
                className="profile-photo-card__remove"
                onClick={handleRemovePhoto}
              >
                ×
              </button>
            </div>

            <label className="profile-photo-card__upload">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                hidden
              />
            </label>
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
                />
              </label>

              <label className="profile-field">
                <span className="profile-field__label">Role</span>
                <select
                  name="role"
                  value={profile.role}
                  onChange={handleChange}
                  className="profile-field__input"
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
                />
              </label>
            </div>
          </div>

          <div className="profile-actions">
            <button
              type="submit"
              className="profile-btn profile-btn--primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}