import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCachedUser, getCurrentUser, updateProfile } from "../../services/authService";
import { isValidUsername } from "../../utils/validators";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read selected image"));
    reader.readAsDataURL(file);
  });
}

function ProfileSetup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [initialImage, setInitialImage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const cached = getCachedUser();
    if (cached && mounted) {
      const cachedName = cached.username || "";
      const cachedImage = cached.profileImage || "";
      setUsername(cachedName);
      setInitialUsername(cachedName);
      setPreviewImage(cachedImage);
      setInitialImage(cachedImage);
    }

    async function loadUser() {
      try {
        const response = await getCurrentUser();
        if (!mounted || !response?.data) return;
        const liveName = response.data.username || "";
        const liveImage = response.data.profileImage || "";
        setUsername(liveName);
        setInitialUsername(liveName);
        setPreviewImage(liveImage);
        setInitialImage(liveImage);
      } catch {
        // Keep cached values as fallback.
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleFileChange(e) {
    setSubmitError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please choose an image file.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setSubmitError("Image must be 1MB or smaller.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setPreviewImage(dataUrl);
    } catch (error) {
      setSubmitError(error.message || "Could not load image.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      setSubmitError("Username is required.");
      return;
    }

    if (!isValidUsername(normalizedUsername)) {
      setSubmitError("Username must be 3-20 characters and can only contain letters, numbers, and underscores.");
      return;
    }

    if (!previewImage && !initialImage) {
      setSubmitError("Please choose your profile image first.");
      return;
    }

    const payload = {};
    if (normalizedUsername !== initialUsername) {
      payload.username = normalizedUsername;
    }

    if (previewImage && previewImage !== initialImage) {
      payload.profileImage = previewImage;
    }

    if (!payload.username && !payload.profileImage) {
      navigate("/");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProfile(payload);
      navigate("/");
    } catch (error) {
      setSubmitError(error.message || "Could not save profile image.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/5 bg-light-gray/95 px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-10 sm:py-10">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-vibrant-mint-green sm:text-5xl">TypeRush</h1>
          <p className="paragraph-muted-sm mt-4 text-[0.78rem] font-medium tracking-[0.22em]">SET USERNAME AND PROFILE PHOTO</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center gap-5">
          <div className="w-full">
            <label htmlFor="profile-username" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 dark:text-white/45">
              Username
            </label>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="h-12 w-full rounded-xl border border-white/4 bg-panel px-4 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-500 dark:placeholder:text-slate-300 focus:border-white/10 focus:bg-[#232933]"
            />
          </div>

          <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-vibrant-mint-green/70 bg-white">
            {previewImage ? (
              <img src={previewImage} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-4xl text-slate-600 dark:text-slate-300">
                <i className="fa-solid fa-user" aria-hidden="true" />
              </div>
            )}
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-vibrant-mint-green/50 px-5 py-2.5 text-sm font-semibold text-vibrant-mint-green transition hover:bg-vibrant-mint-green hover:text-dark-mint-green">
            Choose From Your Device
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {submitError && <p className="text-center text-xs font-semibold text-red-400">{submitError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-2xl bg-linear-to-r from-light-mint-green to-vibrant-mint-green p-4 text-base font-black tracking-tight text-dark-mint-green shadow-[0_16px_35px_rgba(0,252,154,0.24)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "SAVING..." : "SAVE PROFILE"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;
